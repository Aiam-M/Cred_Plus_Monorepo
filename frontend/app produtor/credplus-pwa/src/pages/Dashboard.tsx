import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, RefreshCw, ArrowRight, Mail, ChevronRight } from 'lucide-react';
import type { Safra } from '@/data/mockData';
import { safraRepo } from '@/db/db';
import { sincronizar } from '@/services/syncService';
import { fetchContagemNaoLidos } from '@/services/interesseService';
import { useSafrasChanged } from '@/hooks/useSync';
import SafraCard from '@/components/safras/SafraCard';
import OnlineIndicator from '@/components/common/OnlineIndicator';

interface UsuarioLocal {
  id: string;
  nome: string;
  municipio: string;
  estado: string;
  nomeAssociacao: string;
}

// Lê os dados do produtor salvos no localStorage após o login.
function carregarUsuario(): UsuarioLocal {
  const salvo = localStorage.getItem('cred_user');
  if (salvo) {
    try {
      return JSON.parse(salvo) as UsuarioLocal;
    } catch {
      // fallback abaixo
    }
  }
  return { id: '', nome: '', municipio: '', estado: '', nomeAssociacao: '' };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = carregarUsuario();
  const [safras, setSafras] = useState<Safra[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);

  const carregarSafras = useCallback(() => {
    return safraRepo.getByProdutor(usuario.id).then(setSafras);
  }, [usuario.id]);

  useEffect(() => {
    carregarSafras();
  }, [carregarSafras]);

  // Busca a contagem de mensagens não lidas quando o Dashboard abre.
  // É melhor-esforço: se falhar, fica em 0 (não atrapalha o resto da tela).
  useEffect(() => {
    if (!navigator.onLine) return;
    fetchContagemNaoLidos().then(setMensagensNaoLidas);
  }, []);

  // Recarrega a lista quando uma sincronização (em segundo plano) altera as safras.
  useSafrasChanged(carregarSafras);

  const aguardandoSync = safras.filter((s) => s.status === 'AGUARDANDO_SYNC').length;
  const validadas = safras.filter((s) => s.status === 'ATIVA').length;
  const totalHa = safras.reduce((sum, s) => sum + s.areaHectares, 0);

  const handleSync = async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);
    const resultado = await sincronizar();
    if (resultado.enviadas > 0) {
      await carregarSafras();
    }
    setSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2D5016] text-white px-5 pt-12 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm mb-1">{usuario.municipio} · {usuario.estado}</p>
            <h1 className="text-2xl font-bold leading-tight">
              Olá, {usuario.nome ? usuario.nome.split(' ')[0] : 'Produtor'}! 👋
            </h1>
            <p className="text-green-100 text-xs mt-1 max-w-[220px] leading-relaxed">
              {usuario.nomeAssociacao}
            </p>
          </div>
          <OnlineIndicator />
        </div>
      </div>

      {/* Métricas */}
      <div className="px-4 -mt-6 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard value={safras.length} label="Safras Cadastradas" color="text-[#2D5016]" />
          <MetricCard
            value={aguardandoSync}
            label="Aguardando Sync"
            color="text-yellow-600"
            alert={aguardandoSync > 0}
          />
          <MetricCard value={validadas} label="Validadas ✅" color="text-green-600" />
          <MetricCard value={`${totalHa.toFixed(1)} ha`} label="Área Total" color="text-blue-600" />
        </div>
      </div>

      {/* Sync banner */}
      {aguardandoSync > 0 && navigator.onLine && (
        <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {aguardandoSync} safra{aguardandoSync > 1 ? 's' : ''} aguardando sincronização
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">Você está online agora</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-yellow-600 text-white text-xs font-medium px-3 py-2 rounded-xl disabled:opacity-60 transition-opacity"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      )}

      {/* Banner de mensagens não lidas */}
      {mensagensNaoLidas > 0 && (
        <button
          onClick={() => navigate('/interesses')}
          className="mx-4 mb-4 w-[calc(100%-2rem)] bg-green-50 border border-[#2D5016]/20 rounded-2xl p-4 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#2D5016] flex items-center justify-center shrink-0">
              <Mail size={18} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-green-50">
                {mensagensNaoLidas > 9 ? '9+' : mensagensNaoLidas}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#2D5016]">
                {mensagensNaoLidas} {mensagensNaoLidas === 1 ? 'nova mensagem' : 'novas mensagens'}
              </p>
              <p className="text-xs text-[#4A7C2F]">
                {mensagensNaoLidas === 1 ? 'Empresa interessada' : 'Empresas interessadas'} nas suas safras
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#2D5016] shrink-0" />
        </button>
      )}

      {/* Botão Nova Safra */}
      <div className="px-4 mb-5">
        <button
          onClick={() => navigate('/safra/nova')}
          className="w-full bg-[#2D5016] hover:bg-[#4A7C2F] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
        >
          <PlusCircle size={20} />
          Nova Safra
        </button>
      </div>

      {/* Safras Recentes */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-base">Minhas Safras</h2>
          {safras.length > 3 && (
            <button
              onClick={() => navigate('/safras')}
              className="flex items-center gap-1 text-[#2D5016] text-sm font-medium"
            >
              Ver todas <ArrowRight size={14} />
            </button>
          )}
        </div>

        {safras.length === 0 ? (
          <EmptyState onAction={() => navigate('/safra/nova')} />
        ) : (
          <div className="space-y-3">
            {safras.slice(0, 3).map((safra) => (
              <SafraCard key={safra.id} safra={safra} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  value,
  label,
  color,
  alert = false,
}: {
  value: string | number;
  label: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border ${
        alert ? 'border-yellow-200' : 'border-gray-100'
      }`}
    >
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-5xl mb-4">🌱</div>
      <p className="text-gray-600 font-medium mb-1">Nenhuma safra cadastrada</p>
      <p className="text-gray-400 text-sm mb-5">Registre sua primeira safra agora</p>
      <button
        onClick={onAction}
        className="bg-[#2D5016] text-white px-6 py-3 rounded-xl font-medium text-sm"
      >
        Cadastrar Safra
      </button>
    </div>
  );
}
