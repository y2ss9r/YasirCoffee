import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoffeeParticles from '../components/CoffeeParticles';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center p-6 overflow-hidden">
            {/* Background with particles */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-cream to-primary-light/20" />
            <CoffeeParticles count={6} />

            <div className="relative w-full max-w-md animate-fadeInUp">
                {/* Card */}
                <div className="glass-warm rounded-3xl p-8 md:p-10 shadow-warm-lg">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce-subtle">
                            <span className="text-3xl">☕</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-secondary/50">Sign in to your coffee account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-fadeInScale flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submitHandler}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary/70 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border border-primary/20 bg-surface py-3 px-4 text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all duration-300 input-warm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary/70 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-xl border border-primary/20 bg-surface py-3 px-4 text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all duration-300 input-warm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-warm hover:bg-primary-dark hover:shadow-warm-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 btn-shimmer"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-secondary/50">
                        Not a member?{' '}
                        <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors link-underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
