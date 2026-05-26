// URL base configurável por variável de ambiente.
// Em desenvolvimento, usa '' (caminho relativo) e o Vite proxy redireciona para localhost:8080.
// Em produção, defina VITE_API_BASE_URL com a URL completa do backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function getToken() {
  return localStorage.getItem('cred_token');
}

function limparSessao() {
  localStorage.removeItem('cred_token');
  localStorage.removeItem('cred_empresa');
  window.location.href = '/login';
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (_) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (response.status === 401) {
    limparSessao();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    let mensagem = `Erro ${response.status}`;
    try {
      const texto = await response.text();
      if (texto) {
        // O backend devolve { status, mensagem }. Extrai a mensagem amigável quando possível.
        try {
          const json = JSON.parse(texto);
          mensagem = json.mensagem || json.message || texto;
        } catch (_) {
          mensagem = texto;
        }
      }
    } catch (_) {
      // ignora erro ao ler body
    }
    throw new Error(mensagem);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
};
