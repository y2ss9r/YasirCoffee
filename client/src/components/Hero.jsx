
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-background py-20 md:py-32">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -ml-[40rem] w-[80rem] h-[80rem] rounded-full bg-primary/5 blur-3xl -z-10" />

            <div className="container mx-auto px-4 text-center">
                <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-secondary md:text-6xl">
                    Experience the Perfect <br className="hidden md:block" />
                    <span className="text-primary">Cup of Coffee</span>
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-secondary/80 md:text-xl">
                    Artisanal blends, roasted to perfection. Start your day with the energy and flavor you deserve.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        to="/menu"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                        Order Now
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex h-12 items-center justify-center rounded-md border border-secondary/20 bg-background px-8 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-secondary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
