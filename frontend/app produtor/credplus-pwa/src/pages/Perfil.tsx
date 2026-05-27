import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Bell, RefreshCw, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import type { Safra } from '@/data/mockData';
import { safraRepo } from '@/db/db';
import { TOKEN_KEY } from '@/services/authService';
import type { PerfilProdutor } from '@/services/produtorService';

// Lê o perfil salvo no localStorage após o login.
// Se por algum motivo não existir (sessão antiga), usa valores vazios como fallback.
function carregarPerfil(): PerfilProdutor {
  const salvo = localStorage.getItem('cred_user');
  if (salvo) {
    try {
      return JSON.parse(salvo) as PerfilProdutor;
    } catch {
      // Se o JSON estiver corrompido, ignora e usa o fallback abaixo.
    }
  }
  return { id: '', nome: '', email: '', role: 'PRODUTOR', associacaoId: 0, nomeAssociacao: '', municipio: '', estado: '' };
}

export default function Perfil() {
  const navigate = useNavigate();
  const usuario = carregarPerfil();
  const [safras, setSafras] = useState<Safra[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    safraRepo.getByProdutor(usuario.id).then(setSafras);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validadas = safras.filter((s) => s.status === 'ATIVA').length;
  const totalHa = safras.reduce((sum, s) => sum + s.areaHectares, 0);

  const handleLogout = () => {
    localStorage.removeItem('cred_authenticated');
    localStorage.removeItem('cred_user');
    localStorage.removeItem(TOKEN_KEY);
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header verde */}
      <div className="bg-[#2D5016] text-white px-5 pt-12 pb-20">
        <h1 className="text-lg font-semibold mb-1">Meu Perfil</h1>
        <p className="text-green-200 text-sm">Configurações e informações da conta</p>
      </div>

      {/* Avatar Card */}
      <div className="px-4 -mt-14 mb-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2D5016] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 text-lg">{usuario.nome || 'Produtor'}</h2>
              <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{usuario.nomeAssociacao}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5">
            {isOnline ? (
              <><Wifi size={14} className="text-green-500" /><span className="text-xs text-green-600 font-medium">Online</span></>
            ) : (
              <><WifiOff size={14} className="text-gray-400" /><span className="text-xs text-gray-500 font-medium">Offline</span></>
            )}
            <span className="text-gray-200 mx-1">·</span>
            <span className="text-xs text-gray-400">{usuario.municipio} - {usuario.estado}</span>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Estatísticas
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatItem value={safras.length} label="Total de Safras" />
            <StatItem value={validadas} label="Validadas" color="text-green-600" />
            <StatItem value={`${totalHa.toFixed(1)} ha`} label="Área Total" color="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Configurações
          </p>

          <ToggleRow
            icon={<Bell size={18} className="text-[#2D5016]" />}
            label="Notificações"
            description="Avisos de validação e interesse"
            checked={notifEnabled}
            onChange={setNotifEnabled}
          />

          <ToggleRow
            icon={<RefreshCw size={18} className="text-[#2D5016]" />}
            label="Sincronização Automática"
            description="Sincronizar ao voltar online"
            checked={autoSync}
            onChange={setAutoSync}
          />

          <button className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                🔐
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Alterar Senha</p>
                <p className="text-xs text-gray-400">Atualize sua senha de acesso</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Versão */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">Versão do App</p>
            <p className="text-xs text-gray-400 mt-0.5">Build de demonstração</p>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-12 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}

function StatItem({
  value,
  label,
  color = 'text-[#2D5016]',
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#2D5016]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
