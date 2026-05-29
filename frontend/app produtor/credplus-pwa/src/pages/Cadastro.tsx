import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// UFs do Brasil para o campo "Estado".
const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

/**
 * Aplica máscara de CPF enquanto o usuário digita: 000.000.000-00
 */
function aplicarMascaraCPF(valor: string): string {
  const soNumeros = valor.replace(/\D/g, '').slice(0, 11);
  return soNumeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Calcula a idade a partir de uma data de nascimento.
 * Retorna false se a pessoa tiver menos de 18 anos.
 */
function temMaisDe18Anos(dataNascimento: string): boolean {
  if (!dataNascimento) return false;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  return aindaNaoFezAniversario ? idade - 1 >= 18 : idade >= 18;
}

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(aplicarMascaraCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações no frontend antes de enviar.
    if (!temMaisDe18Anos(dataNascimento)) {
      setErro('Você precisa ter pelo menos 18 anos para se cadastrar.');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/cred/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          passwordHash: senha,
          // Para a demo, todos os produtores são cadastrados na associação de Jutaiteua (id 1).
          // O papel NÃO é enviado pelo cliente: o backend sempre cadastra como USER.
          associacaoId: 1,
          cpf,
          dataNascimento,
          municipio,
          estado,
        }),
      });

      if (response.status === 400) {
        setErro('Este email já está cadastrado.');
        return;
      }

      if (!response.ok) {
        setErro('Não foi possível criar a conta. Tente novamente.');
        return;
      }

      // Cadastro feito! Redireciona para o login com uma indicação de sucesso.
      navigate('/login', { state: { cadastroSucesso: true } });
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D5016] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-3xl mb-3">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Cred+</h1>
        <p className="text-green-200 mt-1 text-sm">Crie sua conta de produtor</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Novo Cadastro</h2>
        <p className="text-xs text-gray-400 mb-5">
          Você será vinculado à{' '}
          <span className="font-medium text-gray-600">
            Associação de Jutaiteua
          </span>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome completo
            </label>
            <Input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
            <Input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCPFChange}
              inputMode="numeric"
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data de nascimento
              <span className="ml-1 text-xs text-gray-400 font-normal">(mínimo 18 anos)</span>
            </label>
            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Município e Estado lado a lado */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Município</label>
              <Input
                type="text"
                placeholder="Ex: Moju"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                required
              >
                <option value="">UF</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
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

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar senha
            </label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl py-2 px-3">
              {erro}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl mt-2 transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </div>

      {/* Link de voltar para o login */}
      <p className="text-green-200 text-sm mt-6">
        Já tem conta?{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-semibold underline underline-offset-2 hover:text-white transition-colors"
        >
          Entrar
        </button>
      </p>

      <p className="text-green-300 text-xs mt-4">© 2026 Cred+ · Amazon People</p>
    </div>
  );
}
