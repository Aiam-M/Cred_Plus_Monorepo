import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/safras', label: 'Safras' },
  { path: '/meus-interesses', label: 'Meus Interesses' },
];

function isActive(linkPath, currentPath) {
  if (linkPath === '/') return currentPath === '/';
  return currentPath === linkPath || currentPath.startsWith(linkPath + '/');
}

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);
  const perfilRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fecha mobile menu ao navegar
  useEffect(() => {
    setMobileMenuAberto(false);
  }, [location.pathname]);

  return (
    <header className="bg-white border-b border-cred-gray-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-cred-green-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C+</span>
            </div>
            <span className="text-xl font-bold text-cred-green-dark hidden sm:block">Cred+</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path, location.pathname)
                    ? 'bg-cred-green-dark text-white'
                    : 'text-cred-gray-text hover:bg-cred-gray-neutral'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Bell */}
            <button
              type="button"
              className="relative p-2 hover:bg-cred-gray-neutral rounded-lg transition-colors"
              title="Notificações"
            >
              <Bell className="w-5 h-5 text-cred-gray-text" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-cred-red-error text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                2
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={perfilRef}>
              <button
                type="button"
                onClick={() => setPerfilAberto((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-cred-gray-neutral rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-cred-green-medium rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-cred-gray-text">
                  Empresa
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    perfilAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {perfilAberto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-cred-gray-border rounded-xl shadow-lg py-1 z-50">
                  <Link
                    to="/perfil"
                    onClick={() => setPerfilAberto(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-cred-gray-text hover:bg-cred-gray-neutral"
                  >
                    <User className="w-4 h-4" />
                    Ver Perfil
                  </Link>
                  <hr className="my-1 border-cred-gray-border" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-cred-red-error hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuAberto((v) => !v)}
              className="md:hidden p-2 hover:bg-cred-gray-neutral rounded-lg transition-colors"
              aria-label={mobileMenuAberto ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuAberto
                ? <X className="w-5 h-5 text-cred-gray-text" />
                : <Menu className="w-5 h-5 text-cred-gray-text" />
              }
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuAberto && (
          <nav className="md:hidden border-t border-cred-gray-border py-3 space-y-1 pb-4">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path, location.pathname)
                    ? 'bg-cred-green-dark text-white'
                    : 'text-cred-gray-text hover:bg-cred-gray-neutral'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
