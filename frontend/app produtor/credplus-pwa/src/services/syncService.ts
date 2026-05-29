import { safraRepo } from '@/db/db';
import type { Safra, SafraImagem } from '@/data/mockData';
import { logoutPorExpiracao } from '@/services/authService';

/**
 * Serviço de sincronização offline → servidor.
 *
 * Fluxo: busca as safras pendentes no banco local (IndexedDB), envia em lote
 * para o backend e, conforme a resposta, atualiza o status local.
 *
 * IMPORTANTE: o endpoint POST /cred/sync ainda não existe no backend.
 * Enquanto isso, deixamos o envio em MODO SIMULADO para o app continuar
 * funcionando. Quando o backend estiver pronto, basta trocar BACKEND_PRONTO
 * para true — o código de envio real já está abaixo.
 */
const BACKEND_PRONTO = true;

// URL base da API. Em produção, defina VITE_API_BASE_URL com a URL do backend.
// Em dev, fica vazio e o proxy do Vite redireciona para o backend local.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ResultadoSync {
  enviadas: number;
  erro?: string;
}

/**
 * Monta o corpo que o backend espera para cada safra.
 * O `localId` é o id do celular — chave de idempotência: se o servidor já
 * recebeu uma safra com esse id, ele ignora em vez de duplicar.
 */
function toSyncPayload(safra: Safra) {
  return {
    localId: safra.id,
    nome: safra.nome,
    areaHectares: safra.areaHectares,
    plantacoes: safra.plantacoes.map((p) => ({
      tipo: p.tipo,
      quantidade: p.quantidade,
      unidade: p.unidade,
    })),
  };
}

/**
 * Sincroniza as safras pendentes com o servidor.
 * Nunca lança exceção: erros de rede são capturados e as safras continuam
 * pendentes para uma próxima tentativa.
 * @returns quantas safras foram sincronizadas (e um erro amigável, se houver)
 */
export async function sincronizar(): Promise<ResultadoSync> {
  if (!navigator.onLine) {
    return { enviadas: 0 };
  }

  const pendentes = await safraRepo.getPendentesSync();
  if (pendentes.length === 0) {
    return { enviadas: 0 };
  }

  if (!BACKEND_PRONTO) {
    return sincronizarSimulado(pendentes);
  }

  return sincronizarReal(pendentes);
}

/**
 * Envio real para o backend (POST /cred/sync). Ativado quando BACKEND_PRONTO = true.
 */
async function sincronizarReal(pendentes: Safra[]): Promise<ResultadoSync> {
  const token = localStorage.getItem('cred_token');

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cred/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ safras: pendentes.map(toSyncPayload) }),
    });
  } catch {
    return { enviadas: 0, erro: 'Sem conexão com o servidor.' };
  }

  // Token expirado ou inválido: desloga o usuário e redireciona para o login.
  if (response.status === 401 || response.status === 403) {
    logoutPorExpiracao();
    return { enviadas: 0, erro: 'Sessão expirada. Faça login novamente.' };
  }

  if (!response.ok) {
    return { enviadas: 0, erro: `Erro ${response.status} ao sincronizar.` };
  }

  // Resposta esperada: { resultados: [{ localId, status, servidorId }] }
  const data = await response.json();
  let enviadas = 0;

  // Mapa para reencontrar a safra local (com as fotos em base64) pelo localId.
  const porLocalId = new Map(pendentes.map((s) => [s.id, s]));

  for (const resultado of data.resultados ?? []) {
    if (resultado.status === 'SINCRONIZADO' || resultado.status === 'JA_SINCRONIZADO') {
      await safraRepo.update(resultado.localId, {
        status: 'AGUARDANDO_VALIDACAO_SATELITE',
        syncedAt: new Date().toISOString(),
        servidorId: resultado.servidorId,
      });

      // Com a safra já no servidor, enviamos as fotos guardadas no celular.
      const safraLocal = porLocalId.get(resultado.localId);
      if (safraLocal && typeof resultado.servidorId === 'number') {
        await enviarImagensDaSafra(safraLocal, resultado.servidorId, token);
      }

      enviadas++;
    }
  }

  return { enviadas };
}

/**
 * Converte uma imagem em base64 (data URI) num Blob, para poder enviar como arquivo.
 * As fotos ficam salvas no IndexedDB nesse formato (ex.: "data:image/jpeg;base64,...").
 */
function dataUriParaBlob(dataUri: string): Blob | null {
  const separador = dataUri.indexOf(',');
  if (separador === -1) return null;

  const cabecalho = dataUri.substring(0, separador);
  const base64 = dataUri.substring(separador + 1);
  const tipoMatch = cabecalho.match(/data:(.*?);base64/);
  const tipo = tipoMatch ? tipoMatch[1] : 'image/jpeg';

  try {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      bytes[i] = binario.charCodeAt(i);
    }
    return new Blob([bytes], { type: tipo });
  } catch {
    return null;
  }
}

/**
 * Envia ao backend as fotos de uma safra que ainda não foram enviadas.
 * Cada foto sobe uma vez; ao confirmar, marcamos `enviada=true` no banco local
 * para não reenviar na próxima sincronização (idempotência do lado do app).
 * Em caso de falha de rede ou erro, paramos e tentamos de novo na próxima sync.
 */
async function enviarImagensDaSafra(
  safra: Safra,
  servidorId: number,
  token: string | null,
): Promise<void> {
  if (!safra.imagens || safra.imagens.length === 0) return;

  const atualizadas: SafraImagem[] = [...safra.imagens];
  let mudou = false;

  for (let i = 0; i < atualizadas.length; i++) {
    const img = atualizadas[i];
    if (img.enviada) continue;

    const blob = dataUriParaBlob(img.uri);
    if (!blob) continue;

    const form = new FormData();
    // O nome do arquivo é só informativo; o backend ignora e valida pelos bytes.
    form.append('arquivo', blob, `safra-${servidorId}-${img.ordem}.jpg`);

    let resposta: Response;
    try {
      resposta = await fetch(`${BASE_URL}/cred/produtor/safras/${servidorId}/imagens`, {
        method: 'POST',
        // Sem Content-Type manual: o navegador define o boundary do multipart sozinho.
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
    } catch {
      break; // sem conexão: tenta as restantes na próxima sincronização
    }

    if (resposta.ok) {
      atualizadas[i] = { ...img, enviada: true };
      mudou = true;
    } else {
      break; // erro (401/403/servidor): para e tenta depois
    }
  }

  if (mudou) {
    await safraRepo.update(safra.id, { imagens: atualizadas });
  }
}

/**
 * Modo simulado: imita a resposta do servidor para a demonstração funcionar
 * enquanto o backend não existe. Marca as safras como sincronizadas localmente.
 */
async function sincronizarSimulado(pendentes: Safra[]): Promise<ResultadoSync> {
  // Pequena espera para simular a latência da rede.
  await new Promise((r) => setTimeout(r, 800));

  for (const safra of pendentes) {
    await safraRepo.update(safra.id, {
      status: 'AGUARDANDO_VALIDACAO_SATELITE',
      syncedAt: new Date().toISOString(),
    });
  }

  return { enviadas: pendentes.length };
}
