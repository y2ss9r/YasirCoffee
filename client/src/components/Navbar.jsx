
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { getCartCount } = useCart();
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-primary tracking-tighter">
                    Yasir Coffee
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/menu" className="text-sm font-medium hover:text-primary transition-colors">
                        Menu
                    </Link>
                    {user?.isAdmin && (
                        <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                            Admin
                        </Link>
                    )}
                    <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/cart" className="relative p-2 hover:bg-primary/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                            {getCartCount()}
                        </span>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Hi, {user.name}</span>
                            <Link
                                to="/profile"
                                className="hidden md:inline-flex items-center justify-center rounded-md border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-secondary/5"
                            >
                                Profile
                            </Link>
                            {user.isAdmin && (
                                <Link
                                    to="/admin"
                                    className="hidden md:inline-flex items-center justify-center rounded-md border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-secondary/5"
                                >
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={logout}
                                className="hidden md:inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
