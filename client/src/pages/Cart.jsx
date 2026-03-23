import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-secondary">Your cart is empty</h2>
                <p className="text-gray-500">Looks like you haven't added any coffee yet.</p>
                <Link
                    to="/menu"
                    className="mt-4 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-secondary mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="w-24 h-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-semibold text-secondary">{item.name}</h3>
                                <p className="text-gray-500 text-sm">{item.brand}</p>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="font-medium text-secondary">
                                    ${item.price.toFixed(2)} x {item.qty}
                                </span>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={clearCart}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-secondary">
                                <span>Total</span>
                                <span>${calculateTotal()}</span>
                            </div>
                        </div>

                        <button
                            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-white shadow hover:bg-primary/90 transition-colors"
                            onClick={() => alert('Proceeding to Checkout...')}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
