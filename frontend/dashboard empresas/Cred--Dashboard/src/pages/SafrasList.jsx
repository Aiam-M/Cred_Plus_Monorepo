import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, CheckCircle, AlertTriangle } from 'lucide-react';
import SafraCard from '../components/safras/SafraCard';
import InteresseModal from '../components/safras/InteresseModal';
import { api } from '../services/api';

const TIPOS = ['CACAU', 'ACAI', 'PIMENTA', 'MANDIOCA'];
const TIPO_LABEL = { CACAU: 'Cacau', ACAI: 'Açaí', PIMENTA: 'Pimenta-do-Reino', MANDIOCA: 'Mandioca' };
const STATUS_OPTIONS = ['ATIVA', 'VALIDADA', 'AGUARDANDO_VALIDACAO', 'REPROVADA'];
const STATUS_LABEL = { ATIVA: 'Ativa', VALIDADA: 'Validada', AGUARDANDO_VALIDACAO: 'Aguardando', REPROVADA: 'Reprovada' };

const SCORE_MIN_OPTIONS = [
  { value: 0, label: 'Todos' },
  { value: 70, label: '≥ 70' },
  { value: 80, label: '≥ 80' },
  { value: 90, label: '≥ 90' },
];

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-cred-green-dark border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SafrasList() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ tipos: [], scoreMin: 0, status: [] });
  const [safras, setSafras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalSafra, setModalSafra] = useState(null);
  const [sucessoId, setSucessoId] = useState(null);
  const [filtrosMobileAbertos, setFiltrosMobileAbertos] = useState(false);

  // Busca safras do backend sempre que os filtros mudarem
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    filtros.tipos.forEach((t) => params.append('tipos', t));
    if (filtros.scoreMin > 0) params.set('scoreMin', String(filtros.scoreMin));
    filtros.status.forEach((s) => params.append('status', s));

    const query = params.toString();
    api.get(`/cred/safras${query ? `?${query}` : ''}`)
      .then(setSafras)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filtros]);

  const handleConfirmarInteresse = ({ safraId }) => {
    setSucessoId(safraId);
    setTimeout(() => setSucessoId(null), 4000);
  };

  const limparFiltros = () => setFiltros({ tipos: [], scoreMin: 0, status: [] });

  const filtrosAtivos =
    filtros.tipos.length > 0 || filtros.scoreMin > 0 || filtros.status.length > 0;

  const Filters = (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-cred-gray-text">Filtros</h3>
        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="text-xs text-cred-red-error hover:underline"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Tipo de plantação */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Tipo de plantação</p>
        <div className="space-y-2">
          {TIPOS.map((tipo) => (
            <label key={tipo} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.tipos.includes(tipo)}
                onChange={() =>
                  setFiltros((f) => ({ ...f, tipos: toggle(f.tipos, tipo) }))
                }
                className="accent-cred-green-dark rounded"
              />
              <span className="text-sm text-cred-gray-text">{TIPO_LABEL[tipo]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* AgroScore mínimo */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">AgroScore mínimo</p>
        <div className="space-y-1.5">
          {SCORE_MIN_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scoreMin"
                checked={filtros.scoreMin === value}
                onChange={() => setFiltros((f) => ({ ...f, scoreMin: value }))}
                className="accent-cred-green-dark"
              />
              <span className="text-sm text-cred-gray-text">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((st) => (
            <label key={st} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.status.includes(st)}
                onChange={() =>
                  setFiltros((f) => ({ ...f, status: toggle(f.status, st) }))
                }
                className="accent-cred-green-dark rounded"
              />
              <span className="text-sm text-cred-gray-text">{STATUS_LABEL[st]}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-cred-gray-text">Catálogo de Safras</h1>
        <p className="text-sm text-gray-500 mt-1">
          Safras amazônicas verificadas com rastreabilidade e AgroScore
        </p>
      </div>

      {/* Toast de sucesso */}
      {sucessoId && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Interesse na Safra #{sucessoId} registrado! A Amazon People entrará em contato.
        </div>
      )}

      {/* Botão filtros (mobile) */}
      <button
        type="button"
        onClick={() => setFiltrosMobileAbertos((v) => !v)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-cred-gray-border rounded-lg text-sm font-medium text-cred-gray-text"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {filtrosMobileAbertos ? 'Ocultar filtros' : 'Filtros'}
        {filtrosAtivos && (
          <span className="w-5 h-5 bg-cred-green-dark text-white text-xs rounded-full flex items-center justify-center">
            {filtros.tipos.length + (filtros.scoreMin > 0 ? 1 : 0) + filtros.status.length}
          </span>
        )}
      </button>

      <div className="flex gap-6 items-start">
        {/* Filtros desktop */}
        <div className="hidden lg:block w-56 shrink-0 bg-white rounded-2xl p-5 border border-cred-gray-border shadow-sm sticky top-24">
          {Filters}
        </div>

        {/* Filtros mobile */}
        {filtrosMobileAbertos && (
          <div className="lg:hidden w-full bg-white rounded-2xl p-5 border border-cred-gray-border shadow-sm">
            {Filters}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {loading && <Spinner />}

          {!loading && error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Erro ao carregar safras: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {safras.length} safra{safras.length !== 1 ? 's' : ''} encontrada{safras.length !== 1 ? 's' : ''}
              </p>

              {safras.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {safras.map((safra) => (
                    <SafraCard
                      key={safra.id}
                      safra={safra}
                      onVerDetalhes={(id) => navigate(`/safras/${id}`)}
                      onDemonstrarInteresse={(s) => setModalSafra(s)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-cred-gray-border">
                  <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nenhuma safra encontrada com esses filtros.</p>
                  {filtrosAtivos && (
                    <button
                      type="button"
                      onClick={limparFiltros}
                      className="mt-3 text-sm text-cred-green-medium hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalSafra && (
        <InteresseModal
          safra={modalSafra}
          onClose={() => setModalSafra(null)}
          onConfirm={handleConfirmarInteresse}
        />
      )}
    </div>
  );
}
