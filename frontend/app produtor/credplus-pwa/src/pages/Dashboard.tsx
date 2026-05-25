import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { mockUser, SafraStorage } from '@/data/mockData';
import type { Safra } from '@/data/mockData';
import SafraCard from '@/components/safras/SafraCard';
import OnlineIndicator from '@/components/common/OnlineIndicator';

export default function Dashboard() {
  const navigate = useNavigate();
  const [safras, setSafras] = useState<Safra[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    setSafras(SafraStorage.getByProdutor(mockUser.id));
  }, []);

  const aguardandoSync = safras.filter((s) => s.status === 'AGUARDANDO_SYNC').length;
  const validadas = safras.filter((s) => s.status === 'ATIVA').length;
  const totalHa = safras.reduce((sum, s) => sum + s.areaHectares, 0);

  const handleSimulateSync = async () => {
    const pendentes = safras.filter((s) => s.status === 'AGUARDANDO_SYNC');
    if (pendentes.length === 0 || !navigator.onLine) return;

    for (const safra of pendentes) {
      setSyncingId(safra.id);
      await new Promise((r) => setTimeout(r, 1200));
      SafraStorage.update(safra.id, {
        status: 'AGUARDANDO_VALIDACAO_SATELITE',
        syncedAt: new Date().toISOString(),
      });
    }

    setSyncingId(null);
    setSafras(SafraStorage.getByProdutor(mockUser.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2D5016] text-white px-5 pt-12 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm mb-1">{mockUser.associacao.municipio} · {mockUser.associacao.estado}</p>
            <h1 className="text-2xl font-bold leading-tight">
              Olá, {mockUser.nome.split(' ')[0]}! 👋
            </h1>
            <p className="text-green-100 text-xs mt-1 max-w-[220px] leading-relaxed">
              {mockUser.associacao.nome}
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
            onClick={handleSimulateSync}
            disabled={syncingId !== null}
            className="flex items-center gap-1.5 bg-yellow-600 text-white text-xs font-medium px-3 py-2 rounded-xl disabled:opacity-60 transition-opacity"
          >
            <RefreshCw size={13} className={syncingId ? 'animate-spin' : ''} />
            {syncingId ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
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
