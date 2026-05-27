import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { login, TOKEN_KEY } from '@/services/authService';
import { fetchPerfil } from '@/services/produtorService';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('joao@jutaiteua.org');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErro('');

    try {
      // 1. Autentica e obtém o token JWT.
      const token = await login(email, password);
      localStorage.setItem(TOKEN_KEY, token);

      // 2. Busca o perfil real do produtor no backend usando o token.
      const perfil = await fetchPerfil();
      localStorage.setItem('cred_user', JSON.stringify(perfil));

      // 3. Marca a sessão como ativa e entra no app.
      localStorage.setItem('cred_authenticated', 'true');
      onLogin();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D5016] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-4">
          <span className="text-4xl">🌱</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Cred+</h1>
        <p className="text-green-200 mt-2 text-sm">Rastreabilidade para agricultura familiar</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Bem-vindo, Produtor!</h2>
        <p className="text-sm text-gray-500 mb-6">Entre com suas credenciais para continuar</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {erro && (
            <p className="text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl py-2 px-3">
              {erro}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl mt-2 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>

      <p className="text-green-200 text-sm mt-6">
        Não tem conta?{' '}
        <button
          onClick={() => navigate('/cadastro')}
          className="font-semibold underline underline-offset-2 hover:text-white transition-colors"
        >
          Cadastre-se
        </button>
      </p>

      <p className="text-green-300 text-xs mt-4">
        © 2026 Cred+ · Amazon People
      </p>
    </div>
  );
}
