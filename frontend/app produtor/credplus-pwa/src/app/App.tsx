import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from '@/app/components/ui/sonner';
import { seedIfEmpty } from '@/db/db';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Cadastro from '@/pages/Cadastro';
import Dashboard from '@/pages/Dashboard';
import NovaSafra from '@/pages/NovaSafra';
import SafrasList from '@/pages/SafrasList';
import SafraDetails from '@/pages/SafraDetails';
import Perfil from '@/pages/Perfil';
import Interesses from '@/pages/Interesses';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('cred_authenticated') === 'true',
  );

  // Popula o banco local com dados de demonstração na primeira abertura.
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/cadastro"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Cadastro />
            }
          />

          {/* Rotas protegidas com layout */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="safra/nova" element={<NovaSafra />} />
            <Route path="safras" element={<SafrasList />} />
            <Route path="safra/:id" element={<SafraDetails />} />
            <Route path="interesses" element={<Interesses />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-center" richColors />
    </>
  );
}
