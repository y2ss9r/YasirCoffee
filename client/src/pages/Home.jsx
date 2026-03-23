
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Hero />

            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto">
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-3xl font-bold text-secondary mb-3">Our Favorites</h2>
                        <div className="w-20 h-1 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-secondary text-white px-4">
                <div className="container mx-auto text-center max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Stay Caffeinated</h2>
                    <p className="text-white/70 mb-8">Subscribe to our newsletter for the latest blends, brewing tips, and exclusive offers.</p>
                    <form className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
