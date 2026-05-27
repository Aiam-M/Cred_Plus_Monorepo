import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, PlusCircle, List, User } from 'lucide-react';
import { useSync } from '@/hooks/useSync';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: PlusCircle, label: 'Nova Safra', path: '/safra/nova' },
  { icon: List, label: 'Safras', path: '/safras' },
  { icon: User, label: 'Perfil', path: '/perfil' },
] as const;

export default function Layout() {
  // Ativa a sincronização automática: quando a internet voltar, envia as
  // safras pendentes do banco local para o servidor.
  useSync();

  const navigate = useNavigate();
  const location = useLocation();

  const hideNav = location.pathname === '/safra/nova';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className={hideNav ? '' : 'pb-20'}>
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
                >
                  <div
                    className={`w-10 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-green-100' : ''
                    }`}
                  >
                    <Icon
                      size={22}
                      className={isActive ? 'text-[#2D5016]' : 'text-gray-400'}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? 'text-[#2D5016]' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
