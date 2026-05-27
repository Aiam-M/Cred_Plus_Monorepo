/**
 * Serviço para buscar dados do produtor autenticado no backend.
 */

import { logoutPorExpiracao, TOKEN_KEY } from '@/services/authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** Formato do perfil retornado pelo backend (GET /cred/produtor/me). */
export interface PerfilProdutor {
  id: string;
  nome: string;
  email: string;
  role: string;
  associacaoId: number;
  nomeAssociacao: string;
  municipio: string;
  estado: string;
}

/**
 * Busca o perfil do produtor autenticado no backend.
 *
 * @returns Os dados do perfil do produtor
 * @throws Error se houver falha de rede ou o servidor retornar erro
 */
export async function fetchPerfil(): Promise<PerfilProdutor> {
  const token = localStorage.getItem(TOKEN_KEY);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cred/produtor/me`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  // Token expirado ou inválido: desloga o usuário.
  if (response.status === 401 || response.status === 403) {
    logoutPorExpiracao();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar o perfil.');
  }

  return response.json();
}
