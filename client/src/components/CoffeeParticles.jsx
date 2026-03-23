
const CoffeeParticles = ({ count = 8 }) => {
    const beans = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 16 + Math.random() * 16,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        rotation: Math.random() * 360,
        opacity: 0.06 + Math.random() * 0.08,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {beans.map((bean) => (
                <div
                    key={bean.id}
                    className="absolute"
                    style={{
                        left: bean.left,
                        top: bean.top,
                        opacity: bean.opacity,
                        animation: `float-slow ${bean.duration}s ease-in-out infinite`,
                        animationDelay: `${bean.delay}s`,
                    }}
                >
                    <svg
                        width={bean.size}
                        height={bean.size}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-primary"
                        style={{ transform: `rotate(${bean.rotation}deg)` }}
                    >
                        <ellipse cx="12" cy="12" rx="6" ry="10" />
                        <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default CoffeeParticles;
