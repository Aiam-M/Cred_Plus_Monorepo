/**
 * Serviço para as mensagens de interesse que empresas enviam ao produtor.
 *
 * Os interesses NÃO ficam no IndexedDB porque não são necessários offline:
 * são comunicações em tempo real. Quando o produtor está offline, mostramos
 * uma mensagem amigável; quando volta a internet, o app busca a lista atual
 * diretamente do backend.
 */

import { logoutPorExpiracao, TOKEN_KEY } from '@/services/authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** Formato do interesse retornado pelo backend (GET /cred/produtor/interesses). */
export interface InteresseRecebido {
  id: number;
  safraId: number;
  safraNome: string;
  nomeEmpresa: string;
  mensagem: string | null;
  data: string; // ISO datetime
  status: string;
  lida: boolean;
}

/** Resposta da contagem de não lidos. */
export interface ContagemNaoLidos {
  naoLidos: number;
}

/**
 * Helper interno: monta os headers comuns (Authorization).
 * Centralizar evita esquecer o token em alguma chamada.
 */
function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Helper interno: trata 401/403 deslogando o usuário.
 * Lança Error com mensagem amigável para os outros casos.
 */
function handleAuthErrors(response: Response, mensagemPadrao: string): void {
  if (response.status === 401 || response.status === 403) {
    logoutPorExpiracao();
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) {
    throw new Error(mensagemPadrao);
  }
}

/**
 * Busca todas as mensagens de interesse recebidas pelo produtor autenticado.
 *
 * @returns lista de interesses, do mais recente ao mais antigo
 * @throws Error em caso de falha de rede ou resposta inválida
 */
export async function fetchInteressesRecebidos(): Promise<InteresseRecebido[]> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cred/produtor/interesses`, {
      headers: buildHeaders(),
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  handleAuthErrors(response, 'Não foi possível carregar suas mensagens.');
  return response.json();
}

/**
 * Conta as mensagens não lidas pelo produtor.
 * Usado para o badge de novas mensagens no Dashboard.
 *
 * @returns número de mensagens não lidas (0 ou mais)
 */
export async function fetchContagemNaoLidos(): Promise<number> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cred/produtor/interesses/contagem-nao-lidos`, {
      headers: buildHeaders(),
    });
  } catch {
    // Falha silenciosa: o badge é informativo, não pode quebrar o Dashboard.
    return 0;
  }

  if (response.status === 401 || response.status === 403) {
    logoutPorExpiracao();
    return 0;
  }
  if (!response.ok) {
    return 0;
  }

  const data: ContagemNaoLidos = await response.json();
  return data.naoLidos ?? 0;
}

/**
 * Marca uma mensagem como lida no servidor.
 *
 * Falhas são engolidas em silêncio (a interface já mostra a mensagem como
 * lida localmente). Se o backend não receber o PATCH agora, o produtor verá
 * o badge desaparecer só na próxima vez que recarregar — aceitável.
 *
 * @param interesseId id da mensagem
 */
export async function marcarComoLida(interesseId: number): Promise<void> {
  try {
    const response = await fetch(
      `${BASE_URL}/cred/produtor/interesses/${interesseId}/lida`,
      { method: 'PATCH', headers: buildHeaders() },
    );

    // 401/403 são tratados, mas erros 4xx/5xx outros são ignorados de propósito
    // — o usuário não precisa ver "falha ao marcar como lida".
    if (response.status === 401 || response.status === 403) {
      logoutPorExpiracao();
    }
  } catch {
    // Sem rede: ignora. Na próxima abertura, o backend ainda mostra como não lida.
  }
}
