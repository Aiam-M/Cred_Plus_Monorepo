/**
 * Serviço de autenticação do produtor.
 *
 * Chama o backend (POST /cred/auth/login) e devolve o token JWT.
 * O token é guardado em localStorage sob a chave `cred_token` e usado pelo
 * syncService para autenticar as chamadas de sincronização.
 */

// Mesma base usada pelo syncService. Em dev, aponta para http://localhost:8080
// (definido em .env.local); em produção, para a URL real do backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** Chave do token JWT no localStorage. */
export const TOKEN_KEY = 'cred_token';

/**
 * Faz o logout forçado quando o token expira ou é rejeitado pelo servidor.
 *
 * Limpa todos os dados de sessão do localStorage e redireciona para o login.
 * Usamos `window.location.href` em vez do `useNavigate` do React porque esta
 * função é chamada fora de componentes (dentro de services).
 */
export function logoutPorExpiracao(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('cred_authenticated');
  localStorage.removeItem('cred_user');
  window.location.href = '/login';
}

/**
 * Faz login no backend e retorna o token JWT.
 *
 * Observação: o backend recebe a senha no campo `passwordHash`, mas o valor
 * enviado é a senha em texto puro — a comparação com o hash BCrypt acontece
 * no servidor. O nome do campo é só o contrato atual da API.
 *
 * @param email email do produtor
 * @param senha senha em texto puro
 * @returns o token JWT
 * @throws Error com mensagem amigável em caso de credencial inválida ou falha de rede
 */
export async function login(email: string, senha: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cred/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passwordHash: senha }),
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Email ou senha inválidos.');
  }
  if (!response.ok) {
    throw new Error('Não foi possível entrar. Tente novamente.');
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('Resposta inválida do servidor.');
  }
  return data.token;
}
