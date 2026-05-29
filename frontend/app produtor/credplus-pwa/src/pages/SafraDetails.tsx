import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Leaf, RefreshCw, Mail, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { tiposCultura } from '@/data/mockData';
import type { Safra } from '@/data/mockData';
import { safraRepo } from '@/db/db';
import { sincronizar } from '@/services/syncService';
import { fetchInteressesRecebidos } from '@/services/interesseService';
import { notificarSafrasMudaram } from '@/hooks/useSync';
import StatusBadge from '@/components/common/StatusBadge';

export default function SafraDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [safra, setSafra] = useState<Safra | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  // Mensagens recebidas para ESTA safra. null = ainda não buscamos (ou offline);
  // 0 ou mais = busca concluída. Usamos para mostrar a contagem no botão.
  const [mensagensSafra, setMensagensSafra] = useState<number | null>(null);
  // Quantas dessas mensagens ainda não foram lidas (para destacar o card).
  const [naoLidasSafra, setNaoLidasSafra] = useState(0);

  useEffect(() => {
    if (id) {
      safraRepo.getById(id).then((found) => setSafra(found ?? null));
    }
  }, [id]);

  // Busca a contagem de mensagens desta safra quando ela já está sincronizada.
  // Sem servidorId não há como ter mensagens (a safra nem existe no backend).
  // Falhas são silenciosas: o botão simplesmente não aparece.
  useEffect(() => {
    if (!safra?.servidorId || !navigator.onLine) return;

    let cancelado = false;
    fetchInteressesRecebidos()
      .then((lista) => {
        if (cancelado) return;
        const desta = lista.filter((i) => i.safraId === safra.servidorId);
        setMensagensSafra(desta.length);
        setNaoLidasSafra(desta.filter((i) => !i.lida).length);
      })
      .catch(() => {
        // Silencioso: não mostramos o botão se a busca falhar.
      });

    return () => {
      cancelado = true;
    };
  }, [safra?.servidorId]);

  if (!safra) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-5xl">🌿</div>
        <p className="text-gray-500 font-medium">Safra não encontrada</p>
        <button onClick={() => navigate('/safras')} className="text-[#2D5016] font-medium text-sm">
          Voltar para Safras
        </button>
      </div>
    );
  }

  const dataCreated = format(new Date(safra.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const dataSynced = safra.syncedAt
    ? format(new Date(safra.syncedAt), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const canSync = safra.status === 'AGUARDANDO_SYNC' && navigator.onLine;
  const canEdit = safra.status === 'AGUARDANDO_SYNC';

  const handleSync = async () => {
    if (!canSync) return;
    setSyncing(true);
    const resultado = await sincronizar();
    if (resultado.enviadas > 0) {
      notificarSafrasMudaram();
      const updated = await safraRepo.getById(safra.id);
      setSafra(updated ?? null);
      toast.success('🛰️ Safra sincronizada com sucesso!');
    } else if (resultado.erro) {
      toast.error(resultado.erro);
    }
    setSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl active:bg-gray-100"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{safra.nome}</h1>
          <p className="text-xs text-gray-400">{safra.areaHectares} hectares</p>
        </div>
        <StatusBadge status={safra.status} size="sm" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Galeria de Fotos */}
        {safra.imagens.length > 0 ? (
          <div>
            {/* Foto principal */}
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImg(safra.imagens[0].uri)}
            >
              <img
                src={safra.imagens[0].uri}
                alt="Foto principal"
                className="w-full h-52 object-cover"
              />
            </div>
            {/* Miniaturas */}
            {safra.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {safra.imagens.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImg(img.uri)}
                  >
                    <img src={img.uri} alt={`Foto ${img.ordem}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-40 bg-green-50 rounded-2xl flex items-center justify-center">
            <Leaf size={48} className="text-green-200" />
          </div>
        )}

        {/* Informações */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
          <Section title="Plantações">
            {safra.plantacoes.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma plantação cadastrada</p>
            ) : (
              <div className="space-y-2">
                {safra.plantacoes.map((p) => {
                  const tipo = tiposCultura.find((t) => t.value === p.tipo);
                  return (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{tipo?.label ?? p.tipo}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {p.quantidade} {p.unidade}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <div className="border-t border-gray-50" />

          <Section title="Datas">
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>📅 Cadastrada em</span>
                <span className="font-medium text-gray-900">{dataCreated}</span>
              </div>
              {dataSynced && (
                <div className="flex justify-between">
                  <span>🔄 Sincronizada em</span>
                  <span className="font-medium text-gray-900">{dataSynced}</span>
                </div>
              )}
            </div>
          </Section>

          {safra.status === 'REPROVADA' && (
            <>
              <div className="border-t border-gray-50" />
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm font-medium text-red-700">Safra Reprovada</p>
                <p className="text-xs text-red-500 mt-1">
                  Entre em contato com a Amazon People para mais informações.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Mensagens desta safra (só aparece se a safra já foi sincronizada
            e o backend confirmou que há pelo menos uma mensagem). */}
        {safra.servidorId != null && mensagensSafra != null && mensagensSafra > 0 && (
          <button
            onClick={() => navigate(`/interesses?safraId=${safra.servidorId}`)}
            className={`w-full bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform ${
              naoLidasSafra > 0 ? 'border-[#2D5016]/30 ring-1 ring-[#2D5016]/10' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#2D5016]" />
                {naoLidasSafra > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                    {naoLidasSafra > 9 ? '9+' : naoLidasSafra}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {mensagensSafra === 1
                    ? '1 mensagem recebida'
                    : `${mensagensSafra} mensagens recebidas`}
                </p>
                <p className="text-xs text-gray-500">
                  {naoLidasSafra > 0
                    ? `${naoLidasSafra} ${naoLidasSafra === 1 ? 'nova' : 'novas'} de empresas interessadas`
                    : 'De empresas interessadas nesta safra'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        )}

        {/* Ações */}
        <div className="space-y-3">
          {canSync && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full h-12 bg-[#2D5016] hover:bg-[#4A7C2F] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => toast.info('Funcionalidade de edição em desenvolvimento')}
              className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              ✏️ Editar Safra
            </button>
          )}
        </div>
      </div>

      {/* Lightbox de foto */}
      {selectedImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            alt="Foto ampliada"
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
          <button
            className="absolute top-6 right-6 bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setSelectedImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}
