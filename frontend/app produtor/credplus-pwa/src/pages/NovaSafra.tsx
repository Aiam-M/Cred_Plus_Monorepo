import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Plus, Trash2, Camera, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { tiposCultura, unidades } from '@/data/mockData';

function getProdutorId(): string {
  const salvo = localStorage.getItem('cred_user');
  if (!salvo) return '';
  try { return (JSON.parse(salvo) as { id: string }).id ?? ''; } catch { return ''; }
}
import type { Plantacao, Safra, SafraImagem, TipoCultura, Unidade } from '@/data/mockData';
import { safraRepo } from '@/db/db';
import { sincronizar } from '@/services/syncService';
import { notificarSafrasMudaram } from '@/hooks/useSync';

const TOTAL_STEPS = 3;

export default function NovaSafra() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Etapa 1
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');

  // Etapa 2
  const [plantacoes, setPlantacoes] = useState<Plantacao[]>([]);
  const [tipoAtual, setTipoAtual] = useState<TipoCultura | ''>('');
  const [quantidadeAtual, setQuantidadeAtual] = useState('');
  const [unidadeAtual, setUnidadeAtual] = useState<Unidade>('KG');

  // Etapa 3
  const [imagens, setImagens] = useState<SafraImagem[]>([]);
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  // ── Etapa 2: Plantações ──────────────────────────────────────────────────

  const handleAdicionarPlantacao = () => {
    if (!tipoAtual || !quantidadeAtual) return;
    const novaPlantacao: Plantacao = {
      id: crypto.randomUUID(),
      tipo: tipoAtual as TipoCultura,
      quantidade: parseFloat(quantidadeAtual),
      unidade: unidadeAtual,
    };
    setPlantacoes((prev) => [...prev, novaPlantacao]);
    setTipoAtual('');
    setQuantidadeAtual('');
    setUnidadeAtual('KG');
  };

  const handleRemoverPlantacao = (id: string) => {
    setPlantacoes((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Etapa 3: Fotos ───────────────────────────────────────────────────────

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const slots = 5 - imagens.length;
    const toProcess = Array.from(files).slice(0, slots);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagens((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            uri: reader.result as string,
            ordem: prev.length + 1,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemoverImagem = (id: string) => {
    setImagens((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      return updated.map((img, idx) => ({ ...img, ordem: idx + 1 }));
    });
  };

  // ── Salvar ───────────────────────────────────────────────────────────────

  const handleSalvar = async () => {
    setSaving(true);

    const novaSafra: Safra = {
      id: crypto.randomUUID(),
      nome,
      areaHectares: parseFloat(area),
      produtorId: getProdutorId(),
      status: 'AGUARDANDO_SYNC',
      plantacoes,
      imagens,
      createdAt: new Date().toISOString(),
      syncedAt: null,
    };

    // Salva primeiro no banco local (IndexedDB). Isso funciona mesmo offline.
    await safraRepo.add(novaSafra);
    notificarSafrasMudaram();

    // Se houver internet, tenta sincronizar com o servidor logo em seguida.
    if (navigator.onLine) {
      toast.success('✅ Safra salva! Sincronizando...', { duration: 2000 });
      sincronizar().then((resultado) => {
        if (resultado.enviadas > 0) {
          notificarSafrasMudaram();
          toast.success('🛰️ Safra enviada para validação por satélite!', { duration: 3000 });
        }
      });
    } else {
      toast.info('📱 Safra salva offline. Será sincronizada quando houver conexão.', {
        duration: 4000,
      });
    }

    setSaving(false);
    navigate('/dashboard');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={goBack} className="p-2 -ml-2 rounded-xl active:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="font-semibold text-gray-900">Nova Safra</h1>
          <p className="text-xs text-gray-400">Etapa {step} de {TOTAL_STEPS}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 h-1">
        <div
          className="bg-[#2D5016] h-1 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="p-5 max-w-lg mx-auto">
        {/* ── Etapa 1 ── */}
        {step === 1 && (
          <Step1
            nome={nome}
            area={area}
            onNomeChange={setNome}
            onAreaChange={setArea}
            onNext={() => setStep(2)}
          />
        )}

        {/* ── Etapa 2 ── */}
        {step === 2 && (
          <Step2
            plantacoes={plantacoes}
            tipoAtual={tipoAtual}
            quantidadeAtual={quantidadeAtual}
            unidadeAtual={unidadeAtual}
            onTipoChange={setTipoAtual}
            onQuantidadeChange={setQuantidadeAtual}
            onUnidadeChange={setUnidadeAtual}
            onAdicionar={handleAdicionarPlantacao}
            onRemover={handleRemoverPlantacao}
            onNext={() => setStep(3)}
          />
        )}

        {/* ── Etapa 3 ── */}
        {step === 3 && (
          <Step3
            imagens={imagens}
            isOnline={navigator.onLine}
            saving={saving}
            onCapture={handleImageCapture}
            onRemover={handleRemoverImagem}
            onSalvar={handleSalvar}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes das etapas ───────────────────────────────────────────────

function Step1({
  nome,
  area,
  onNomeChange,
  onAreaChange,
  onNext,
}: {
  nome: string;
  area: string;
  onNomeChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Informações Básicas</h2>
        <p className="text-sm text-gray-500">Preencha os dados principais da sua safra</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nome da Safra *
        </label>
        <Input
          placeholder="Ex: Safra Cacau Março 2026"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          className="h-12 rounded-xl border-gray-200 bg-gray-50"
        />
        {nome.length > 0 && nome.length < 3 && (
          <p className="text-xs text-red-500 mt-1">Mínimo 3 caracteres</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Área Total (hectares) *
        </label>
        <Input
          type="number"
          step="0.1"
          min="0.1"
          placeholder="Ex: 15.2"
          value={area}
          onChange={(e) => onAreaChange(e.target.value)}
          className="h-12 rounded-xl border-gray-200 bg-gray-50"
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        ℹ️ Você poderá editar essas informações enquanto a safra não for sincronizada.
      </div>

      <Button
        onClick={onNext}
        disabled={nome.length < 3 || !area || parseFloat(area) <= 0}
        className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl"
      >
        Próximo <ArrowRight size={18} className="ml-2" />
      </Button>
    </div>
  );
}

function Step2({
  plantacoes,
  tipoAtual,
  quantidadeAtual,
  unidadeAtual,
  onTipoChange,
  onQuantidadeChange,
  onUnidadeChange,
  onAdicionar,
  onRemover,
  onNext,
}: {
  plantacoes: Plantacao[];
  tipoAtual: TipoCultura | '';
  quantidadeAtual: string;
  unidadeAtual: Unidade;
  onTipoChange: (v: TipoCultura | '') => void;
  onQuantidadeChange: (v: string) => void;
  onUnidadeChange: (v: Unidade) => void;
  onAdicionar: () => void;
  onRemover: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Plantações</h2>
        <p className="text-sm text-gray-500">Adicione os tipos de cultura e quantidades colhidas</p>
      </div>

      {/* Formulário de adição */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Cultura</label>
          <Select value={tipoAtual} onValueChange={(v) => onTipoChange(v as TipoCultura)}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              {tiposCultura.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantidade</label>
            <Input
              type="number"
              min="1"
              placeholder="Ex: 720"
              value={quantidadeAtual}
              onChange={(e) => onQuantidadeChange(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unidade</label>
            <Select value={unidadeAtual} onValueChange={(v) => onUnidadeChange(v as Unidade)}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={onAdicionar}
          disabled={!tipoAtual || !quantidadeAtual || parseFloat(quantidadeAtual) <= 0}
          variant="outline"
          className="w-full h-11 rounded-xl border-[#2D5016] text-[#2D5016] hover:bg-green-50"
        >
          <Plus size={17} className="mr-1.5" />
          Adicionar Plantação
        </Button>
      </div>

      {/* Lista de plantações adicionadas */}
      {plantacoes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Plantações Adicionadas:</p>
          <div className="space-y-2">
            {plantacoes.map((p) => {
              const tipo = tiposCultura.find((t) => t.value === p.tipo);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100"
                >
                  <span className="text-sm text-gray-800">
                    {tipo?.label ?? p.tipo}: <strong>{p.quantidade} {p.unidade}</strong>
                  </span>
                  <button
                    onClick={() => onRemover(p.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={plantacoes.length === 0}
        className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl"
      >
        Próximo <ArrowRight size={18} className="ml-2" />
      </Button>

      {plantacoes.length === 0 && (
        <p className="text-center text-xs text-gray-400">
          Adicione pelo menos uma plantação para continuar
        </p>
      )}
    </div>
  );
}

function Step3({
  imagens,
  isOnline,
  saving,
  onCapture,
  onRemover,
  onSalvar,
}: {
  imagens: SafraImagem[];
  isOnline: boolean;
  saving: boolean;
  onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemover: (id: string) => void;
  onSalvar: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Fotos da Plantação</h2>
        <p className="text-sm text-gray-500">Adicione até 5 fotos da sua safra (opcional)</p>
      </div>

      {/* Botões de captura */}
      {imagens.length < 5 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Câmera */}
          <label className="flex flex-col items-center justify-center h-28 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#2D5016] hover:bg-green-50 transition-colors active:scale-[0.98]">
            <Camera size={28} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">Tirar Foto</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onCapture}
              className="hidden"
            />
          </label>

          {/* Galeria */}
          <label className="flex flex-col items-center justify-center h-28 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#2D5016] hover:bg-green-50 transition-colors active:scale-[0.98]">
            <ImageIcon size={28} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">Da Galeria</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onCapture}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Grid de fotos */}
      {imagens.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {imagens.length}/5 foto{imagens.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {imagens.map((img) => (
              <div key={img.id} className="relative aspect-square">
                <img
                  src={img.uri}
                  alt={`Foto ${img.ordem}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={() => onRemover(img.id)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status de conexão */}
      <div
        className={`rounded-2xl p-4 text-sm border ${
          isOnline
            ? 'bg-green-50 border-green-100 text-green-800'
            : 'bg-gray-50 border-gray-100 text-gray-600'
        }`}
      >
        {isOnline ? (
          <>📶 <strong>Online</strong> — A safra será sincronizada automaticamente após salvar.</>
        ) : (
          <>
            📱 <strong>Offline</strong> — A safra será salva localmente e sincronizada quando você tiver conexão.
          </>
        )}
      </div>

      <Button
        onClick={onSalvar}
        disabled={saving}
        className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-xl"
      >
        {saving ? 'Salvando...' : '✅ Salvar Safra'}
      </Button>
    </div>
  );
}
