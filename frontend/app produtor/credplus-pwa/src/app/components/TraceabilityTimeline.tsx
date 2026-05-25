import { ArrowLeft, Filter, Search, Satellite, Shield, HardDrive, Clock, ChevronRight, MapPin, Camera } from "lucide-react";

type Screen = "dashboard" | "wizard" | "timeline" | "agroscore";

interface TraceabilityTimelineProps {
  onNavigate: (screen: Screen) => void;
}

type HarvestStatus = "local" | "satellite" | "corporate";

interface HarvestRecord {
  id: string;
  crop: string;
  quantity: string;
  unit: string;
  date: string;
  time: string;
  farm: string;
  status: HarvestStatus;
  hasGps: boolean;
  hasPhoto: boolean;
  mapbiomasId?: string;
}

const records: HarvestRecord[] = [
  {
    id: "h001",
    crop: "Soja",
    quantity: "2.4",
    unit: "t",
    date: "12/05/2026",
    time: "09:42",
    farm: "Faz. Júnior",
    status: "local",
    hasGps: true,
    hasPhoto: true,
  },
  {
    id: "h002",
    crop: "Milho",
    quantity: "5.1",
    unit: "t",
    date: "11/05/2026",
    time: "14:30",
    farm: "Faz. Júnior",
    status: "satellite",
    hasGps: true,
    hasPhoto: true,
    mapbiomasId: "MB-2026-042891",
  },
  {
    id: "h003",
    crop: "Café",
    quantity: "0.8",
    unit: "t",
    date: "10/05/2026",
    time: "11:15",
    farm: "Faz. Família Silva",
    status: "corporate",
    hasGps: true,
    hasPhoto: true,
    mapbiomasId: "MB-2026-039445",
  },
  {
    id: "h004",
    crop: "Soja",
    quantity: "3.7",
    unit: "t",
    date: "08/05/2026",
    time: "07:55",
    farm: "Faz. Família Silva",
    status: "corporate",
    hasGps: true,
    hasPhoto: false,
    mapbiomasId: "MB-2026-037120",
  },
  {
    id: "h005",
    crop: "Milho",
    quantity: "1.2",
    unit: "t",
    date: "06/05/2026",
    time: "16:00",
    farm: "Faz. Teste 1",
    status: "satellite",
    hasGps: true,
    hasPhoto: true,
    mapbiomasId: "MB-2026-031005",
  },
  {
    id: "h006",
    crop: "Algodão",
    quantity: "4.9",
    unit: "t",
    date: "03/05/2026",
    time: "10:22",
    farm: "Faz. Teste 1",
    status: "local",
    hasGps: false,
    hasPhoto: true,
  },
];

const statusConfig = {
  local: {
    label: "Salvo Local",
    bg: "#fff3e0",
    text: "#e67e22",
    icon: HardDrive,
    iconBg: "#fff3e0",
    timeline: "#e67e22",
    desc: "Aguardando sincronização para validação",
  },
  satellite: {
    label: "Sat. Validação em Curso",
    bg: "#e3f2fd",
    text: "#1e88c8",
    icon: Satellite,
    iconBg: "#e3f2fd",
    timeline: "#1e88c8",
    desc: "Validação MapBiomas em andamento",
  },
  corporate: {
    label: "Corporate Ready",
    bg: "#e8f0e1",
    text: "#2d6a1f",
    icon: Shield,
    iconBg: "#e8f0e1",
    timeline: "#27ae60",
    desc: "Pronto para relatório corporativo",
  },
};

const filterOptions: { value: HarvestStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "local", label: "Offline" },
  { value: "satellite", label: "MapBiomas" },
  { value: "corporate", label: "Corp. Ready" },
];

export function TraceabilityTimeline({ onNavigate }: TraceabilityTimelineProps) {
  const counts = {
    local: records.filter((r) => r.status === "local").length,
    satellite: records.filter((r) => r.status === "satellite").length,
    corporate: records.filter((r) => r.status === "corporate").length,
  };

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
            <h1 className="text-white text-base">Rastreabilidade</h1>
            <p className="text-[#a8d890] text-xs">{records.length} registros encontrados</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Filter size={16} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-white/60" />
          <span className="text-white/40 text-sm">Buscar safra, cultura...</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white px-5 py-3 flex gap-3 border-b border-[#eaf0e5]">
        <SummaryChip
          count={counts.local}
          label="Offline"
          bg="#fff3e0"
          text="#e67e22"
          icon={HardDrive}
        />
        <SummaryChip
          count={counts.satellite}
          label="MapBiomas"
          bg="#e3f2fd"
          text="#1e88c8"
          icon={Satellite}
        />
        <SummaryChip
          count={counts.corporate}
          label="Corp. Ready"
          bg="#e8f0e1"
          text="#2d6a1f"
          icon={Shield}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-5 py-2 flex gap-2 border-b border-[#eaf0e5] overflow-x-auto no-scrollbar">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs bg-[#eaf0e5] text-[#2d6a1f] first:bg-[#2d6a1f] first:text-white"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#d4e8c8]" />

          <div className="space-y-4">
            {records.map((record, _idx) => {
              const cfg = statusConfig[record.status];
              const Icon = cfg.icon;
              return (
                <div key={record.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: cfg.timeline }}
                  />

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Status stripe */}
                    <div className="h-1" style={{ background: cfg.timeline }} />

                    <div className="p-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[#1a2410] text-sm">{record.crop}</h3>
                            <span className="text-[#5a7050] text-xs">·</span>
                            <span className="text-[#5a7050] text-xs">{record.quantity} {record.unit}</span>
                          </div>
                          <p className="text-[#5a7050] text-xs mt-0.5">{record.farm}</p>
                        </div>
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
                          style={{ background: cfg.bg, color: cfg.text }}
                        >
                          <Icon size={10} />
                          {cfg.label}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[#5a7050] text-xs mb-3">{cfg.desc}</p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-[#5a7050]" />
                            <span className="text-[#5a7050] text-[10px]">{record.date} {record.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className={record.hasGps ? "text-[#27ae60]" : "text-[#bdbdbd]"} />
                            <Camera size={11} className={record.hasPhoto ? "text-[#27ae60]" : "text-[#bdbdbd]"} />
                          </div>
                        </div>
                        {record.mapbiomasId && (
                          <span className="text-[10px] text-[#1e88c8] bg-[#e3f2fd] px-2 py-0.5 rounded-full">
                            {record.mapbiomasId}
                          </span>
                        )}
                      </div>

                      {/* Progress bar for satellite */}
                      {record.status === "satellite" && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-[#5a7050] mb-1">
                            <span>Processamento MapBiomas</span>
                            <span>67%</span>
                          </div>
                          <div className="h-1.5 bg-[#e3f2fd] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1e88c8] rounded-full" style={{ width: "67%" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {record.status === "corporate" && (
                      <div className="px-4 pb-3">
                        <button className="w-full py-2.5 rounded-xl bg-[#e8f0e1] text-[#2d6a1f] text-xs flex items-center justify-center gap-1.5">
                          Ver Certificado <ChevronRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}

function SummaryChip({
  count, label, bg, text, icon: Icon
}: {
  count: number;
  label: string;
  bg: string;
  text: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="flex-1 rounded-xl px-3 py-2 flex items-center gap-2"
      style={{ background: bg }}
    >
      <Icon size={14} style={{ color: text }} />
      <div>
        <div className="text-sm" style={{ color: text }}>{count}</div>
        <div className="text-[10px]" style={{ color: text + "aa" }}>{label}</div>
      </div>
    </div>
  );
}
