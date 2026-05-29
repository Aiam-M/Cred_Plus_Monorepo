import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Satellite, Leaf, TreePine, Flame, Info } from 'lucide-react';

// Faixas conforme o cálculo real do backend (AgroScoreService.gerarNota):
// corte em 90, 70 e 60. Abaixo de 60 é considerado crítico.
const CLASSIFICACOES = [
  { faixa: '90–100', nivel: 'Excelente', descricao: 'Práticas exemplares de conservação', bg: '#2D5016', text: 'white' },
  { faixa: '70–89', nivel: 'Bom', descricao: 'Boas práticas com pontos de atenção', bg: '#4A7C2F', text: 'white' },
  { faixa: '60–69', nivel: 'Regular', descricao: 'Conformidade no limite mínimo', bg: '#F59E0B', text: 'white' },
  { faixa: '0–59', nivel: 'Crítico', descricao: 'Abaixo dos requisitos mínimos', bg: '#DC2626', text: 'white' },
];

const FONTES = [
  {
    icone: <Satellite className="w-6 h-6" />,
    nome: 'Sentinel-2 — ESA Copernicus',
    descricao: 'Satélites europeus que fotografam toda a superfície terrestre a cada 5 dias com resolução de 10 metros. Mede a saúde e densidade da vegetação hoje, usando a reflexão da luz em diferentes faixas do espectro.',
    destaque: 'Quanto mais densa e viva a vegetação, maior o valor captado.',
  },
  {
    icone: <Leaf className="w-6 h-6" />,
    nome: 'MapBiomas',
    descricao: 'Projeto brasileiro que classifica o uso do solo de todo o território nacional ano a ano desde 1985. Diz o que tem em cada pedaço de terra — se é floresta, pastagem, agricultura, água ou área urbana.',
    destaque: 'Atualizado anualmente.',
  },
  {
    icone: <TreePine className="w-6 h-6" />,
    nome: 'Hansen Global Forest Change',
    descricao: 'Base de dados da Universidade de Maryland que mapeia a cobertura florestal do planeta desde o ano 2000. Não mede saúde vegetativa — mede histórico: onde havia floresta em 2000 e onde ela foi perdida ao longo dos anos.',
    destaque: 'Áreas com longa ocupação humana naturalmente têm Hansen menor porque a floresta original foi sendo convertida para uso produtivo ao longo de décadas.',
  },
  {
    icone: <Flame className="w-6 h-6" />,
    nome: 'MODIS Burned Area — NASA',
    descricao: 'Sensor dos satélites Terra e Aqua da NASA que detecta áreas queimadas mensalmente em todo o planeta. Registra onde e quando houve fogo.',
    destaque: 'Não distingue automaticamente entre queimada criminosa e manejo tradicional controlado.',
  },
];

const CRITERIOS = [
  {
    numero: 1,
    nome: 'Cobertura Vegetal Densa',
    pontos: 30,
    fonte: 'Sentinel-2',
    cor: '#2D5016',
    descricao: 'Usa o NDVI, índice que mede o verdor e densidade da vegetação. Varia de -1 a +1.',
    tabela: [
      { valor: 'Abaixo de 0,2', descricao: 'Solo exposto ou vegetação morta' },
      { valor: '0,2 a 0,5', descricao: 'Vegetação esparsa' },
      { valor: '0,5 a 0,7', descricao: 'Vegetação moderada' },
      { valor: 'Acima de 0,7', descricao: 'Vegetação densa e saudável', destaque: true },
    ],
    regra: 'Calculamos a média anual de 2019 a 2025. NDVI médio ≥ 0,70 garante os 30 pontos. Abaixo disso, pontuação proporcional.',
  },
  {
    numero: 2,
    nome: 'Manutenção de Floresta Nativa',
    pontos: 25,
    fonte: 'MapBiomas',
    cor: '#4A7C2F',
    descricao: 'Mede o percentual da área classificada como floresta nativa no levantamento mais recente.',
    regra: '≥ 30% garante os 25 pontos, baseado na Reserva Legal mínima do Código Florestal. Abaixo disso, pontuação proporcional.',
    nota: 'Propriedades de agricultura familiar que integram produção com vegetação — como sistemas agroflorestais de cacau e açaí — tendem a manter parte da cobertura nativa e pontuam bem aqui.',
  },
  {
    numero: 3,
    nome: 'Recuperação de Vegetação',
    pontos: 20,
    fonte: 'Sentinel-2',
    cor: '#4A7C2F',
    descricao: 'Compara o NDVI de 2023 com o ano mais recente disponível.',
    regra: 'Qualquer variação positiva garante os 20 pontos. Variação zero ou negativa zera o critério.',
    nota: 'Uma queda de NDVI em 2023, causada pela grande seca amazônica daquele ano, seguida de recuperação em 2025 é sinal positivo.',
  },
  {
    numero: 4,
    nome: 'Controle de Perda de Cobertura',
    pontos: 15,
    fonte: 'Hansen Global Forest Change',
    cor: '#F59E0B',
    descricao: 'Verifica, pelos dados Hansen, se houve perda significativa de cobertura florestal na área.',
    tabela: [
      { valor: 'Sem perda detectada', descricao: '→ 15 pontos', destaque: true },
      { valor: 'Perda detectada', descricao: '→ pontuação parcial (12 pts)' },
    ],
    regra: 'Quando o Hansen não acusa perda de cobertura na área, o critério recebe a pontuação total. Se há perda registrada, a pontuação é parcial.',
    nota: 'Esta versão usa o histórico de perda do Hansen. A detecção mensal de fogo (MODIS) está prevista como evolução futura da metodologia.',
  },
  {
    numero: 5,
    nome: 'Histórico de Cobertura Florestal',
    pontos: 10,
    fonte: 'Hansen Global Forest Change',
    cor: '#8B956D',
    descricao: 'Avalia a cobertura arbórea que a área tinha em 2000 como linha de base histórica.',
    regra: 'É o critério mais sensível para a agricultura familiar — propriedades ocupadas há décadas naturalmente tiveram redução de cobertura ao longo do tempo, porque a floresta foi gradualmente convertida para uso produtivo.',
    nota: 'A pontuação considera que conversão histórica para agrofloresta familiar é diferente de desmatamento ilegal recente.',
  },
];

function TabelaNDVI({ linhas }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-cred-gray-border">
      {linhas.map((linha, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-4 py-2.5 text-sm ${
            linha.destaque
              ? 'bg-green-50 font-medium text-cred-green-dark'
              : i % 2 === 0 ? 'bg-white text-cred-gray-text' : 'bg-cred-gray-neutral text-cred-gray-text'
          }`}
        >
          <span className="font-mono text-xs">{linha.valor}</span>
          <span>{linha.descricao}</span>
        </div>
      ))}
    </div>
  );
}

function CardFonte({ fonte }) {
  return (
    <div className="bg-white rounded-2xl border border-cred-gray-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-cred-beige flex items-center justify-center text-cred-green-dark shrink-0">
          {fonte.icone}
        </div>
        <div>
          <h3 className="text-sm font-bold text-cred-gray-text">{fonte.nome}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{fonte.descricao}</p>
      <p className="text-xs text-cred-green-dark font-medium mt-2 leading-relaxed">{fonte.destaque}</p>
    </div>
  );
}

function CardCriterio({ criterio }) {
  return (
    <div className="bg-white rounded-2xl border border-cred-gray-border p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: criterio.cor }}
          >
            {criterio.numero}
          </div>
          <h3 className="font-bold text-cred-gray-text">{criterio.nome}</h3>
        </div>
        <div className="shrink-0 text-right">
          <span
            className="text-lg font-bold"
            style={{ color: criterio.cor }}
          >
            {criterio.pontos} pts
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Fonte: {criterio.fonte}</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${criterio.pontos}%`, backgroundColor: criterio.cor }}
        />
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{criterio.descricao}</p>

      {criterio.tabela && <TabelaNDVI linhas={criterio.tabela} />}

      <div className="mt-3 p-3 bg-cred-beige rounded-xl">
        <p className="text-xs text-cred-gray-text leading-relaxed">
          <span className="font-semibold">Como é calculado: </span>
          {criterio.regra}
        </p>
      </div>

      {criterio.nota && (
        <div className="mt-2.5 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cred-blue-info shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed italic">{criterio.nota}</p>
        </div>
      )}
    </div>
  );
}

export default function AgroScoreInfo() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-cred-green-dark hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-cred-gray-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-cred-green-dark flex items-center justify-center shrink-0">
            <Satellite className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cred-gray-text">O Que é o AgroScore?</h1>
            <p className="text-sm text-gray-500">Metodologia de avaliação ambiental por satélite</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mt-4">
          Pontuação de <strong>0 a 100</strong> calculada automaticamente com dados reais de satélite.{' '}
          Nenhum dado é autodeclarado — tudo é verificado por sistemas internacionais de observação da Terra.
        </p>
      </div>

      {/* Tabela de classificação */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Classificações</h2>
        <div className="rounded-2xl overflow-hidden border border-cred-gray-border">
          {CLASSIFICACOES.map((c) => (
            <div
              key={c.faixa}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-cred-gray-border bg-white"
            >
              <div
                className="w-16 text-center py-1 rounded-lg text-xs font-bold shrink-0"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {c.faixa}
              </div>
              <div className="font-semibold text-cred-gray-text w-24 shrink-0">{c.nivel}</div>
              <div className="text-sm text-gray-500">{c.descricao}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fontes de dados */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">As 4 Fontes de Dados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FONTES.map((f) => (
            <CardFonte key={f.nome} fonte={f} />
          ))}
        </div>
      </div>

      {/* Critérios */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Os 5 Critérios</h2>
        <div className="space-y-4">
          {CRITERIOS.map((c) => (
            <CardCriterio key={c.numero} criterio={c} />
          ))}
        </div>
      </div>

      {/* Total de pontos */}
      <div className="bg-cred-beige rounded-2xl border border-cred-gray-border p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-cred-gray-text">Total possível</p>
          <p className="text-xs text-gray-500 mt-0.5">Soma dos 5 critérios</p>
        </div>
        <div className="text-3xl font-bold text-cred-green-dark">100 pts</div>
      </div>
    </div>
  );
}
