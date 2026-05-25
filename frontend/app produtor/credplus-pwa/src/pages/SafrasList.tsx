import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { SafraStorage, mockUser, tiposCultura } from '@/data/mockData';
import type { Safra, StatusSafra, TipoCultura } from '@/data/mockData';
import SafraCard from '@/components/safras/SafraCard';

const STATUS_LABELS: Record<StatusSafra, string> = {
  AGUARDANDO_SYNC: 'Aguard. Sync',
  AGUARDANDO_VALIDACAO_SATELITE: 'Satélite',
  AGUARDANDO_VALIDACAO_CAMPO: 'Campo',
  ATIVA: 'Validada',
  REPROVADA: 'Reprovada',
  ENCERRADA: 'Encerrada',
};

export default function SafrasList() {
  const navigate = useNavigate();
  const [safras, setSafras] = useState<Safra[]>([]);
  const [busca, setBusca] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusSafra | ''>('');
  const [filterTipo, setFilterTipo] = useState<TipoCultura | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSafras(SafraStorage.getByProdutor(mockUser.id));
  }, []);

  const filtered = safras.filter((s) => {
    const matchBusca =
      !busca || s.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchTipo =
      !filterTipo || s.plantacoes.some((p) => p.tipo === filterTipo);
    return matchBusca && matchStatus && matchTipo;
  });

  const activeFilters = [filterStatus, filterTipo].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 pt-12 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Minhas Safras</h1>
            <button
              onClick={() => navigate('/safra/nova')}
              className="flex items-center gap-1.5 bg-[#2D5016] text-white text-sm font-medium px-4 py-2 rounded-xl"
            >
              <PlusCircle size={16} />
              Nova
            </button>
          </div>

          {/* Busca */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar safra..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D5016] focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-colors ${
                showFilters || activeFilters > 0
                  ? 'bg-[#2D5016] border-[#2D5016] text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <SlidersHorizontal size={18} />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as StatusSafra[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                    className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      filterStatus === s
                        ? 'bg-[#2D5016] text-white border-[#2D5016]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Tipo de Cultura</p>
              <div className="flex flex-wrap gap-2">
                {tiposCultura.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setFilterTipo(filterTipo === t.value ? '' : t.value)}
                    className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      filterTipo === t.value
                        ? 'bg-[#2D5016] text-white border-[#2D5016]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterStatus(''); setFilterTipo(''); }}
                className="flex items-center gap-1 text-xs text-red-500 font-medium"
              >
                <X size={13} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-3">
          {filtered.length} safra{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-gray-500 font-medium">Nenhuma safra encontrada</p>
            {activeFilters > 0 && (
              <p className="text-gray-400 text-sm mt-1">Tente remover os filtros</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((safra) => (
              <SafraCard key={safra.id} safra={safra} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
