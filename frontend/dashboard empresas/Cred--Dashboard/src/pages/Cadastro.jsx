import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Hash, Building2, Briefcase, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SEGMENTOS = [
  'Indústria Alimentícia',
  'Trading',
  'Varejo',
  'Cosméticos',
  'Farmacêutico',
  'Outros',
];

// Aplica a máscara visual XX.XXX.XXX/XXXX-XX mantendo no máximo 14 dígitos.
function formatarCnpj(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  if (d.length > 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return d;
}

function apenasDigitos(valor) {
  return valor.replace(/\D/g, '');
}

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [segmento, setSegmento] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  // Valida os campos no frontend antes de enviar (defense in depth: o backend revalida).
  const validar = () => {
    const cnpjDigitos = apenasDigitos(cnpj);
    if (cnpjDigitos.length !== 14) {
      return 'O CNPJ deve conter 14 dígitos.';
    }
    if (password.length < 8) {
      return 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (password !== confirmarPassword) {
      return 'As senhas não coincidem.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const erroValidacao = validar();
    if (erroValidacao) {
      setError(erroValidacao);
      return;
    }

    setLoading(true);
    const dados = {
      nome: nome.trim(),
      cnpj: apenasDigitos(cnpj),
      email,
      password,
      segmento: segmento || null,
    };
    const result = await cadastrar(dados);

    if (result.success && result.autenticado) {
      // Cadastrou e já entrou: vai direto para o dashboard.
      navigate('/', { replace: true });
    } else if (result.success) {
      // Cadastrou mas o login automático falhou: pede login manual.
      navigate('/login', {
        replace: true,
        state: { mensagem: 'Conta criada com sucesso! Faça login para continuar.' },
      });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cred-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-cred-beige p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-cred-green-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-2xl">c+</span>
          </div>
          <h1 className="text-2xl font-bold text-cred-green-dark">Criar conta empresarial</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre sua empresa para acessar o catálogo de safras</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome da empresa */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1.5">Nome da empresa</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                placeholder="Ex.: Amazon People Ltda"
                maxLength={150}
                required
              />
            </div>
          </div>

          {/* CNPJ */}
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1.5">CNPJ</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="cnpj"
                type="text"
                inputMode="numeric"
                value={cnpj}
                onChange={(e) => setCnpj(formatarCnpj(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">E-mail corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                placeholder="empresa@cred.com"
                required
              />
            </div>
          </div>

          {/* Segmento */}
          <div>
            <label htmlFor="segmento" className="block text-sm font-medium text-gray-700 mb-1.5">
              Segmento <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <select
                id="segmento"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all bg-white appearance-none"
              >
                <option value="">Selecione um segmento</option>
                {SEGMENTOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Senha de acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type={mostrarSenha ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label htmlFor="confirmar" className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirmar"
                type={mostrarSenha ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                placeholder="Repita a senha"
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cred-green-dark text-white py-3 rounded-lg font-semibold hover:bg-cred-green-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-cred-green-dark font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
