import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { mockUser } from '@/data/mockData';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('joao@jutaiteua.org');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    // Simula latência de login
    await new Promise((r) => setTimeout(r, 800));

    localStorage.setItem('cred_authenticated', 'true');
    localStorage.setItem('cred_user', JSON.stringify(mockUser));
    setLoading(false);
    onLogin();
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

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl mt-2 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Use qualquer senha para a demonstração
          </p>
        </form>
      </div>

      <p className="text-green-300 text-xs mt-8">
        © 2026 Cred+ · Amazon People
      </p>
    </div>
  );
}
