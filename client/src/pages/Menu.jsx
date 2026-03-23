import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col items-center mb-12">
                        <h1 className="text-4xl font-bold text-secondary mb-3">Our Menu</h1>
                        <p className="text-secondary/70 text-center max-w-2xl">
                            Explore our selection of premium coffees, carefully sourced and roasted to perfection.
                        </p>
                        <div className="w-20 h-1 bg-primary rounded-full mt-6"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Menu;
