import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);
    };

    const allSameCurrency = cartItems.length > 0 && cartItems.every(i => i.currency === cartItems[0].currency);
    const totalCurrency = allSameCurrency ? cartItems[0].currency : 'USD';

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 animate-fadeInUp">
                {/* Empty cart illustration */}
                <div className="relative">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
                        {/* Cup */}
                        <path d="M25 45 H75 L70 100 H30 Z" fill="#E8D5BC" rx="4" />
                        <path d="M30 55 H70 L66 92 H34 Z" fill="#FAF6F1" />
                        {/* Handle */}
                        <path d="M75 55 C95 55 95 80 75 80" stroke="#E8D5BC" strokeWidth="6" fill="none" strokeLinecap="round" />
                        {/* Saucer */}
                        <ellipse cx="52" cy="104" rx="35" ry="6" fill="#E8D5BC" opacity="0.5" />
                        {/* Question mark */}
                        <text x="46" y="80" fontSize="28" fill="#C8A27A" fontWeight="bold" fontFamily="var(--font-display)">?</text>
                    </svg>
                    {/* Steam */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
                        <div className="w-1 h-5 rounded-full bg-primary/20 animate-steam" />
                        <div className="w-1 h-7 rounded-full bg-primary/15 animate-steam" style={{ animationDelay: '0.5s' }} />
                        <div className="w-1 h-4 rounded-full bg-primary/20 animate-steam" style={{ animationDelay: '1s' }} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>Your cart is empty</h2>
                <p className="text-secondary/50 text-center max-w-sm">Looks like you haven't added any coffee yet. Browse our menu to find your perfect brew!</p>
                <Link
                    to="/menu"
                    className="mt-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-warm hover:bg-primary-dark hover:shadow-warm-lg hover:scale-105 transition-all duration-300 btn-shimmer"
                >
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-10 animate-fadeInUp">
                <span className="text-primary text-xs font-semibold tracking-widest uppercase">Your Order</span>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mt-1" style={{ fontFamily: 'var(--font-display)' }}>Shopping Cart</h1>
                <p className="text-secondary/50 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item, i) => (
                        <div
                            key={item._id}
                            className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-surface rounded-2xl shadow-warm transition-all duration-400 hover:shadow-warm-lg animate-fadeInUp"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>{item.name}</h3>
                                <p className="text-secondary/40 text-sm">{item.brand}</p>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="font-semibold text-secondary text-lg">
                                    {formatPrice(item.price, item.currency)}
                                    <span className="text-secondary/40 text-sm font-normal"> × {item.qty}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors duration-200 flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={clearCart}
                            className="text-sm text-secondary/40 hover:text-red-500 font-medium transition-all duration-200 flex items-center gap-1"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-warm p-7 rounded-2xl shadow-warm-lg sticky top-24 animate-slideInRight">
                        <h2 className="text-xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-secondary/60 text-sm">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span className="font-medium">{formatPrice(calculateTotal(), totalCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-secondary/60 text-sm">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-primary/10 pt-4 flex justify-between font-bold text-xl text-secondary">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(calculateTotal(), totalCurrency)}</span>
                            </div>
                        </div>

                        <Link
                            to="/checkout"
                            className="block text-center w-full rounded-xl bg-primary px-4 py-4 text-base font-bold text-white shadow-warm hover:bg-primary-dark hover:shadow-warm-lg transition-all duration-300 hover:scale-[1.02] btn-shimmer"
                        >
                            Proceed to Checkout
                        </Link>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Secure checkout
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
