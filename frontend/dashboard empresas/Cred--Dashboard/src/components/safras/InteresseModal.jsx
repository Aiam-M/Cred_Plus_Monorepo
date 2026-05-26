import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function InteresseModal({ safra, onClose, onConfirm }) {
  const { empresa } = useAuth();
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleConfirm = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await api.post(`/cred/safras/${safra.id}/interesse`, { mensagem });
      onConfirm?.({ safraId: safra.id });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao registrar interesse. Tente novamente.');
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cred-gray-border">
          <h2 className="text-lg font-bold text-cred-gray-text">
            Demonstrar Interesse — Safra #{safra.id}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-cred-gray-neutral rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Safra</p>
            <p className="text-sm text-cred-gray-text font-medium">{safra.nome}</p>
            <p className="text-xs text-gray-400">
              Produtor: {safra.produtor.nome} · {safra.associacao.municipio}-{safra.associacao.estado}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Sua empresa</p>
            <p className="text-sm text-cred-gray-text">{empresa?.nome ?? empresa?.email ?? '—'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Mensagem para o produtor <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Olá! Nossa empresa está interessada em estabelecer uma parceria de longo prazo..."
              maxLength={1000}
              className="w-full px-3 py-2.5 text-sm border border-cred-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-green-medium/40 resize-none"
            />
          </div>

          {erro && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              ⚠️ {erro}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-cred-blue-info/10 rounded-lg">
            <span className="text-cred-blue-info text-base leading-none mt-0.5">ℹ️</span>
            <p className="text-xs text-gray-600 leading-relaxed">
              O produtor será notificado e a <strong>Amazon People</strong> entrará em contato para intermediar a negociação.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="flex-1 py-2.5 border border-cred-gray-border text-cred-gray-text rounded-lg font-medium hover:bg-cred-gray-neutral transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={enviando}
            className="flex-1 py-2.5 bg-cred-green-dark text-white rounded-lg font-medium hover:bg-cred-green-medium transition-colors text-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {enviando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirmar Interesse'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
