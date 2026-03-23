import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CoffeeLoader from '../components/CoffeeLoader';
import useApi from '../hooks/useApi';

const Menu = () => {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const { data, loading, error, request } = useApi(
        `/api/products?pageNumber=${page}&keyword=${keyword}`
    );

    useEffect(() => {
        request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, keyword]);

    const products = data?.products ?? [];
    const pages = data?.pages ?? 1;

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setKeyword(searchInput.trim());
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Page Header */}
            <div className="relative py-16 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3A2A1D 50%, #5A4332 100%)' }}>
                {/* Decorative beans */}
                <div className="absolute top-8 right-[10%] text-4xl opacity-10 animate-float">☕</div>
                <div className="absolute bottom-8 left-[15%] text-2xl opacity-10 animate-float-slow">☕</div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="text-primary text-xs font-semibold tracking-widest uppercase animate-fadeInUp">Explore</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mt-2 mb-4 animate-fadeInUp delay-100" style={{ fontFamily: 'var(--font-display)' }}>
                        Our <span className="text-gradient-warm">Menu</span>
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto animate-fadeInUp delay-200">
                        Explore our selection of premium coffees, carefully sourced and roasted to perfection.
                    </p>
                </div>

                {/* Wavy bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                    <svg viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full h-8">
                        <path d="M0 20 Q300 0 600 20 Q900 40 1200 20 L1200 40 L0 40 Z" fill="#FAF6F1" />
                    </svg>
                </div>
            </div>

            <section className="py-12 px-4">
                <div className="container mx-auto">
                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="mb-12 flex justify-center gap-3 animate-fadeInUp delay-300">
                        <div className="relative w-full max-w-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/30">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search coffees..."
                                className="w-full rounded-xl border border-primary/20 bg-surface pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-warm transition-all duration-300 input-warm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all duration-300 shadow-warm btn-shimmer"
                        >
                            Search
                        </button>
                        {keyword && (
                            <button
                                type="button"
                                onClick={() => { setKeyword(''); setSearchInput(''); setPage(1); }}
                                className="rounded-xl border border-primary/20 px-5 py-3.5 text-sm text-secondary/60 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                            >
                                Clear
                            </button>
                        )}
                    </form>

                    {/* Results */}
                    {loading ? (
                        <CoffeeLoader text="Loading menu..." />
                    ) : error ? (
                        <div className="text-center py-10 animate-fadeInUp">
                            <p className="text-red-500 bg-red-50 inline-block px-6 py-3 rounded-xl">
                                Could not load products. Please try again later.
                            </p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 animate-fadeInUp">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <p className="text-secondary/50 text-lg">No products found.</p>
                            {keyword && (
                                <button
                                    onClick={() => { setKeyword(''); setSearchInput(''); }}
                                    className="mt-4 text-primary hover:text-primary-dark font-medium text-sm"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.map((product, i) => (
                                    <ProductCard key={product._id} product={product} index={i} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="mt-14 flex justify-center gap-2 animate-fadeInUp">
                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                                p === page
                                                    ? 'bg-primary text-white shadow-warm scale-110'
                                                    : 'border border-primary/20 text-secondary/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Menu;
