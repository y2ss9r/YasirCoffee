
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useState } from 'react';

const ProductCard = ({ product, index = 0 }) => {
    const { addToCart } = useCart();
    const outOfStock = !product.countInStock || product.countInStock <= 0;
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        if (!outOfStock) {
            addToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
        }
    };

    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-surface shadow-warm transition-all duration-500 card-hover animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden relative">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Price tag */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full glass text-sm font-bold text-secondary shadow-warm animate-fadeInScale">
                    {formatPrice(product.price, product.currency)}
                </div>

                {outOfStock && (
                    <span className="absolute top-3 right-3 rounded-full bg-espresso/80 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                        Sold Out
                    </span>
                )}

                {/* Quick add on hover */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                    <button
                        onClick={handleAddToCart}
                        disabled={outOfStock}
                        className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white shadow-warm-lg transition-all duration-300 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer flex items-center justify-center gap-2"
                    >
                        {outOfStock ? (
                            'Out of Stock'
                        ) : added ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Added!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-1">
                    {product.category && (
                        <span className="text-[11px] font-medium uppercase tracking-widest text-primary/70">
                            {product.category}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-1 group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'var(--font-display)' }}>
                    {product.name}
                </h3>

                <p className="text-sm text-secondary/50 line-clamp-2 leading-relaxed">
                    {product.description || "A delicious coffee choice for your day."}
                </p>

                {/* Mobile add button (visible on mobile where hover doesn't work) */}
                <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className="mt-4 w-full rounded-xl bg-secondary py-2.5 text-center text-sm font-medium text-white transition-all duration-300 hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 md:hidden btn-shimmer"
                >
                    {outOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
