import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cred_token');
    const empresaJson = localStorage.getItem('cred_empresa');
    if (token && empresaJson) {
      try {
        setEmpresa(JSON.parse(empresaJson));
        setIsAuthenticated(true);
      } catch (_) {
        // JSON inválido: força novo login
        localStorage.removeItem('cred_token');
        localStorage.removeItem('cred_empresa');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Autentica a empresa chamando o backend real.
   * Salva o token JWT e os dados da empresa no localStorage.
   */
  const login = async (email, password) => {
    try {
      const data = await api.post('/cred/auth/empresa/login', { email, password });
      const dadosEmpresa = { nome: data.nome, email: data.email, cnpj: data.cnpj, segmento: data.segmento, createdAt: data.createdAt };
      localStorage.setItem('cred_token', data.token);
      localStorage.setItem('cred_empresa', JSON.stringify(dadosEmpresa));
      setEmpresa(dadosEmpresa);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const mensagem = err.message?.startsWith('Não foi possível')
        ? err.message
        : 'E-mail ou senha inválidos. Verifique suas credenciais.';
      return { success: false, error: mensagem };
    }
  };

  /**
   * Cadastra uma nova empresa no backend e, em caso de sucesso, faz login automático.
   * @param dados objeto com cnpj (14 dígitos), email, password e segmento (opcional)
   * @returns { success, autenticado, error }
   *   - autenticado=true quando o login automático também funcionou
   */
  const cadastrar = async (dados) => {
    try {
      await api.post('/cred/auth/empresa/cadastro', dados);
      // Login automático após cadastro: melhora a experiência no demo.
      const resultadoLogin = await login(dados.email, dados.password);
      return { success: true, autenticado: resultadoLogin.success };
    } catch (err) {
      return { success: false, error: err.message || 'Não foi possível concluir o cadastro.' };
    }
  };

  /**
   * Atualiza os dados da empresa no estado e no localStorage após o usuário salvar o perfil.
   * Mantém o CNPJ e o createdAt intocados (não vêm na resposta do PUT /empresa).
   */
  const atualizarEmpresa = (novosDados) => {
    const dadosAtualizados = { ...empresa, ...novosDados };
    localStorage.setItem('cred_empresa', JSON.stringify(dadosAtualizados));
    setEmpresa(dadosAtualizados);
  };

  const logout = () => {
    localStorage.removeItem('cred_token');
    localStorage.removeItem('cred_empresa');
    setEmpresa(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, empresa, loading, login, cadastrar, logout, atualizarEmpresa }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
