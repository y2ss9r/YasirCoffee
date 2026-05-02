const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 animate-fadeInUp text-center">
            {/* Coffee cup illustration */}
            <div className="relative">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
                    {/* Cup */}
                    <path d="M25 45 H75 L70 100 H30 Z" fill="#E8D5BC" />
                    <path d="M30 55 H70 L66 92 H34 Z" fill="#FAF6F1" />
                    {/* Handle */}
                    <path d="M75 55 C95 55 95 80 75 80" stroke="#E8D5BC" strokeWidth="6" fill="none" strokeLinecap="round" />
                    {/* Saucer */}
                    <ellipse cx="52" cy="104" rx="35" ry="6" fill="#E8D5BC" opacity="0.5" />
                    {/* 404 text */}
                    <text x="34" y="82" fontSize="22" fill="#C8A27A" fontWeight="bold">404</text>
                </svg>
                {/* Steam */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-1 h-5 rounded-full bg-primary/20 animate-steam" />
                    <div className="w-1 h-7 rounded-full bg-primary/15 animate-steam" style={{ animationDelay: '0.5s' }} />
                    <div className="w-1 h-4 rounded-full bg-primary/20 animate-steam" style={{ animationDelay: '1s' }} />
                </div>
            </div>

            <div>
                <h1 className="text-5xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Page Not Found
                </h1>
                <p className="text-secondary/50 max-w-sm mx-auto">
                    Looks like this page went cold. Let's get you back to something warm.
                </p>
            </div>

            <a
                href="/"
                className="mt-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-warm hover:bg-primary-dark hover:shadow-warm-lg hover:scale-105 transition-all duration-300 btn-shimmer"
            >
                Back to Home
            </a>
        </div>
    );
};

export default NotFound;
