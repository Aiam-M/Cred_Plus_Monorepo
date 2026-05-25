import { useState } from "react";
import {
  ArrowLeft, ChevronRight, MapPin, Camera, Carrot, Check,
  Coffee, Leaf, Plus, Minus, Navigation, Image as ImageIcon,
  CheckCircle2
} from "lucide-react";

type Screen = "dashboard" | "wizard" | "timeline" | "agroscore";

interface HarvestWizardProps {
  onNavigate: (screen: Screen) => void;
}

const crops = [
  { id: "soja", label: "Soja", icon: Leaf, color: "#27ae60" },
  { id: "palma", label: "Palma", icon: Leaf, color: "#f0c040" },
  { id: "cafe", label: "Café", icon: Coffee, color: "#8b6914" },
  { id: "mandioca", label: "Mandioca", icon: Carrot, color: "#95a5a6" },
  { id: "cana", label: "Cana", icon: Leaf, color: "#2ecc71" },
  { id: "outro", label: "Outro", icon: Plus, color: "#7f8c8d" },
];

export function HarvestWizard({ onNavigate }: HarvestWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1.0);
  const [unit, setUnit] = useState<"t" | "kg" | "sc">("t");
  const [hasLocation, setHasLocation] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [captureMode, setCaptureMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onNavigate("dashboard");
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => onNavigate("timeline"), 1800);
  };

  const canProceed1 = selectedCrop !== null;
  const canProceed2 = hasLocation;

  return (
    <div className="flex flex-col h-full bg-[#f5f7f2]">
      {/* Header */}
      <div className="bg-[#2d6a1f] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-base">Novo Registro de Safra</h1>
            <p className="text-[#a8d890] text-xs">Passo {step} de 3</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  s < step
                    ? "bg-[#f0c040] text-[#1a2410]"
                    : s === step
                    ? "bg-white text-[#2d6a1f]"
                    : "bg-white/20 text-white/50"
                }`}
              >
                {s < step ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f0c040] transition-all duration-500"
                    style={{ width: step > s ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <Step1
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            quantity={quantity}
            setQuantity={setQuantity}
            unit={unit}
            setUnit={setUnit}
          />
        )}
        {step === 2 && (
          <Step2
            hasLocation={hasLocation}
            setHasLocation={setHasLocation}
            hasPhoto={hasPhoto}
            setHasPhoto={setHasPhoto}
            captureMode={captureMode}
            setCaptureMode={setCaptureMode}
          />
        )}
        {step === 3 && (
          <Step3
            crop={selectedCrop}
            quantity={quantity}
            unit={unit}
            hasLocation={hasLocation}
            hasPhoto={hasPhoto}
            saved={saved}
          />
        )}
      </div>

      {/* Footer Action */}
      {!saved && (
        <div className="px-5 py-5 bg-white border-t border-[#2d6a1f]/10">
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !canProceed1 : !canProceed2}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all ${
                (step === 1 ? canProceed1 : canProceed2)
                  ? "bg-[#2d6a1f] text-white active:scale-95"
                  : "bg-[#eaf0e5] text-[#5a7050]"
              }`}
            >
              Próximo Passo <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl bg-[#2d6a1f] text-white flex items-center justify-center gap-2 text-base active:scale-95 transition-all shadow-md"
            >
              <Check size={18} /> Salvar Localmente
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Step1({
  selectedCrop, setSelectedCrop, quantity, setQuantity, unit, setUnit
}: {
  selectedCrop: string | null;
  setSelectedCrop: (v: string) => void;
  quantity: number;
  setQuantity: (v: number) => void;
  unit: "t" | "kg" | "sc";
  setUnit: (v: "t" | "kg" | "sc") => void;
}) {
  return (
    <div className="px-5 py-5 space-y-6">
      <div>
        <h2 className="text-[#1a2410] text-base mb-1">Selecione a Cultura</h2>
        <p className="text-[#5a7050] text-sm mb-4">Toque para escolher o tipo de safra</p>
        <div className="grid grid-cols-3 gap-3">
          {crops.map((crop) => {
            const Icon = crop.icon;
            const selected = selectedCrop === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all active:scale-95 ${
                  selected
                    ? "border-[#2d6a1f] bg-[#e8f0e1]"
                    : "border-transparent bg-white"
                }`}
                style={{ minHeight: 88 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: crop.color + "22" }}
                >
                  <Icon size={20} style={{ color: crop.color }} />
                </div>
                <span className="text-[#1a2410] text-xs">{crop.label}</span>
                {selected && <Check size={12} className="text-[#2d6a1f]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-[#1a2410] text-base mb-4">Quantidade</h2>
        {/* Unit selector */}
        <div className="flex gap-2 mb-4">
          {(["t", "kg", "sc"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-colors ${
                unit === u ? "bg-[#2d6a1f] text-white" : "bg-white text-[#5a7050]"
              }`}
            >
              {u === "t" ? "Toneladas" : u === "kg" ? "Quilos" : "Sacas"}
            </button>
          ))}
        </div>

        {/* Large quantity input */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setQuantity(Math.max(0.1, +(quantity - 0.1).toFixed(1)))}
            className="w-14 h-14 rounded-full bg-[#eaf0e5] flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus size={22} className="text-[#2d6a1f]" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-5xl text-[#1a2410]">{quantity.toFixed(1)}</div>
            <div className="text-[#5a7050] text-sm mt-1">{unit}</div>
          </div>
          <button
            onClick={() => setQuantity(+(quantity + 0.1).toFixed(1))}
            className="w-14 h-14 rounded-full bg-[#2d6a1f] flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2({
  hasLocation, setHasLocation, hasPhoto, setHasPhoto, captureMode, setCaptureMode
}: {
  hasLocation: boolean;
  setHasLocation: (v: boolean) => void;
  hasPhoto: boolean;
  setHasPhoto: (v: boolean) => void;
  captureMode: boolean;
  setCaptureMode: (v: boolean) => void;
}) {
  return (
    <div className="px-5 py-5 space-y-5">
      {/* Geo-location */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#e3f2fd] flex items-center justify-center">
              <MapPin size={20} className="text-[#1e88c8]" />
            </div>
            <div>
              <h2 className="text-[#1a2410] text-base">Localização GPS</h2>
              <p className="text-[#5a7050] text-sm">Vincule as coordenadas da colheita</p>
            </div>
          </div>

          {/* Map placeholder */}
          <div
            className="w-full h-40 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 40%, #81c784 70%, #66bb6a 100%)" }}
          >
            {/* Fake map grid */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-[#2d6a1f]" style={{ top: `${i * 20}%` }} />
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute h-full w-px bg-[#2d6a1f]" style={{ left: `${i * 20}%` }} />
              ))}
            </div>
            {hasLocation ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[#2d6a1f] rounded-full flex items-center justify-center shadow-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="bg-white/90 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-[#1a2410] text-xs">-15.7942° S, -47.8822° W</p>
                  <p className="text-[#2d6a1f] text-[10px]">Precisão: 4m · GPS</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Navigation size={28} className="text-[#2d6a1f] mx-auto mb-2 opacity-60" />
                <p className="text-[#2d6a1f] text-sm opacity-80">Aguardando GPS...</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setHasLocation(true)}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95 ${
              hasLocation
                ? "bg-[#e8f0e1] text-[#2d6a1f]"
                : "bg-[#2d6a1f] text-white"
            }`}
          >
            {hasLocation ? (
              <><CheckCircle2 size={16} /> Localização Capturada</>
            ) : (
              <><Navigation size={16} /> Capturar Localização Atual</>
            )}
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#fff3e0] flex items-center justify-center">
              <Camera size={20} className="text-[#e67e22]" />
            </div>
            <div>
              <h2 className="text-[#1a2410] text-base">Capturar Evidência</h2>
              <p className="text-[#5a7050] text-sm">Foto da produção ou documento</p>
            </div>
          </div>

          {captureMode ? (
            <div className="space-y-3">
              {/* Fake camera viewfinder */}
              <div
                className="w-full h-48 bg-black rounded-xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-[#f0c040] rounded-lg opacity-70">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#f0c040]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#f0c040]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#f0c040]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#f0c040]" />
                  </div>
                </div>
                <div className="absolute bottom-3 inset-x-0 flex justify-center">
                  <button
                    onClick={() => { setHasPhoto(true); setCaptureMode(false); }}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white/30 active:scale-95 transition-transform shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-[#eaf0e5]" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setCaptureMode(false)}
                className="w-full py-2.5 rounded-xl bg-[#eaf0e5] text-[#5a7050] text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : hasPhoto ? (
            <div className="space-y-3">
              <div className="w-full h-32 bg-[#eaf0e5] rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 size={20} className="text-[#27ae60]" />
                <span className="text-[#2d6a1f] text-sm">foto_safra_001.jpg</span>
              </div>
              <button
                onClick={() => { setHasPhoto(false); setCaptureMode(true); }}
                className="w-full py-3 rounded-xl bg-[#eaf0e5] text-[#2d6a1f] text-sm flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Tirar Outra Foto
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setCaptureMode(true)}
                className="w-full py-3.5 rounded-xl bg-[#e67e22] text-white flex items-center justify-center gap-2 text-sm active:scale-95 transition-all"
              >
                <Camera size={16} /> Abrir Câmera
              </button>
              <button
                onClick={() => setHasPhoto(true)}
                className="w-full py-3 rounded-xl bg-[#eaf0e5] text-[#5a7050] flex items-center justify-center gap-2 text-sm"
              >
                <ImageIcon size={16} /> Escolher da Galeria
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3({
  crop, quantity, unit, hasLocation, hasPhoto, saved
}: {
  crop: string | null;
  quantity: number;
  unit: string;
  hasLocation: boolean;
  hasPhoto: boolean;
  saved: boolean;
}) {
  const cropLabel = crops.find((c) => c.id === crop)?.label || crop;

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-5 gap-5">
        <div className="w-20 h-20 bg-[#e8f0e1] rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#2d6a1f]" />
        </div>
        <div className="text-center">
          <h2 className="text-[#1a2410] text-xl mb-2">Registro Salvo!</h2>
          <p className="text-[#5a7050] text-sm">Os dados foram armazenados localmente e serão sincronizados quando houver conexão.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#fff3e0] px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#e67e22]" />
          <span className="text-[#e67e22] text-sm">Aguardando Sincronização</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <div>
        <h2 className="text-[#1a2410] text-base mb-1">Revisar Registro</h2>
        <p className="text-[#5a7050] text-sm">Confirme os dados antes de salvar localmente</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#2d6a1f] px-5 py-3">
          <p className="text-[#a8d890] text-xs">Resumo da Safra</p>
        </div>
        <div className="divide-y divide-[#eaf0e5]">
          <SummaryRow label="Cultura" value={cropLabel || "—"} />
          <SummaryRow label="Quantidade" value={`${quantity} ${unit}`} />
          <SummaryRow label="Produtor" value="João Oliveira" />
          <SummaryRow label="Propriedade" value="Fazenda São José" />
          <SummaryRow label="Data" value="12/05/2026 · 09:42" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-[#1a2410] text-sm">Evidências Anexadas</p>
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`rounded-xl p-3 flex items-center gap-2 ${
              hasLocation ? "bg-[#e8f5e9]" : "bg-[#fafafa]"
            }`}
          >
            <MapPin size={16} className={hasLocation ? "text-[#27ae60]" : "text-[#bdbdbd]"} />
            <span className={`text-xs ${hasLocation ? "text-[#2d6a1f]" : "text-[#bdbdbd]"}`}>
              {hasLocation ? "GPS Capturado" : "Sem GPS"}
            </span>
          </div>
          <div
            className={`rounded-xl p-3 flex items-center gap-2 ${
              hasPhoto ? "bg-[#e8f5e9]" : "bg-[#fafafa]"
            }`}
          >
            <Camera size={16} className={hasPhoto ? "text-[#27ae60]" : "text-[#bdbdbd]"} />
            <span className={`text-xs ${hasPhoto ? "text-[#2d6a1f]" : "text-[#bdbdbd]"}`}>
              {hasPhoto ? "Foto Anexada" : "Sem Foto"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#fff3e0] rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#e67e22] flex-shrink-0" />
        <p className="text-[#8b5000] text-xs">
          Salvo offline. A validação MapBiomas ocorrerá após sincronização com a rede.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex justify-between items-center">
      <span className="text-[#5a7050] text-sm">{label}</span>
      <span className="text-[#1a2410] text-sm">{value}</span>
    </div>
  );
}
