
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        // Optional: Add simple alert or toast here if needed
        // alert(`${product.name} added to cart!`);
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-secondary/10 bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-secondary/5">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} // Fallback image
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-secondary">{product.name}</h3>
                    <span className="text-sm font-bold text-primary">${product.price.toFixed(2)}</span>
                </div>

                <p className="mb-4 text-sm text-secondary/70 line-clamp-2">
                    {product.description || "A delicious coffee choice for your day."}
                </p>

                <button
                    onClick={handleAddToCart}
                    className="w-full rounded-lg bg-secondary py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
