import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simula delay de rede para parecer real
        setTimeout(() => {
            const result = login(email, password);
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                setError(result.error);
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-cred-cream flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-cred-beige p-8">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-cred-green-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                        <span className="text-white font-bold text-2xl">c+</span>
                    </div>
                    <h1 className="text-2xl font-bold text-cred-green-dark">cred+</h1>
                    <p className="text-sm text-gray-500 mt-1">Acesso Empresarial</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">E-mail corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                                placeholder="empresa@cred.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Senha de acesso</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cred-orange/50 focus:border-cred-orange transition-all"
                                placeholder="••••••••"
                                required
                                minLength={4}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cred-green-dark text-white py-3 rounded-lg font-semibold hover:bg-cred-green-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Entrar no Dashboard'
                        )}
                    </button>
                </form>

                <div className="mt-5 space-y-2 text-center text-sm">
                    <a href="#" className="block text-cred-green-medium hover:underline">
                        Esqueci minha senha
                    </a>
                    <p className="text-gray-400">
                        Sem conta?{' '}
                        <a href="#" className="text-cred-green-dark font-medium hover:underline">
                            Cadastrar minha empresa
                        </a>
                    </p>
                </div>

                <div className="mt-4 text-center text-xs text-gray-400">
                    Protótipo: use qualquer e-mail e senha (mín. 4 caracteres)
                </div>
            </div>
        </div>
    );
}