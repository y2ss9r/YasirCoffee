import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems.length, navigate]);

    if (cartItems.length === 0) return null;

    const allSameCurrency = cartItems.length > 0 && cartItems.every(i => i.currency === cartItems[0].currency);
    const currency = allSameCurrency ? cartItems[0].currency : 'TRY';

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = 0.15 * itemsPrice;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create the order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    orderItems: cartItems.map(item => ({
                        ...item,
                        currency: item.currency || 'TRY', // Ensure currency is sent
                    })),
                    shippingAddress,
                    paymentMethod: 'Credit Card',
                    itemsPrice,
                    shippingPrice,
                    taxPrice,
                    totalPrice
                })
            });

            const orderData = await orderRes.json();
            
            if (!orderRes.ok) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            // 2. Simulate Payment (Mark as paid)
            const payRes = await fetch(`/api/orders/${orderData._id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    id: `sim_${Date.now()}`,
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: user.email
                })
            });

            if (!payRes.ok) {
                const payData = await payRes.json();
                throw new Error(payData.message || 'Payment simulation failed');
            }

            // Successfully paid
            clearCart();
            navigate('/orders');
            
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-secondary mb-8" style={{ fontFamily: 'var(--font-display)' }}>
                    Secure Checkout
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-7">
                        <form id="checkout-form" onSubmit={placeOrder} className="glass p-6 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-bold text-secondary mb-4 border-b border-secondary/10 pb-2">
                                Shipping Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary/70 mb-1">Street Address</label>
                                    <input required type="text" name="address" value={shippingAddress.address} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-white/50 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="123 Coffee Street" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary/70 mb-1">City</label>
                                        <input required type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-white/50 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Seattle" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary/70 mb-1">Postal Code</label>
                                        <input required type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-white/50 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="98101" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary/70 mb-1">Country</label>
                                    <input required type="text" name="country" value={shippingAddress.country} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-white/50 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="United States" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-secondary mt-8 mb-4 border-b border-secondary/10 pb-2">
                                Payment Method
                            </h2>
                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                                <span className="font-semibold text-secondary">Credit Card (Simulated)</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            </div>
                            <p className="mt-2 text-xs text-secondary/50">
                                Note: This is an AI-simulated checkout. No real money will be charged.
                            </p>
                        </form>
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-5">
                        <div className="glass-warm p-6 rounded-2xl sticky top-24">
                            <h2 className="text-xl font-bold text-secondary mb-4 border-b border-secondary/10 pb-2">
                                Order Summary
                            </h2>
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 text-sm">
                                            <p className="font-bold text-secondary line-clamp-1">{item.name}</p>
                                            <p className="text-secondary/50">Qty: {item.qty}</p>
                                        </div>
                                        <div className="font-semibold text-secondary text-sm">
                                            {formatPrice(item.price * item.qty, item.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 border-t border-secondary/10 pt-4 text-sm mb-6">
                                <div className="flex justify-between text-secondary/70">
                                    <span>Items</span>
                                    <span>{formatPrice(itemsPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between text-secondary/70">
                                    <span>Shipping</span>
                                    <span>{shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between text-secondary/70">
                                    <span>Estimated Tax</span>
                                    <span>{formatPrice(taxPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-secondary pt-2 border-t border-secondary/10 mt-2">
                                    <span>Order Total</span>
                                    <span className="text-primary">{formatPrice(totalPrice, currency)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 btn-shimmer flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Processing...
                                    </>
                                ) : (
                                    `Pay ${formatPrice(totalPrice, currency)}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
