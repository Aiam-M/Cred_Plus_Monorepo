import { useNavigate } from 'react-router-dom';
import { mockInteresses } from '../data/mockData';

const STATUS_STYLE = {
  'Aguardando Contato': 'bg-yellow-100 text-yellow-800',
  'Em Negociação': 'bg-blue-100 text-blue-800',
  'Concluído': 'bg-green-100 text-green-800',
};

export default function MeusInteresses() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cred-gray-text">Meus Interesses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe os interesses demonstrados em safras
        </p>
      </div>

      {mockInteresses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cred-gray-border">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">Você ainda não demonstrou interesse em nenhuma safra.</p>
          <button
            type="button"
            onClick={() => navigate('/safras')}
            className="mt-4 px-6 py-2 bg-cred-green-dark text-white rounded-lg text-sm font-medium hover:bg-cred-green-medium transition-colors"
          >
            Ver Catálogo de Safras
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden sm:block bg-white rounded-2xl border border-cred-gray-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cred-gray-border bg-cred-gray-neutral">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Safra</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Produtor</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 hidden md:table-cell">Associação</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Data</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cred-gray-border">
                {mockInteresses.map((item) => (
                  <tr key={item.id} className="hover:bg-cred-gray-neutral/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-cred-gray-text">#{item.safraId}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">{item.safraNome}</p>
                    </td>
                    <td className="px-5 py-4 text-cred-gray-text">{item.produtor}</td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell text-xs">{item.associacao}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/safras/${item.safraId}`)}
                        className="text-xs font-medium text-cred-green-dark hover:underline"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden space-y-3">
            {mockInteresses.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-cred-gray-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-cred-gray-text text-sm">#{item.safraId} — {item.safraNome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.produtor}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/safras/${item.safraId}`)}
                    className="text-xs font-medium text-cred-green-dark hover:underline"
                  >
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
