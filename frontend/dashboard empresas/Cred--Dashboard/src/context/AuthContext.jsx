import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica se já existe um "token" salvo
        const token = localStorage.getItem('cred_token');
        if (token) setIsAuthenticated(true);
        setLoading(false);
    }, []);

    // Simulação de autenticação (protótipo)
    const login = (email, password) => {
        if (email && password.length >= 4) {
            localStorage.setItem('cred_token', 'mock-token-123');
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, error: 'E-mail ou senha inválidos.' };
    };

    const logout = () => {
        localStorage.removeItem('cred_token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return context;
};