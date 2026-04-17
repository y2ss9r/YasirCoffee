
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { getCartCount } = useCart();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const cartCount = getCartCount();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
        { to: '/about', label: 'About' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass-warm shadow-warm transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-2xl transition-transform duration-300 group-hover:animate-wiggle">☕</span>
                    <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        <span className="text-gradient-gold">Yasir</span>
                        <span className="text-secondary"> Coffee</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 link-underline ${
                                isActive(link.to)
                                    ? 'text-primary bg-primary/10'
                                    : 'text-secondary/70 hover:text-primary hover:bg-primary/5'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <Link
                        to="/cart"
                        className={`relative p-2.5 rounded-xl transition-all duration-300 hover:bg-primary/10 group ${
                            isActive('/cart') ? 'bg-primary/10' : ''
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-warm animate-fadeInScale">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all duration-300"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-warm flex items-center justify-center text-white text-xs font-bold shadow-warm">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium text-secondary/80 mr-2">{user.name?.split(' ')[0]}</span>
                            </Link>

                            <Link
                                to="/orders"
                                className="px-3 py-2 text-sm font-medium text-secondary/70 hover:text-primary transition-colors duration-200"
                            >
                                Orders
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-secondary/70 rounded-lg border border-secondary/10 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-warm transition-all duration-300 hover:bg-primary-dark hover:shadow-warm-lg btn-shimmer">
                            Sign In
                        </Link>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300" style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
                            {mobileOpen ? (
                                <path d="M18 6 6 18 M6 6l12 12" />
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
                    mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="border-t border-primary/10 px-4 py-4 space-y-1 bg-cream/50">
                    {navLinks.map((link, i) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 animate-fadeInUp ${
                                isActive(link.to)
                                    ? 'text-primary bg-primary/10'
                                    : 'text-secondary/70 hover:text-primary hover:bg-primary/5'
                            }`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="border-t border-primary/10 pt-3 mt-3">
                        {user ? (
                            <div className="space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary/70 hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent-warm flex items-center justify-center text-white text-xs font-bold">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    Profile
                                </Link>
                                <Link
                                    to="/orders"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-sm font-medium text-secondary/70 hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    My Orders
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => { logout(); setMobileOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-dark transition-all btn-shimmer"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
