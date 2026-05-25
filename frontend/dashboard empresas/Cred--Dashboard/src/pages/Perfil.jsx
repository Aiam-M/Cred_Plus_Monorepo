import { useState } from 'react';
import { User, Mail, Building2, Hash, Shield, Bell, Check, Eye, EyeOff } from 'lucide-react';

const SEGMENTOS = [
  'Indústria Alimentícia',
  'Trading',
  'Varejo',
  'Cosméticos',
  'Farmacêutico',
  'Outros',
];

const MOCK_EMPRESA = {
  nome: 'Empresa Exemplo Ltda',
  cnpj: '12.345.678/0001-90',
  segmento: 'Indústria Alimentícia',
  email: 'contato@empresa-exemplo.com.br',
  plano: 'Acesso Empresarial',
  membro_desde: '2026-03-01',
  interesses: 3,
  safrasVisualizadas: 12,
};

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-cred-gray-border p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-cred-green-dark mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-cred-gray-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cred-gray-border bg-cred-gray-neutral/50">
        <Icon className="w-4 h-4 text-cred-green-dark" />
        <h2 className="font-semibold text-cred-gray-text text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Perfil() {
  const [form, setForm] = useState({
    nome: MOCK_EMPRESA.nome,
    segmento: MOCK_EMPRESA.segmento,
    email: MOCK_EMPRESA.email,
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirmar: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaErro, setSenhaErro] = useState('');
  const [senhaSalva, setSenhaSalva] = useState(false);

  const [notifs, setNotifs] = useState({
    novaSafra: true,
    respostaInteresse: true,
  });

  const handleSalvar = (e) => {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    }, 800);
  };

  const handleSalvarSenha = (e) => {
    e.preventDefault();
    setSenhaErro('');
    if (senhaForm.nova.length < 6) {
      setSenhaErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senhaForm.nova !== senhaForm.confirmar) {
      setSenhaErro('As senhas não coincidem.');
      return;
    }
    setSalvandoSenha(true);
    setTimeout(() => {
      setSalvandoSenha(false);
      setSenhaSalva(true);
      setSenhaForm({ atual: '', nova: '', confirmar: '' });
      setTimeout(() => setSenhaSalva(false), 3000);
    }, 800);
  };

  const membroDesde = new Date(MOCK_EMPRESA.membro_desde).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header do perfil */}
      <div className="bg-white rounded-2xl border border-cred-gray-border p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-cred-green-dark rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">
              {form.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-cred-gray-text truncate">{form.nome}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{form.segmento}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cred-green-dark/10 text-cred-green-dark text-xs font-medium rounded-full">
                ✅ {MOCK_EMPRESA.plano}
              </span>
              <span className="text-xs text-gray-400">· Membro desde {membroDesde}</span>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-cred-gray-border">
          <StatCard label="Interesses enviados" value={MOCK_EMPRESA.interesses} icon="📋" />
          <StatCard label="Safras visualizadas" value={MOCK_EMPRESA.safrasVisualizadas} icon="🌱" />
        </div>
      </div>

      {/* Dados Cadastrais */}
      <Section title="Dados Cadastrais" icon={Building2}>
        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Nome da empresa</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 border border-cred-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cred-green-medium/40"
                required
              />
            </div>
          </div>

          {/* CNPJ (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              CNPJ <span className="text-gray-400 font-normal">(não editável)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={MOCK_EMPRESA.cnpj}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 border border-cred-gray-border rounded-lg text-sm bg-cred-gray-neutral text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Segmento</label>
            <select
              value={form.segmento}
              onChange={(e) => setForm((f) => ({ ...f, segmento: e.target.value }))}
              className="w-full px-3 py-2.5 border border-cred-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cred-green-medium/40 bg-white"
            >
              {SEGMENTOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">E-mail corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 border border-cred-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cred-green-medium/40"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 px-6 py-2.5 bg-cred-green-dark text-white rounded-lg font-medium text-sm hover:bg-cred-green-medium transition-colors disabled:opacity-70"
            >
              {salvando ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : salvo ? (
                <Check className="w-4 h-4" />
              ) : null}
              {salvo ? 'Salvo!' : 'Salvar Alterações'}
            </button>
            {salvo && (
              <span className="text-sm text-cred-green-dark font-medium">✅ Dados atualizados com sucesso.</span>
            )}
          </div>
        </form>
      </Section>

      {/* Segurança */}
      <Section title="Segurança" icon={Shield}>
        <form onSubmit={handleSalvarSenha} className="space-y-4">
          {[
            { key: 'atual', label: 'Senha atual' },
            { key: 'nova', label: 'Nova senha' },
            { key: 'confirmar', label: 'Confirmar nova senha' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senhaForm[key]}
                  onChange={(e) => setSenhaForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 border border-cred-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cred-green-medium/40"
                  required
                />
                {key === 'nova' && (
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {senhaErro && (
            <p className="text-xs text-cred-red-error bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {senhaErro}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={salvandoSenha}
              className="flex items-center gap-2 px-6 py-2.5 bg-cred-green-dark text-white rounded-lg font-medium text-sm hover:bg-cred-green-medium transition-colors disabled:opacity-70"
            >
              {salvandoSenha && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Alterar Senha
            </button>
            {senhaSalva && (
              <span className="text-sm text-cred-green-dark font-medium">✅ Senha alterada com sucesso.</span>
            )}
          </div>
        </form>
      </Section>

      {/* Notificações */}
      <Section title="Preferências de Notificação" icon={Bell}>
        <div className="space-y-4">
          {[
            {
              key: 'novaSafra',
              label: 'Receber e-mail quando nova safra for cadastrada',
              desc: 'Seja notificado sempre que um produtor cadastrar uma nova safra no sistema.',
            },
            {
              key: 'respostaInteresse',
              label: 'Receber e-mail quando produtor responder ao interesse',
              desc: 'Acompanhe em tempo real as respostas dos produtores aos interesses que você demonstrou.',
            },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-start gap-3 p-4 rounded-xl border border-cred-gray-border cursor-pointer hover:bg-cred-gray-neutral/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={notifs[key]}
                onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))}
                className="accent-cred-green-dark mt-0.5 w-4 h-4 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-cred-gray-text">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </label>
          ))}

          <p className="text-xs text-gray-400 pt-1">
            As preferências são salvas automaticamente.
          </p>
        </div>
      </Section>
    </div>
  );
}
