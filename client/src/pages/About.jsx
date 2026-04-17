import React from 'react';
import { Link } from 'react-router-dom';
import CoffeeParticles from '../components/CoffeeParticles';
import SteamEffect from '../components/SteamEffect';

const About = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background overflow-hidden relative">
            <CoffeeParticles count={15} />

            {/* Header Section */}
            <section className="relative py-24 z-10" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3A2A1D 50%, #5A4332 100%)' }}>
                <SteamEffect className="bottom-0 left-1/4" />
                <div className="container mx-auto px-4 text-center">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase animate-fadeInUp">Our Story</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6 animate-fadeInUp delay-100" style={{ fontFamily: 'var(--font-display)' }}>
                        Brewing the Future
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed animate-fadeInUp delay-200">
                        We blend the timeless art of artisan coffee roasting with cutting-edge artificial intelligence to deliver your perfect cup, every single time.
                    </p>
                </div>
                {/* Wavy bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                    <svg viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full h-8">
                        <path d="M0 20 Q300 0 600 20 Q900 40 1200 20 L1200 40 L0 40 Z" fill="#FAF6F1" />
                    </svg>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 z-10 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="animate-slideInLeft relative">
                            <div className="absolute -inset-4 rounded-3xl border-2 border-primary/20 transform rotate-3"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Artisan Roasting" 
                                className="rounded-3xl shadow-warm-lg relative z-10 w-full h-80 object-cover"
                            />
                        </div>
                        <div className="animate-slideInRight">
                            <h2 className="text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-display)' }}>The Artisan Touch</h2>
                            <p className="text-secondary/70 leading-relaxed mb-6">
                                Quality begins at the source. We partner with sustainable farms across the globe to hand-select the finest beans. Every batch is roasted in-house by our master roasters, ensuring the unique flavor profile of each origin is preserved and celebrated.
                            </p>
                            <p className="text-secondary/70 leading-relaxed">
                                Our commitment is simple: no shortcuts, no compromises. Just pure, unadulterated coffee excellence delivered straight to your door.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Section */}
            <section className="py-20 z-10 px-4 bg-primary/5 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-row-reverse">
                        <div className="md:order-last animate-slideInRight relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-full filter blur-3xl transform scale-150"></div>
                            <div className="glass p-8 rounded-3xl relative z-10 shadow-warm">
                                <div className="text-5xl mb-4 text-center">🧠 ☕</div>
                                <h3 className="text-xl font-bold text-secondary text-center mb-2">Coffee DNA Engine</h3>
                                <p className="text-sm text-secondary/60 text-center">Our proprietary AI algorithm matches your unique taste profile to the exact beans you'll love most.</p>
                            </div>
                        </div>
                        <div className="md:order-first animate-slideInLeft">
                            <h2 className="text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-display)' }}>Powered by AI</h2>
                            <p className="text-secondary/70 leading-relaxed mb-6">
                                Finding the perfect coffee shouldn't be guesswork. We've built an advanced AI Recommendation Engine that learns your preferences—your "Coffee DNA."
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Smart Personalized Recommendations',
                                    'Dynamic Pricing to ensure fair market value',
                                    'Predictive auto-refill subscriptions',
                                    'Real-time chatbot taste profiling'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-secondary/80 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 z-10">
                <div className="container mx-auto text-center max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                        Ready to rethink your morning routine?
                    </h2>
                    <p className="text-secondary/60 mb-10 text-lg">
                        Take the quiz, discover your Coffee DNA, and let us deliver the best coffee you've ever had.
                    </p>
                    <Link to="/menu" className="inline-block bg-primary text-white font-bold px-10 py-4 rounded-xl shadow-warm hover:bg-primary-dark hover:shadow-warm-lg hover:scale-105 transition-all duration-300 btn-shimmer">
                        Explore Our Menu
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
