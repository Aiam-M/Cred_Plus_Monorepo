import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import SafrasList from '../pages/SafrasList';
import SafraDetails from '../pages/SafraDetails';
import MeusInteresses from '../pages/MeusInteresses';
import Perfil from '../pages/Perfil';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Rotas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />

                    {/* Rotas protegidas */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/safras" element={<SafrasList />} />
                                        <Route path="/safras/:id" element={<SafraDetails />} />
                                        <Route path="/meus-interesses" element={<MeusInteresses />} />
                                        <Route path="/perfil" element={<Perfil />} />
                                    </Routes>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
