
import { useEffect } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import CoffeeLoader from '../components/CoffeeLoader';
import useApi from '../hooks/useApi';

const Home = () => {
    const { data, loading, error, request } = useApi('/api/products');

    useEffect(() => {
        request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const products = data?.products ?? [];

    return (
        <div className="flex flex-col min-h-screen">
            <Hero />

            {/* Features section */}
            <section className="py-20 px-4 bg-background relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                ),
                                title: 'Fresh Roasted',
                                desc: 'Beans roasted weekly for maximum freshness and flavor in every cup.',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                        <line x1="6" y1="1" x2="6" y2="4" />
                                        <line x1="10" y1="1" x2="10" y2="4" />
                                        <line x1="14" y1="1" x2="14" y2="4" />
                                    </svg>
                                ),
                                title: 'Artisan Brewed',
                                desc: 'Each cup is carefully prepared by skilled baristas using time-tested techniques.',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                ),
                                title: 'Fast Delivery',
                                desc: 'Get your favorite coffee delivered to your doorstep, fresh and fast.',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center p-8 rounded-2xl bg-surface shadow-warm transition-all duration-500 card-hover animate-fadeInUp"
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-secondary/60 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-20 px-4 bg-cream relative overflow-hidden">
                {/* Decorative rings */}
                <div className="absolute -right-16 top-10 w-48 h-48 rounded-full border-2 border-primary/5 pointer-events-none" />
                <div className="absolute -left-8 bottom-20 w-32 h-32 rounded-full border-2 border-primary/8 pointer-events-none" />

                <div className="container mx-auto">
                    <div className="flex flex-col items-center mb-14 animate-fadeInUp">
                        <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Hand-picked for you</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                            Our Favorites
                        </h2>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-primary/30 rounded-full" />
                            <div className="w-16 h-1 bg-primary rounded-full" />
                            <div className="w-8 h-0.5 bg-primary/30 rounded-full" />
                        </div>
                    </div>

                    {loading && <CoffeeLoader />}

                    {error && (
                        <div className="text-center py-10 animate-fadeInUp">
                            <p className="text-red-500 bg-red-50 inline-block px-6 py-3 rounded-xl">
                                Could not load products. Please try again later.
                            </p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product, i) => (
                                <ProductCard key={product._id} product={product} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="relative py-24 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3A2A1D 50%, #5A4332 100%)' }}>
                {/* Decorative elements */}
                <div className="absolute top-10 left-10 w-24 h-24 rounded-full border border-primary/10 animate-float-slow pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full border border-primary/5 pointer-events-none" style={{ animation: 'float 5s ease-in-out infinite reverse' }} />

                <div className="container mx-auto text-center max-w-2xl relative z-10">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase animate-fadeInUp">Stay Updated</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4 animate-fadeInUp delay-100" style={{ fontFamily: 'var(--font-display)' }}>
                        Stay Caffeinated
                    </h2>
                    <p className="text-white/50 mb-8 animate-fadeInUp delay-200">
                        Subscribe to our newsletter for the latest blends, brewing tips, and exclusive offers.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 animate-fadeInUp delay-300">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm transition-all duration-300 input-warm"
                        />
                        <button className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-warm hover:shadow-warm-lg hover:scale-105 btn-shimmer">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
