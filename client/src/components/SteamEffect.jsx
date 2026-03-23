
const SteamEffect = ({ className = "" }) => {
    return (
        <div className={`absolute pointer-events-none ${className}`}>
            <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M60 160 C60 140, 40 120, 50 100 C60 80, 30 60, 45 40 C55 25, 40 10, 50 0"
                    stroke="rgba(200, 162, 122, 0.15)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-steam"
                />
                <path
                    d="M75 160 C75 135, 90 115, 80 95 C70 75, 90 55, 78 35 C68 20, 82 5, 72 0"
                    stroke="rgba(200, 162, 122, 0.1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-steam-alt"
                />
                <path
                    d="M45 160 C45 138, 25 118, 38 98 C48 78, 28 60, 40 42 C50 28, 35 12, 42 0"
                    stroke="rgba(200, 162, 122, 0.12)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-steam"
                    style={{ animationDelay: '1s' }}
                />
            </svg>
        </div>
    );
};

export default SteamEffect;
