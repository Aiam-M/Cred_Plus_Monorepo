import { ArrowLeft, Info, TrendingUp, TrendingDown, Minus, Leaf, Wind, Users, Droplets, ChevronRight } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  RadialBarChart, RadialBar, PolarAngleAxis as RadialPolarAngleAxis
} from "recharts";

type Screen = "dashboard" | "wizard" | "timeline" | "agroscore";

interface AgroScoreDetailProps {
  onNavigate: (screen: Screen) => void;
}

const monthlyData = [
  { month: "Dez", score: 64 },
  { month: "Jan", score: 68 },
  { month: "Fev", score: 71 },
  { month: "Mar", score: 74 },
  { month: "Abr", score: 75 },
  { month: "Mai", score: 78 },
];

const radarData = [
  { metric: "Solo", value: 82 },
  { metric: "Água", value: 68 },
  { metric: "Carbono", value: 70 },
  { metric: "Trabalho", value: 80 },
  { metric: "Biodiv.", value: 75 },
  { metric: "Energia", value: 65 },
];

const metrics = [
  {
    id: "regenerative",
    icon: Leaf,
    label: "Práticas Regenerativas",
    score: 85,
    color: "#27ae60",
    trend: "up",
    delta: "+5",
    desc: "Rotação de culturas, adubação verde e manejo de solo saudável.",
    details: [
      { name: "Rotação de Culturas", value: 92, max: 100 },
      { name: "Adubação Orgânica", value: 78, max: 100 },
      { name: "Conservação do Solo", value: 85, max: 100 },
    ],
  },
  {
    id: "carbon",
    icon: Wind,
    label: "Impacto de Carbono",
    score: 70,
    color: "#3498db",
    trend: "up",
    delta: "+3",
    desc: "Emissões neutralizadas e sequestro de carbono monitorado via satélite.",
    details: [
      { name: "Emissão Evitada", value: 72, max: 100 },
      { name: "Sequestro (tons CO₂)", value: 68, max: 100 },
      { name: "Energia Renovável", value: 70, max: 100 },
    ],
  },
  {
    id: "labor",
    icon: Users,
    label: "Padrões de Trabalho",
    score: 80,
    color: "#e67e22",
    trend: "stable",
    delta: "=",
    desc: "Conformidade trabalhista, bem-estar do produtor e cadeia justa.",
    details: [
      { name: "Regularização", value: 90, max: 100 },
      { name: "Bem-estar", value: 75, max: 100 },
      { name: "Cadeia Justa", value: 75, max: 100 },
    ],
  },
  {
    id: "water",
    icon: Droplets,
    label: "Uso da Água",
    score: 68,
    color: "#1e88c8",
    trend: "down",
    delta: "-2",
    desc: "Eficiência de irrigação e proteção de recursos hídricos locais.",
    details: [
      { name: "Eficiência Irrigação", value: 62, max: 100 },
      { name: "Recarga de Aquífero", value: 74, max: 100 },
      { name: "Proteção de Nascentes", value: 68, max: 100 },
    ],
  },
];

const badges = [
  { label: "Produtor Regenerativo", color: "#27ae60", bg: "#e8f5e9" },
  { label: "Carbono Neutro 2025", color: "#1e88c8", bg: "#e3f2fd" },
  { label: "Trabalho Digno", color: "#e67e22", bg: "#fff3e0" },
];

export function AgroScoreDetail({ onNavigate }: AgroScoreDetailProps) {
  const overallScore = 78;
  const chartData = [{ value: overallScore, fill: "#2d6a1f" }];

  return (
    <div className="flex flex-col h-full bg-[#f5f7f2]">
      {/* Header */}
      <div className="bg-[#2d6a1f] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-base">AgroScore — Análise Completa</h1>
            <p className="text-[#a8d890] text-xs">Atualizado em 12/05/2026</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Info size={16} className="text-white" />
          </button>
        </div>

        {/* Hero Score */}
        <div className="flex items-center gap-5">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={chartData}
              >
                <RadialPolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  background={{ fill: "rgba(255,255,255,0.15)" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="text-5xl text-white">{overallScore}</div>
            <div className="text-[#a8d890] text-xs mb-2">de 100 pontos</div>
            <div className="flex items-center gap-1.5 bg-[#f0c040]/20 px-3 py-1.5 rounded-full">
              <TrendingUp size={13} className="text-[#f0c040]" />
              <span className="text-[#f0c040] text-xs">+8 vs. trimestre anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Trend Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[#1a2410] text-sm">Evolução do Score</h2>
              <p className="text-[#5a7050] text-xs">Últimos 6 meses</p>
            </div>
            <span className="text-[#27ae60] text-xs bg-[#e8f5e9] px-2 py-0.5 rounded-full">+14 pts</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a1f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2d6a1f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaf0e5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#5a7050" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "#5a7050" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #eaf0e5", borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`${v} pts`, "Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2d6a1f"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "#2d6a1f", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#1a2410] text-sm">Dimensões de Sustentabilidade</h2>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <PolarGrid stroke="#eaf0e5" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#5a7050" }} />
                <Radar
                  dataKey="value"
                  stroke="#2d6a1f"
                  fill="#2d6a1f"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric Cards */}
        <div>
          <h2 className="text-[#1a2410] text-sm mb-3">Métricas Detalhadas</h2>
          <div className="space-y-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const TrendIcon =
                metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
              const trendColor =
                metric.trend === "up" ? "#27ae60" : metric.trend === "down" ? "#e74c3c" : "#95a5a6";

              return (
                <div key={metric.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: metric.color + "22" }}
                        >
                          <Icon size={18} style={{ color: metric.color }} />
                        </div>
                        <div>
                          <h3 className="text-[#1a2410] text-sm">{metric.label}</h3>
                          <p className="text-[#5a7050] text-xs">{metric.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#1a2410] text-lg">{metric.score}</span>
                        <div className="flex items-center gap-0.5" style={{ color: trendColor }}>
                          <TrendIcon size={11} />
                          <span className="text-[10px]">{metric.delta}</span>
                        </div>
                      </div>
                    </div>

                    {/* Main bar */}
                    <div className="h-2 bg-[#eaf0e5] rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${metric.score}%`, background: metric.color }}
                      />
                    </div>

                    {/* Sub-metrics */}
                    <div className="space-y-2">
                      {metric.details.map((d) => (
                        <div key={d.name}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[#5a7050] text-[11px]">{d.name}</span>
                            <span className="text-[11px]" style={{ color: metric.color }}>{d.value}</span>
                          </div>
                          <div className="h-1 bg-[#eaf0e5] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(d.value / d.max) * 100}%`, background: metric.color + "88" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-[#1a2410] text-sm mb-3">Certificações Conquistadas</h2>
          <div className="space-y-2">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: badge.bg }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: badge.color }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l2.5 2.5L10 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm flex-1" style={{ color: badge.color }}>{badge.label}</span>
                <ChevronRight size={14} style={{ color: badge.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-[#2d6a1f] rounded-2xl p-5">
          <p className="text-[#a8d890] text-xs mb-1">Próximo passo recomendado</p>
          <h3 className="text-white text-sm mb-2">Melhore o score de Água para +5 pts</h3>
          <p className="text-white/70 text-xs mb-4">
            Instale medidores de fluxo nas irrigações e registre o consumo para alcançar a faixa Platina.
          </p>
          <button className="w-full py-3 rounded-xl bg-[#f0c040] text-[#1a2410] text-sm active:scale-95 transition-transform">
            Criar Plano de Ação
          </button>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
