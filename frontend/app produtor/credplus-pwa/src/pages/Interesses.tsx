import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Mail, MailOpen, WifiOff, Inbox, Building2 } from 'lucide-react';
import {
  fetchInteressesRecebidos,
  marcarComoLida,
  type InteresseRecebido,
} from '@/services/interesseService';

/**
 * Formata uma data ISO no formato amigável usado no app:
 * "12 mai, 14:30" ou "Hoje, 14:30".
 */
function formatarData(iso: string): string {
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia =
    data.getDate() === hoje.getDate() &&
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear();

  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (mesmoDia) return `Hoje, ${hora}`;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${hora}`;
}

export default function Interesses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filtro opcional por safra (vem da URL: /interesses?safraId=123).
  // Quando presente, mostramos só as mensagens daquela safra; sem o param,
  // mostramos todas. Number.parseInt devolve NaN se o valor for inválido —
  // tratamos como "sem filtro" para não rejeitar URLs malformadas.
  const safraIdFiltro = useMemo(() => {
    const raw = searchParams.get('safraId');
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }, [searchParams]);

  const [interesses, setInteresses] = useState<InteresseRecebido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  // Lista efetiva exibida: filtrada se houver safraId; senão, completa.
  const interessesVisiveis = useMemo(() => {
    if (safraIdFiltro == null) return interesses;
    return interesses.filter((i) => i.safraId === safraIdFiltro);
  }, [interesses, safraIdFiltro]);

  // Nome da safra para exibir no cabeçalho quando filtrado.
  // Pegamos do primeiro item da lista filtrada; se vazia, mostramos texto neutro.
  const nomeSafraFiltro = interessesVisiveis[0]?.safraNome ?? null;

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Busca a lista no servidor e, em seguida, marca todas como lidas
  // (do ponto de vista do produtor, "abriu a tela = leu as mensagens").
  useEffect(() => {
    if (!navigator.onLine) {
      setCarregando(false);
      return;
    }

    let cancelado = false;
    setCarregando(true);
    setErro(null);

    fetchInteressesRecebidos()
      .then((lista) => {
        if (cancelado) return;
        setInteresses(lista);

        // Marca como lida apenas as mensagens efetivamente visíveis ao produtor:
        // se ele filtrou por safra (?safraId=N), só essas — para não derrubar
        // o badge global por causa de mensagens de outras safras que ele não viu.
        // Falhas individuais são engolidas no service — não impactam a UI.
        const aMarcar = lista.filter((i) => {
          if (i.lida) return false;
          if (safraIdFiltro != null) return i.safraId === safraIdFiltro;
          return true;
        });
        aMarcar.forEach((i) => marcarComoLida(i.id));
      })
      .catch((err: Error) => {
        if (!cancelado) setErro(err.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // Refazer o fetch quando o filtro de safra muda (ex.: navegação entre
    // /interesses e /interesses?safraId=N sem desmontar a página).
  }, [safraIdFiltro]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-[#2D5016] text-white px-5 pt-12 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-100 text-sm mb-3 active:opacity-70"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <h1 className="text-2xl font-bold leading-tight">
          {safraIdFiltro != null ? 'Mensagens da Safra' : 'Mensagens'}
        </h1>
        <p className="text-green-200 text-sm mt-1">
          {safraIdFiltro != null
            ? nomeSafraFiltro
              ? `Empresas interessadas em ${nomeSafraFiltro}`
              : 'Empresas interessadas nesta safra'
            : 'Empresas interessadas nas suas safras'}
        </p>
      </div>

      {/* Banner offline */}
      {!online && (
        <div className="mx-4 -mt-6 mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <WifiOff size={18} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Você está offline</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Conecte-se à internet para ver suas mensagens.
            </p>
          </div>
        </div>
      )}

      {/* Erro */}
      {online && erro && (
        <div className="mx-4 -mt-6 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-red-800">{erro}</p>
        </div>
      )}

      {/* Loading */}
      {online && carregando && (
        <div className="px-4 -mt-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-28"
            />
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {online && !carregando && !erro && interessesVisiveis.length === 0 && (
        <div className="px-4 -mt-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 flex items-center justify-center mb-3">
              <Inbox size={26} className="text-[#2D5016]" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">
              {safraIdFiltro != null
                ? 'Nenhuma mensagem para esta safra'
                : 'Nenhuma mensagem ainda'}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {safraIdFiltro != null
                ? 'Quando uma empresa demonstrar interesse nesta safra, a mensagem aparece aqui.'
                : 'Quando uma empresa demonstrar interesse em alguma das suas safras, a mensagem aparece aqui.'}
            </p>
          </div>
        </div>
      )}

      {/* Lista de interesses */}
      {online && !carregando && interessesVisiveis.length > 0 && (
        <div className="px-4 -mt-6 space-y-3">
          {interessesVisiveis.map((interesse) => (
            <InteresseCard key={interesse.id} interesse={interesse} />
          ))}
        </div>
      )}
    </div>
  );
}

function InteresseCard({ interesse }: { interesse: InteresseRecebido }) {
  const nova = !interesse.lida;
  return (
    <article
      className={`bg-white rounded-2xl border p-4 shadow-sm ${
        nova ? 'border-[#2D5016]/30 ring-1 ring-[#2D5016]/10' : 'border-gray-100'
      }`}
    >
      <header className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            nova ? 'bg-green-50 text-[#2D5016]' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {nova ? <Mail size={18} /> : <MailOpen size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-gray-400 shrink-0" />
            <h2 className="font-semibold text-gray-900 truncate">
              {interesse.nomeEmpresa}
            </h2>
            {nova && (
              <span className="ml-auto bg-[#2D5016] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0">
                Nova
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Sobre a safra <span className="font-medium text-gray-700">{interesse.safraNome}</span>
          </p>
        </div>
      </header>

      {interesse.mensagem && interesse.mensagem.trim().length > 0 ? (
        <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-wrap break-words">
          "{interesse.mensagem}"
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic mt-3">
          A empresa não enviou uma mensagem específica.
        </p>
      )}

      <footer className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">{formatarData(interesse.data)}</span>
        <span className="text-xs font-medium text-[#2D5016] bg-green-50 px-2.5 py-1 rounded-full">
          {interesse.status}
        </span>
      </footer>
    </article>
  );
}
