import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Plus, ClipboardCheck, ChevronRight, Leaf, Droplets, Sun, TrendingUp, Bell, User } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

type Screen = "dashboard" | "wizard" | "timeline" | "agroscore";

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const syncStates = ["offline", "syncing", "synced"] as const;
type SyncState = (typeof syncStates)[number];

const pendingItems = [
  { id: 1, crop: "Soja", qty: "2.4 t", date: "Hoje, 08:12", status: "local" },
  { id: 2, crop: "Milho", qty: "5.1 t", date: "Ontem, 14:30", status: "pending" },
  { id: 3, crop: "Café", qty: "0.8 t", date: "10/05", status: "satellite" },
];

const quickStats = [
  { label: "Safras", value: "12", icon: Leaf, color: "#2d6a1f" },
  { label: "Chuva", value: "42mm", icon: Droplets, color: "#1e88c8" },
  { label: "Clima", value: "28°C", icon: Sun, color: "#f0c040" },
  { label: "Crédito", value: "+R$1.2k", icon: TrendingUp, color: "#27ae60" },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncState((prev) => {
        if (prev === "offline") return "syncing";
        if (prev === "syncing") return "synced";
        return "offline";
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (syncState === "syncing") {
      const interval = setInterval(() => {
        setSyncProgress((p) => Math.min(p + 8, 100));
      }, 400);
      return () => clearInterval(interval);
    } else {
      setSyncProgress(0);
    }
  }, [syncState]);

  const agroScore = 78;
  const chartData = [{ value: agroScore, fill: "#2d6a1f" }];

  const syncConfig = {
    offline: { bg: "bg-[#e67e22]", icon: WifiOff, label: "Trabalhando Offline", sub: "3 registros pendentes para sincronizar" },
    syncing: { bg: "bg-[#3498db]", icon: RefreshCw, label: "Sincronizando Dados...", sub: `${syncProgress}% concluído` },
    synced: { bg: "bg-[#27ae60]", icon: Wifi, label: "Sincronizado", sub: "Todos os dados atualizados" },
  };

  const cfg = syncConfig[syncState];
  const SyncIcon = cfg.icon;

  return (
    <div className="flex flex-col h-full bg-[#f5f7f2]">
      {/* Header */}
      <div className="bg-[#2d6a1f] px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[#a8d890] text-xs">Bom dia, Arthur</p>
          <h1 className="text-white text-lg">Cred+</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </button>
          <button className="w-9 h-9 rounded-full bg-[#f0c040] flex items-center justify-center">
            <User size={18} className="text-[#1a2410]" />
          </button>
        </div>
      </div>

      {/* Sync Status Bar */}
      <div className={`${cfg.bg} px-5 py-3 flex items-center gap-3 transition-colors duration-500`}>
        <SyncIcon
          size={18}
          className={`text-white ${syncState === "syncing" ? "animate-spin" : ""}`}
        />
        <div className="flex-1">
          <p className="text-white text-sm">{cfg.label}</p>
          <p className="text-white/70 text-xs">{cfg.sub}</p>
        </div>
        {syncState === "syncing" && (
          <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-400"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        )}
        {syncState === "offline" && (
          <button
            onClick={() => setSyncState("syncing")}
            className="text-white/90 text-xs bg-white/20 px-3 py-1 rounded-full"
          >
            Tentar
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* AgroScore Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#2d6a1f]/10">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-[#1a2410] text-base">AgroScore</h2>
              <p className="text-[#5a7050] text-xs">Pontuação de Sustentabilidade</p>
            </div>
            <button
              onClick={() => onNavigate("agroscore")}
              className="text-[#2d6a1f] text-xs flex items-center gap-1 bg-[#e8f0e1] px-3 py-1.5 rounded-full"
            >
              Detalhes <ChevronRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  data={chartData}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    background={{ fill: "#eaf0e5" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-center -mt-4 -ml-36 absolute" style={{ position: "relative", left: 0, top: 0 }}>
              </div>
              <div>
                <div className="text-4xl text-[#2d6a1f]">{agroScore}</div>
                <div className="text-[#5a7050] text-xs">de 100 pontos</div>
              </div>
              <div className="space-y-1.5">
                <ScoreBar label="Práticas" value={85} color="#27ae60" />
                <ScoreBar label="Carbono" value={70} color="#f0c040" />
                <ScoreBar label="Trabalho" value={80} color="#3498db" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: stat.color + "22" }}>
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
                <span className="text-[#1a2410] text-sm">{stat.value}</span>
                <span className="text-[#5a7050] text-[10px]">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("wizard")}
            className="bg-[#2d6a1f] rounded-2xl p-4 flex flex-col items-start gap-2 active:scale-95 transition-transform shadow-md"
            style={{ minHeight: 96 }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={22} className="text-white" />
            </div>
            <span className="text-white text-sm leading-tight">Novo Registro de Safra</span>
          </button>
          <button
            onClick={() => onNavigate("timeline")}
            className="bg-[#f0c040] rounded-2xl p-4 flex flex-col items-start gap-2 active:scale-95 transition-transform shadow-md"
            style={{ minHeight: 96 }}
          >
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
              <ClipboardCheck size={22} className="text-[#1a2410]" />
            </div>
            <span className="text-[#1a2410] text-sm leading-tight">Ver Validações Pendentes</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#1a2410] text-sm">Atividade Recente</h3>
            <button onClick={() => onNavigate("timeline")} className="text-[#2d6a1f] text-xs">Ver todas</button>
          </div>
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#eaf0e5] flex items-center justify-center">
                  <Leaf size={16} className="text-[#2d6a1f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a2410] text-sm">{item.crop} — {item.qty}</p>
                  <p className="text-[#5a7050] text-xs">{item.date}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between">
        <span className="text-[#5a7050] text-[10px]">{label}</span>
        <span className="text-[10px]" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#eaf0e5] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    local: { label: "Salvo Local", bg: "#fff3e0", text: "#e67e22" },
    pending: { label: "Sat. em Curso", bg: "#e3f2fd", text: "#1e88c8" },
    satellite: { label: "MapBiomas", bg: "#e8f5e9", text: "#2d6a1f" },
    corporate: { label: "Corp. Ready", bg: "#f3e5f5", text: "#8e24aa" },
  };
  const cfg = configs[status] || configs.local;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
