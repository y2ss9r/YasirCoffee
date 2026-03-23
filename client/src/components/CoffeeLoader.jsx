
const CoffeeLoader = ({ text = "Brewing..." }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            {/* Coffee Cup SVG */}
            <div className="relative">
                {/* Steam lines */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-1 h-6 rounded-full bg-primary/40 animate-steam" style={{ animationDelay: '0s' }} />
                    <div className="w-1 h-8 rounded-full bg-primary/30 animate-steam" style={{ animationDelay: '0.4s' }} />
                    <div className="w-1 h-5 rounded-full bg-primary/40 animate-steam" style={{ animationDelay: '0.8s' }} />
                </div>
                
                {/* Cup */}
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce-subtle">
                    {/* Cup body */}
                    <path d="M12 20 H44 L40 56 H16 Z" fill="#C8A27A" rx="4" />
                    {/* Coffee liquid */}
                    <path d="M14 28 H42 L39 52 H17 Z" fill="#5A4332" rx="2" />
                    {/* Coffee surface shine */}
                    <ellipse cx="28" cy="30" rx="12" ry="3" fill="#8B6E5A" opacity="0.6" />
                    {/* Handle */}
                    <path d="M44 26 C56 26 56 44 44 44" stroke="#C8A27A" strokeWidth="4" fill="none" strokeLinecap="round" />
                    {/* Saucer */}
                    <ellipse cx="28" cy="58" rx="20" ry="4" fill="#E8D5BC" />
                </svg>
            </div>
            
            <p className="text-secondary/60 font-medium text-sm tracking-wide animate-pulse">
                {text}
            </p>
        </div>
    );
};

export default CoffeeLoader;
