import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders/myorders', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 min-h-[60vh]">
                <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl inline-block">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    My Orders
                </h1>
                <p className="text-secondary/60 mb-8">View your coffee purchase history.</p>

                {orders.length === 0 ? (
                    <div className="text-center p-10 glass rounded-2xl">
                        <span className="text-4xl">☕</span>
                        <h2 className="mt-4 text-xl font-bold text-secondary">No orders yet</h2>
                        <p className="text-secondary/60 mt-2">You haven't placed any coffee orders.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="glass p-6 rounded-2xl overflow-hidden hover:shadow-warm transition-shadow">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-primary/10">
                                    <div>
                                        <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">Order #{order._id.substring(order._id.length - 6)}</p>
                                        <p className="text-sm text-secondary/60">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-secondary">
                                            {formatPrice(order.totalPrice, order.orderItems[0]?.currency || 'TRY')}
                                        </p>
                                        <p className="text-xs flex gap-2 justify-end mt-1">
                                            {order.isPaid ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Paid</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">Unpaid</span>
                                            )}
                                            {order.isDelivered ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Delivered</span>
                                            ) : (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">Processing</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 text-sm">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded shadow-sm object-cover" />
                                            <div className="flex-1">
                                                <span className="font-medium text-secondary">{item.name}</span>
                                                <span className="text-secondary/50 ml-2">x {item.qty}</span>
                                            </div>
                                            <span className="text-secondary/70">
                                                {formatPrice(item.price, item.currency || 'TRY')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
