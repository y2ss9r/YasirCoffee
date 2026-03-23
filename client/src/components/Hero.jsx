
import { Link } from 'react-router-dom';
import SteamEffect from './SteamEffect';
import CoffeeParticles from './CoffeeParticles';

const Hero = () => {
    return (
        <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3A2A1D 30%, #5A4332 70%, #3A2A1D 100%)' }}>
            {/* Animated particles */}
            <CoffeeParticles count={12} />

            {/* Steam effects */}
            <SteamEffect className="bottom-0 left-[15%]" />
            <SteamEffect className="bottom-0 right-[20%]" />

            {/* Large decorative coffee ring */}
            <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full border-[3px] border-primary/10 animate-float-slow pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full border-[2px] border-primary/5 pointer-events-none" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-espresso/50 pointer-events-none" />

            <div className="container mx-auto px-4 text-center relative z-10">
                {/* Coffee bean icon */}
                <div className="mb-6 animate-fadeInDown">
                    <span className="inline-block text-5xl animate-float">☕</span>
                </div>

                {/* Sub-badge */}
                <div className="animate-fadeInUp delay-100">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-primary-light text-xs font-medium tracking-widest uppercase backdrop-blur-sm mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Premium Artisanal Coffee
                    </span>
                </div>

                <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl animate-fadeInUp delay-200" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="text-white">Experience the</span>
                    <br />
                    <span className="text-gradient-warm">Perfect Brew</span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed animate-fadeInUp delay-300">
                    From hand-picked beans to your cup — crafted with passion, roasted to perfection,
                    and delivered with love.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fadeInUp delay-400">
                    <Link
                        to="/menu"
                        className="relative inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-base font-semibold text-white shadow-warm-lg transition-all duration-300 hover:bg-primary-dark hover:scale-105 hover:shadow-warm-lg btn-shimmer group"
                    >
                        <span className="mr-2 transition-transform duration-300 group-hover:translate-x-[-2px]">Order Now</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-10 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105"
                    >
                        Learn More
                    </Link>
                </div>

                {/* Stats badges */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 animate-fadeInUp delay-600">
                    {[
                        { num: '50+', label: 'Coffee Blends' },
                        { num: '10K+', label: 'Happy Customers' },
                        { num: '4.9', label: 'Average Rating' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-primary">{stat.num}</div>
                            <div className="text-xs md:text-sm text-white/40 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-hint">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(200,162,122,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
            </div>

            {/* Wavy bottom edge */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full h-10">
                    <path d="M0 20 Q300 0 600 20 Q900 40 1200 20 L1200 40 L0 40 Z" fill="#FAF6F1" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
