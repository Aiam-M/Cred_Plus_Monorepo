import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCheck, Database } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import StatusBadge from '../components/common/StatusBadge';
import AgroScoreDisplay from '../components/common/AgroScoreDisplay';
import InteresseModal from '../components/safras/InteresseModal';
import { mockSafras, mockAgroScoreDetalhes, mockRastreabilidade } from '../data/mockData';

const TIPO_LABEL = { CACAU: 'Cacau', ACAI: 'Açaí', PIMENTA: 'Pimenta-do-Reino', MANDIOCA: 'Mandioca' };

const COR_EVENTO = {
  blue: 'border-cred-blue-info bg-blue-50',
  green: 'border-cred-green-medium bg-green-50',
  yellow: 'border-cred-yellow-alert bg-yellow-50',
  red: 'border-cred-red-error bg-red-50',
};

const COR_EVENTO_DOT = {
  blue: 'border-cred-blue-info',
  green: 'border-cred-green-medium',
  yellow: 'border-cred-yellow-alert',
  red: 'border-cred-red-error',
};

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function HashLine({ label, value }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <span className="text-xs text-gray-400">{label}:</span>
      <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
        {value.substring(0, 16)}…
      </code>
      <button type="button" onClick={copiar} className="text-gray-400 hover:text-cred-green-dark transition-colors" title="Copiar hash completo">
        {copiado ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Aba 1: Visão Geral ─────────────────────────────────────────────────────
function AbaVisaoGeral({ safra, onDemonstrarInteresse }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📸 Galeria</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-video rounded-xl bg-gradient-to-br from-cred-green-dark to-cred-green-medium flex items-center justify-center"
            >
              <span className="text-3xl opacity-50">🌿</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🌍 Localização</h3>
        <div className="h-40 bg-cred-gray-neutral rounded-xl border-2 border-dashed border-cred-gray-border flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm text-gray-400">Mapa em desenvolvimento</p>
          <p className="text-xs text-gray-400">
            {safra.associacao.municipio}-{safra.associacao.estado} · {safra.associacao.latitude?.toFixed(3)}, {safra.associacao.longitude?.toFixed(3)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📊 Plantações Cadastradas</h3>
        <div className="space-y-2">
          {safra.plantacoes.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-cred-beige rounded-xl">
              <span className="font-medium text-cred-green-dark">• {TIPO_LABEL[p.tipo] ?? p.tipo}</span>
              <span className="text-sm text-gray-600 font-medium">{p.quantidade} {p.unidade}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📍 Produtor</h3>
        <div className="bg-white border border-cred-gray-border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Nome</span>
            <span className="font-medium text-cred-gray-text">{safra.produtor.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Associação</span>
            <span className="font-medium text-cred-gray-text text-right max-w-[60%]">{safra.associacao.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Município</span>
            <span className="font-medium text-cred-gray-text">{safra.associacao.municipio} — {safra.associacao.estado}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Área total</span>
            <span className="font-medium text-cred-gray-text">{safra.areaHectares} hectares</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDemonstrarInteresse}
        className="w-full sm:w-auto px-8 py-3 bg-cred-green-dark text-white font-semibold rounded-xl hover:bg-cred-green-medium transition-colors"
      >
        Demonstrar Interesse
      </button>
    </div>
  );
}

// ── Aba 2: AgroScore ────────────────────────────────────────────────────────
function AbaAgroScore({ safraId }) {
  const detalhes = mockAgroScoreDetalhes[safraId];

  if (!detalhes) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-2">📡</p>
        <p className="font-medium">Análise de satélite ainda não disponível para esta safra.</p>
        <p className="text-xs mt-1">Os dados são processados automaticamente após o cadastro.</p>
      </div>
    );
  }

  const STATUS_STYLE = {
    aprovado: 'text-cred-green-dark',
    parcial: 'text-cred-orange',
    reprovado: 'text-cred-red-error',
  };

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-cred-gray-border">
        <AgroScoreDisplay score={detalhes.score} size="large" />
        <div className="flex-1">
          <p className="text-lg font-bold text-cred-gray-text">🌟 AgroScore: {detalhes.score}/100</p>
          {detalhes.nota && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-lg">ℹ️ {detalhes.nota}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Atualizado em {formatDate(detalhes.dataAtualizacao)}
          </p>
        </div>
      </div>

      {/* Critérios */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Critérios Avaliados</h3>
        <div className="space-y-3">
          {detalhes.criterios.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-cred-gray-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="text-base shrink-0 mt-0.5">{c.icone}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cred-gray-text">{c.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{c.justificativa}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold shrink-0 ${STATUS_STYLE[c.status] ?? 'text-gray-500'}`}>
                  {c.pontos}/{c.pontosMaximos}
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(c.pontos / c.pontosMaximos) * 100}%`,
                    backgroundColor: c.status === 'aprovado' ? '#4A7C2F' : c.status === 'parcial' ? '#F59E0B' : '#DC2626',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico NDVI */}
      <div className="bg-white rounded-2xl border border-cred-gray-border p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">📈 Série Temporal NDVI (2019-2025)</h3>
        <p className="text-xs text-gray-400 mb-4">Linha tracejada vermelha = limiar mínimo (0,70)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={detalhes.ndviSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0.55, 0.9]} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0', fontSize: 12 }}
              formatter={(v) => [v.toFixed(3), 'NDVI']}
            />
            <ReferenceLine
              y={0.70}
              stroke="#DC2626"
              strokeDasharray="5 5"
              label={{ value: '0,70', position: 'insideTopRight', fontSize: 10, fill: '#DC2626' }}
            />
            <Line
              type="monotone"
              dataKey="ndvi"
              stroke="#4A7C2F"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2D5016', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#2D5016' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico MapBiomas */}
      <div className="bg-white rounded-2xl border border-cred-gray-border p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">📊 Distribuição Uso do Solo — MapBiomas</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={detalhes.mapabiomas.classes}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="percentual"
                  nameKey="nome"
                >
                  {detalhes.mapabiomas.classes.map((cls, i) => (
                    <Cell key={i} fill={cls.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {detalhes.mapabiomas.classes.map((cls, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cls.cor }} />
                  <span className="text-sm text-cred-gray-text">{cls.nome}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cls.percentual}%`, backgroundColor: cls.cor }} />
                  </div>
                  <span className="text-sm font-bold text-cred-gray-text w-8 text-right">{cls.percentual}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fontes */}
      <div className="bg-white rounded-xl border border-cred-gray-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Fontes de Dados</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {detalhes.fontesDados.map((f, i) => (
            <span key={i} className="px-2.5 py-1 bg-cred-gray-neutral rounded-lg text-xs text-gray-500 border border-cred-gray-border">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Aba 3: Rastreabilidade ──────────────────────────────────────────────────
function AbaRastreabilidade({ safraId }) {
  const rastr = mockRastreabilidade[safraId];
  const [verificado, setVerificado] = useState(false);

  if (!rastr) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-2">🔗</p>
        <p className="font-medium">Dados de rastreabilidade não disponíveis.</p>
      </div>
    );
  }

  const { cadeiaValida, ultimaVerificacao, eventos } = rastr;

  return (
    <div className="space-y-6">
      {/* Status da cadeia */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${cadeiaValida ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <span className="text-xl">{cadeiaValida ? '🔗' : '⚠️'}</span>
        <div>
          <p className={`font-semibold text-sm ${cadeiaValida ? 'text-green-800' : 'text-red-800'}`}>
            Cadeia de Rastreabilidade — {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
          </p>
          <p className={`text-xs mt-0.5 ${cadeiaValida ? 'text-green-700' : 'text-red-700'}`}>
            {cadeiaValida ? '✅ Cadeia íntegra — hashes verificados' : '❌ Irregularidade detectada na cadeia'}
            {' · '}
            Última verificação: {formatDate(ultimaVerificacao)}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {eventos.map((ev, i) => (
          <div key={ev.id} className="flex gap-4">
            {/* Linha vertical + dot */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center text-base z-10 ${COR_EVENTO_DOT[ev.cor] ?? 'border-gray-300'}`}>
                {ev.icone}
              </div>
              {i < eventos.length - 1 && (
                <div className="w-0.5 flex-1 bg-cred-gray-border my-1 min-h-[1.5rem]" />
              )}
            </div>

            {/* Card do evento */}
            <div className={`flex-1 rounded-xl border p-4 ${i < eventos.length - 1 ? 'mb-4' : ''} ${COR_EVENTO[ev.cor] ?? 'border-cred-gray-border bg-white'}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="font-semibold text-cred-gray-text text-sm">{ev.tipoLabel}</p>
                <time className="text-xs text-gray-400 shrink-0">{formatDate(ev.data)}</time>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Por:</span> {ev.responsavel}
              </p>

              {ev.observacao && (
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed italic">"{ev.observacao}"</p>
              )}

              {/* Dados extras */}
              {ev.dados && Object.keys(ev.dados).length > 0 && (
                <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(ev.dados).map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-1 text-xs">
                      <span className="text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className="font-medium text-cred-gray-text">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashes */}
              <div className="mt-2.5 pt-2.5 border-t border-black/5 space-y-0.5">
                <HashLine label="Hash" value={ev.hash} />
                {ev.hashAnterior
                  ? <HashLine label="Hash anterior" value={ev.hashAnterior} />
                  : <p className="text-xs text-gray-400 mt-1">← Início da cadeia</p>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão verificar */}
      <button
        type="button"
        onClick={() => setVerificado(true)}
        className="px-6 py-2.5 bg-cred-green-dark text-white rounded-xl font-medium hover:bg-cred-green-medium transition-colors text-sm"
      >
        🔍 Verificar Integridade da Cadeia
      </button>

      {verificado && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${cadeiaValida ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {cadeiaValida
            ? '✅ Cadeia válida — todos os hashes foram verificados com sucesso.'
            : '❌ Irregularidade detectada — um ou mais hashes não conferem.'}
        </div>
      )}
    </div>
  );
}

// ── Página Principal ────────────────────────────────────────────────────────
const ABAS = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'agroscore', label: 'AgroScore' },
  { id: 'rastreabilidade', label: 'Rastreabilidade' },
];

export default function SafraDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [modalAberto, setModalAberto] = useState(false);
  const [interesseConfirmado, setInteresseConfirmado] = useState(false);

  const safra = mockSafras.find((s) => s.id === Number(id));

  if (!safra) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">😔</p>
        <p className="text-gray-500 font-medium text-lg">Safra não encontrada.</p>
        <button type="button" onClick={() => navigate('/safras')} className="mt-4 text-sm text-cred-green-dark hover:underline">
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  const handleConfirmarInteresse = () => {
    setInteresseConfirmado(true);
    setTimeout(() => setInteresseConfirmado(false), 4000);
  };

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/safras')} className="flex items-center gap-2 text-sm text-cred-green-dark hover:underline">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
      </button>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-cred-gray-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-cred-gray-text">
              Safra #{safra.id} — {safra.nome}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <AgroScoreDisplay score={safra.agroScore} size="small" showLabel={false} />
              <span className="text-sm font-medium text-cred-green-dark">⭐ AgroScore: {safra.agroScore}/100</span>
              <StatusBadge status={safra.status} />
            </div>
            {safra.validadaEm && (
              <p className="text-xs text-gray-400">
                ✅ Validada em {new Date(safra.validadaEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="px-6 py-2.5 bg-cred-green-dark text-white font-semibold rounded-xl hover:bg-cred-green-medium transition-colors text-sm shrink-0"
          >
            Demonstrar Interesse
          </button>
        </div>
      </div>

      {interesseConfirmado && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
          ✅ Interesse registrado! A Amazon People entrará em contato.
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-2xl border border-cred-gray-border overflow-hidden">
        <div className="flex border-b border-cred-gray-border overflow-x-auto">
          {ABAS.map((aba) => (
            <button
              key={aba.id}
              type="button"
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                abaAtiva === aba.id
                  ? 'border-cred-green-dark text-cred-green-dark bg-green-50/40'
                  : 'border-transparent text-gray-500 hover:text-cred-gray-text'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {abaAtiva === 'visao-geral' && <AbaVisaoGeral safra={safra} onDemonstrarInteresse={() => setModalAberto(true)} />}
          {abaAtiva === 'agroscore' && <AbaAgroScore safraId={safra.id} />}
          {abaAtiva === 'rastreabilidade' && <AbaRastreabilidade safraId={safra.id} />}
        </div>
      </div>

      {modalAberto && (
        <InteresseModal safra={safra} onClose={() => setModalAberto(false)} onConfirm={handleConfirmarInteresse} />
      )}
    </div>
  );
}
