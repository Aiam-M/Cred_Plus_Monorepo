import { safraRepo } from '@/db/db';
import type { Safra } from '@/data/mockData';
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

  for (const resultado of data.resultados ?? []) {
    if (resultado.status === 'SINCRONIZADO' || resultado.status === 'JA_SINCRONIZADO') {
      await safraRepo.update(resultado.localId, {
        status: 'AGUARDANDO_VALIDACAO_SATELITE',
        syncedAt: new Date().toISOString(),
      });
      enviadas++;
    }
  }

  return { enviadas };
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
