import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatPrice } from '../utils/formatPrice';

// ── Tab configs ─────────────────────────────────────────────────────
const TABS = [
    { id: 'overview',     label: 'AI Overview',      icon: '🧠' },
    { id: 'products',     label: 'Products',         icon: '☕' },
    { id: 'analytics',    label: 'Analytics',        icon: '📊' },
    { id: 'stagnation',   label: 'Stagnation',       icon: '📉' },
    { id: 'pricing',      label: 'Smart Pricing',    icon: '💰' },
    { id: 'offers',       label: 'Offers Engine',    icon: '🎁' },
    { id: 'subscriptions',label: 'Subscriptions',    icon: '🔄' },
    { id: 'quiz',         label: 'Quiz Config',      icon: '🧪' },
    { id: 'chatbot',      label: 'Chatbot',          icon: '🤖' },
    { id: 'taste',        label: 'Taste Profiles',   icon: '🧬' },
];

// ── Product form empty state ────────────────────────────────────────
const emptyForm = {
    name: '', price: '', image: '', brand: '', category: '',
    countInStock: '', description: '', unitCost: '', currency: 'USD', slug: '',
};

// ── Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = 'primary', trend }) => (
    <div className="glass rounded-2xl p-5 card-hover group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-secondary/50 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-2xl font-bold text-secondary">{value}</p>
                {sub && <p className="text-xs text-secondary/50 mt-1">{sub}</p>}
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                color === 'green' ? 'bg-green-100' :
                color === 'red' ? 'bg-red-100' :
                color === 'amber' ? 'bg-amber-100' :
                color === 'blue' ? 'bg-blue-100' :
                'bg-primary/10'
            } group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
        {trend && (
            <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-secondary/50'
            }`}>
                <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
                <span>{Math.abs(trend)}% vs last week</span>
            </div>
        )}
    </div>
);

// ── Status Badge ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        critical:  'bg-red-100 text-red-700',
        declining: 'bg-orange-100 text-orange-700',
        watch:     'bg-amber-100 text-amber-700',
        healthy:   'bg-green-100 text-green-700',
        trending:  'bg-blue-100 text-blue-700',
        active:    'bg-green-100 text-green-700',
        paused:    'bg-amber-100 text-amber-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// ── Progress Bar ────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = '#C8A27A', label }) => (
    <div className="w-full">
        {label && <div className="flex justify-between mb-1"><span className="text-xs text-secondary/60">{label}</span><span className="text-xs font-semibold text-secondary">{value}%</span></div>}
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
        </div>
    </div>
);

// ── Mini Bar Chart (CSS) ────────────────────────────────────────────
const MiniBarChart = ({ data, label }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="glass rounded-2xl p-5">
            {label && <h4 className="text-sm font-semibold text-secondary mb-4">{label}</h4>}
            <div className="flex items-end gap-1.5 h-32">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                            style={{
                                height: `${(d.value / max) * 100}%`,
                                background: `linear-gradient(to top, #C8A27A, #D4956A)`,
                                animationDelay: `${i * 100}ms`,
                                minHeight: '4px',
                            }}
                            title={`${d.label}: ${d.value}`}
                        />
                        <span className="text-[9px] text-secondary/40 truncate w-full text-center">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Radar Chart (SVG) ───────────────────────────────────────────────
const RadarChart = ({ profile, size = 180, label }) => {
    if (!profile) return null;
    const dims = ['bitterness', 'acidity', 'roastLevel', 'body', 'sweetness'];
    const labels = ['Bitter', 'Acidic', 'Roast', 'Body', 'Sweet'];
    const cx = size / 2, cy = size / 2, r = size * 0.38;

    const angleStep = (2 * Math.PI) / dims.length;
    const points = dims.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const val = (profile[d] || 0) / 10;
        return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
    });
    const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="flex flex-col items-center">
            {label && <h4 className="text-sm font-semibold text-secondary mb-2">{label}</h4>}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Grid rings */}
                {[0.25, 0.5, 0.75, 1].map(s => (
                    <polygon key={s} points={dims.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return `${cx + r * s * Math.cos(angle)},${cy + r * s * Math.sin(angle)}`;
                    }).join(' ')} fill="none" stroke="#e5e1dc" strokeWidth="0.5" />
                ))}
                {/* Axis lines */}
                {dims.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#e5e1dc" strokeWidth="0.5" />;
                })}
                {/* Data polygon */}
                <polygon points={polygon} fill="rgba(200,162,122,0.25)" stroke="#C8A27A" strokeWidth="2" />
                {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C8A27A" />)}
                {/* Labels */}
                {dims.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const lx = cx + (r + 18) * Math.cos(angle);
                    const ly = cy + (r + 18) * Math.sin(angle);
                    return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="text-[10px] fill-secondary/60">{labels[i]}</text>;
                })}
            </svg>
        </div>
    );
};

// ── Loading spinner ─────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex justify-center py-16">
        <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-lg">☕</span>
        </div>
    </div>
);

// ── Section wrapper ──────────────────────────────────────────────────
const Section = ({ title, subtitle, children, action }) => (
    <div className="mb-8 animate-fadeInUp">
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
                {subtitle && <p className="text-sm text-secondary/50 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
        {children}
    </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
    const { user } = useAuth();
    const token = useMemo(() => user?.token || null, [user]);

    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Product management ──────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const { data: prodData, loading: prodLoading, error: prodError, request: fetchProducts } = useApi('/api/products');

    // ── AI Data States ──────────────────────────────────────────────
    const [dashboard, setDashboard] = useState(null);
    const [stagnation, setStagnation] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState(null);
    const [aiLoading, setAiLoading] = useState({});
    const [chatTest, setChatTest] = useState({ messages: [], input: '', sessionId: 'admin-test-' + Date.now() });

    // ── Fetch helpers ───────────────────────────────────────────────
    const apiFetch = useCallback(async (url, opts = {}) => {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...opts,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Request failed');
        return json;
    }, [token]);

    const loadWithState = useCallback(async (key, fn) => {
        setAiLoading(prev => ({ ...prev, [key]: true }));
        try { await fn(); } catch (e) { console.error(key, e); }
        setAiLoading(prev => ({ ...prev, [key]: false }));
    }, []);

    // ── Initial loads ───────────────────────────────────────────────
    useEffect(() => { fetchProducts(); }, []); // eslint-disable-line
    useEffect(() => { if (prodData?.products) setProducts(prodData.products); }, [prodData]);

    // Load AI data when tabs are activated
    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'analytics') {
            loadWithState('dashboard', async () => setDashboard(await apiFetch('/api/analytics/dashboard')));
        }
        if (activeTab === 'stagnation') {
            loadWithState('stagnation', async () => setStagnation(await apiFetch('/api/analytics/stagnation')));
        }
        if (activeTab === 'pricing') {
            loadWithState('pricing', async () => setPricing(await apiFetch('/api/analytics/pricing')));
        }
        if (activeTab === 'quiz') {
            loadWithState('quiz', async () => setQuizQuestions(await apiFetch('/api/quiz/questions')));
        }
    }, [activeTab]); // eslint-disable-line

    // ── Product form handlers ───────────────────────────────────────
    const handleChange = (e) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const resetForm = () => { setForm(emptyForm); setEditingId(null); };
    const handleEdit = (product) => {
        setEditingId(product._id);
        setForm({ name: product.name || '', price: product.price ?? '', image: product.image || '', brand: product.brand || '', category: product.category || '', countInStock: product.countInStock ?? '', description: product.description || '', unitCost: product.unitCost ?? '', currency: product.currency || 'USD', slug: product.slug || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (err) { setFormError(err.message); }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setFormError(null);
        const payload = { name: form.name.trim(), price: Number(form.price), image: form.image.trim(), brand: form.brand.trim(), category: form.category.trim(), countInStock: Number(form.countInStock), description: form.description.trim(), unitCost: Number(form.unitCost), currency: form.currency, slug: form.slug.trim() || undefined };
        try {
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';
            await apiFetch(url, { method, body: JSON.stringify(payload) });
            resetForm(); fetchProducts();
        } catch (err) { setFormError(err.message); } finally { setSaving(false); }
    };

    // ── Chatbot test ────────────────────────────────────────────────
    const sendChatMessage = async () => {
        if (!chatTest.input.trim()) return;
        const msg = chatTest.input.trim();
        setChatTest(prev => ({ ...prev, input: '', messages: [...prev.messages, { role: 'user', text: msg }] }));
        try {
            const res = await apiFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message: msg, sessionId: chatTest.sessionId }) });
            setChatTest(prev => ({
                ...prev,
                messages: [...prev.messages, { role: 'assistant', text: res.text, quickReplies: res.quickReplies, recommendations: res.recommendations }],
            }));
        } catch (e) {
            setChatTest(prev => ({ ...prev, messages: [...prev.messages, { role: 'assistant', text: 'Error: ' + e.message }] }));
        }
    };
    const resetChatTest = async () => {
        const newId = 'admin-test-' + Date.now();
        try { await apiFetch('/api/ai/reset', { method: 'POST', body: JSON.stringify({ sessionId: chatTest.sessionId }) }); } catch {}
        setChatTest({ messages: [], input: '', sessionId: newId });
    };

    // ── Apply dynamic pricing ───────────────────────────────────────
    const applyPricing = async () => {
        if (!window.confirm('Apply AI dynamic pricing to all products?')) return;
        await loadWithState('applyPricing', async () => {
            await apiFetch('/api/analytics/pricing/apply', { method: 'POST' });
            setPricing(await apiFetch('/api/analytics/pricing'));
            fetchProducts();
        });
    };

    // Spinner and Section are defined at module level (below) to avoid re-creation on every render.

    // ═════════════════════════════════════════════════════════════════
    // RENDER TABS
    // ═════════════════════════════════════════════════════════════════

    const renderOverview = () => {
        if (aiLoading.dashboard) return <Spinner />;
        const d = dashboard;
        return (
            <>
                {/* AI Insights Banner */}
                {d?.insights && d.insights.length > 0 && (
                    <Section title="🧠 AI Insights" subtitle="Intelligent observations about your store">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {d.insights.map((insight, i) => (
                                <div key={i} className={`glass rounded-xl p-4 border-l-4 animate-fadeInUp ${
                                    insight.type === 'positive' ? 'border-l-green-400' :
                                    insight.type === 'warning' ? 'border-l-amber-400' : 'border-l-blue-400'
                                }`} style={{ animationDelay: `${i * 100}ms` }}>
                                    <p className="text-sm text-secondary">{insight.text}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Stats Grid */}
                <Section title="Store Overview" subtitle="Real-time metrics powered by AI">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon="👥" label="Total Users" value={d?.overview?.totalUsers || 0} color="blue" />
                        <StatCard icon="☕" label="Total Products" value={d?.overview?.totalProducts || 0} color="primary" />
                        <StatCard icon="💵" label="Revenue (30d)" value={`$${d?.overview?.totalRevenue?.toFixed(2) || '0.00'}`} color="green" />
                        <StatCard icon="📈" label="Profit Margin" value={`${d?.overview?.profitMargin || 0}%`} color="amber" />
                        <StatCard icon="🛒" label="Total Orders" value={d?.overview?.totalOrders || 0} color="blue" />
                        <StatCard icon="💰" label="Avg Order Value" value={`$${d?.overview?.avgOrderValue?.toFixed(2) || '0.00'}`} color="green" />
                        <StatCard icon="📊" label="Total Profit" value={`$${d?.overview?.totalProfit?.toFixed(2) || '0.00'}`} color="primary" />
                        <StatCard icon="📦" label="Stock Alerts" value={d?.stockAlerts?.length || 0} color={d?.stockAlerts?.length > 0 ? 'red' : 'green'} />
                    </div>
                </Section>

                {/* Top Products */}
                {d?.topProducts && d.topProducts.length > 0 && (
                    <Section title="🏆 Top Products" subtitle="Best sellers by units sold">
                        <div className="glass rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/5">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-secondary/60 uppercase">Rank</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-secondary/60 uppercase">Product</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-secondary/60 uppercase">Sold</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-secondary/60 uppercase">Revenue</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-secondary/60 uppercase">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.topProducts.map((p, i) => (
                                        <tr key={i} className="border-t border-gray-100 hover:bg-primary/5 transition-colors">
                                            <td className="px-5 py-3"><span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span></td>
                                            <td className="px-5 py-3 font-medium text-secondary">{p.name}</td>
                                            <td className="px-5 py-3 font-semibold">{p.totalSold}</td>
                                            <td className="px-5 py-3 text-green-600 font-semibold">${p.revenue}</td>
                                            <td className="px-5 py-3 text-primary font-semibold">${p.profit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                )}

                {/* Stock Alerts */}
                {d?.stockAlerts && d.stockAlerts.length > 0 && (
                    <Section title="⚠️ Stock Alerts" subtitle="Products running low based on sales velocity">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {d.stockAlerts.map((alert, i) => (
                                <div key={i} className={`glass rounded-xl p-4 border-l-4 ${
                                    alert.severity === 'critical' ? 'border-l-red-500' :
                                    alert.severity === 'warning' ? 'border-l-amber-400' : 'border-l-blue-400'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-secondary text-sm">{alert.name}</p>
                                            <p className="text-xs text-secondary/50 mt-1">Stock: {alert.currentStock} • Velocity: {alert.dailyVelocity}/day</p>
                                        </div>
                                        <StatusBadge status={alert.severity} />
                                    </div>
                                    <div className="mt-2">
                                        <ProgressBar value={Math.min(alert.daysUntilStockout, 30)} max={30} color={alert.severity === 'critical' ? '#ef4444' : '#f59e0b'} label={`${alert.daysUntilStockout} days until stockout`} />
                                    </div>
                                    <p className="text-xs text-primary mt-2">💡 {alert.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* AI Tool Quick Access */}
                <Section title="🛠️ AI Tools Quick Access" subtitle="Jump to any AI management panel">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TABS.filter(t => t.id !== 'overview' && t.id !== 'products').map(tab => (
                            <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className="glass rounded-xl p-4 text-left card-hover group">
                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{tab.icon}</span>
                                <p className="text-sm font-semibold text-secondary">{tab.label}</p>
                            </button>
                        ))}
                    </div>
                </Section>
            </>
        );
    };

    const renderProducts = () => (
        <>
            {(formError || prodError) && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fadeInUp">{formError || prodError}</div>
            )}

            <Section title={editingId ? '✏️ Edit Product' : '➕ Add New Product'} action={editingId && (
                <button type="button" onClick={resetForm} className="text-sm font-medium text-secondary/60 hover:text-secondary transition-colors">Cancel Edit</button>
            )}>
                <div className="glass rounded-2xl p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[
                            { name: 'name', placeholder: 'Product Name', required: true },
                            { name: 'price', placeholder: 'Price', type: 'number', step: '0.01', min: '0', required: true },
                            { name: 'image', placeholder: 'Image URL', required: true },
                            { name: 'brand', placeholder: 'Brand', required: true },
                            { name: 'category', placeholder: 'Category', required: true },
                            { name: 'countInStock', placeholder: 'Stock Count', type: 'number', min: '0', required: true },
                            { name: 'unitCost', placeholder: 'Unit Cost', type: 'number', step: '0.01', min: '0', required: true },
                            { name: 'slug', placeholder: 'URL Slug (optional)' },
                        ].map(field => (
                            <input key={field.name} {...field} value={form[field.name]} onChange={handleChange} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
                        ))}
                        <div className="md:col-span-2">
                            <label className="block mb-1.5 text-xs font-semibold text-secondary/60 uppercase tracking-wider">Currency</label>
                            <div className="flex gap-3">
                                {['USD', 'TRY'].map(cur => (
                                    <label key={cur} className={`flex items-center gap-2 cursor-pointer rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all ${form.currency === cur ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                        <input type="radio" name="currency" value={cur} checked={form.currency === cur} onChange={handleChange} className="hidden" />
                                        {cur === 'USD' ? '$ USD' : '₺ TRY'}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required rows="3" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
                        <button type="submit" disabled={saving} className="md:col-span-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60 btn-shimmer">
                            {saving ? '⏳ Saving...' : editingId ? '✅ Update Product' : '➕ Create Product'}
                        </button>
                    </form>
                </div>
            </Section>

            <Section title="☕ All Products" subtitle={`${products.length} products`} action={
                <button type="button" onClick={() => fetchProducts()} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">🔄 Refresh</button>
            }>
                {prodLoading ? <Spinner /> : (
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/5">
                                    <tr>
                                        {['Name', 'Price', 'Cost', 'Stock', 'Category', 'Demand', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-secondary/60 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id} className="border-t border-gray-100 hover:bg-primary/5 transition-colors">
                                            <td className="px-4 py-3 font-medium text-secondary">{product.name}</td>
                                            <td className="px-4 py-3">{formatPrice(product.price, product.currency)}</td>
                                            <td className="px-4 py-3 text-secondary/50">{formatPrice(product.unitCost, product.currency)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`font-semibold ${product.countInStock < 10 ? 'text-red-500' : 'text-green-600'}`}>{product.countInStock}</span>
                                            </td>
                                            <td className="px-4 py-3"><span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">{product.category}</span></td>
                                            <td className="px-4 py-3"><ProgressBar value={product.demandScore || 50} max={100} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => handleEdit(product)} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary/10">Edit</button>
                                                    <button type="button" onClick={() => handleDelete(product._id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Section>
        </>
    );

    const renderAnalytics = () => {
        if (aiLoading.dashboard) return <Spinner />;
        const d = dashboard;
        if (!d) return <p className="text-secondary/50 text-center py-10">No analytics data available. Make sure the server is running.</p>;

        const dailyData = d.overview?.dailySales?.slice(-14).map(s => ({
            label: s.date.slice(5),
            value: s.units || s.orders || 0,
        })) || [];

        return (
            <>
                <Section title="📊 Sales Analytics" subtitle="Detailed performance metrics for the last 30 days">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard icon="💵" label="Total Revenue" value={`$${d.overview?.totalRevenue?.toFixed(2) || '0.00'}`} color="green" />
                        <StatCard icon="💰" label="Total Profit" value={`$${d.overview?.totalProfit?.toFixed(2) || '0.00'}`} color="primary" />
                        <StatCard icon="🛒" label="Orders" value={d.overview?.totalOrders || 0} color="blue" />
                        <StatCard icon="📈" label="Profit Margin" value={`${d.overview?.profitMargin || 0}%`} color="amber" />
                    </div>
                </Section>

                {dailyData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <MiniBarChart data={dailyData} label="📈 Daily Activity (Last 14 Days)" />
                        <div className="glass rounded-2xl p-5">
                            <h4 className="text-sm font-semibold text-secondary mb-4">🏆 Revenue Breakdown</h4>
                            {d.topProducts?.map((p, i) => (
                                <div key={i} className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-secondary font-medium">{p.name}</span>
                                        <span className="text-primary font-semibold">${p.revenue}</span>
                                    </div>
                                    <ProgressBar value={p.revenue} max={d.topProducts[0]?.revenue || 1} color={`hsl(${30 + i * 15}, 70%, 55%)`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderStagnation = () => {
        if (aiLoading.stagnation) return <Spinner />;
        if (!stagnation) return <p className="text-secondary/50 text-center py-10">Click Refresh to load stagnation data.</p>;

        return (
            <>
                <Section title="📉 Product Stagnation Detection" subtitle="AI-powered analysis using Z-Scores and Moving Averages"
                    action={<button type="button" onClick={() => loadWithState('stagnation', async () => setStagnation(await apiFetch('/api/analytics/stagnation')))} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">🔄 Refresh</button>}>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {Object.entries(stagnation.summary || {}).filter(([k]) => k !== 'total').map(([status, count]) => (
                            <div key={status} className="glass rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-secondary">{count}</p>
                                <StatusBadge status={status} />
                            </div>
                        ))}
                    </div>

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stagnation.products?.map((p, i) => (
                            <div key={i} className={`glass rounded-2xl p-5 border-l-4 animate-fadeInUp ${
                                p.status === 'critical' ? 'border-l-red-500' :
                                p.status === 'declining' ? 'border-l-orange-400' :
                                p.status === 'watch' ? 'border-l-amber-400' :
                                p.status === 'trending' ? 'border-l-blue-400' : 'border-l-green-400'
                            }`} style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-secondary">{p.name}</h4>
                                        <p className="text-xs text-secondary/50">{p.category} • ${p.price}</p>
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-secondary">{p.zScore}</p>
                                        <p className="text-[10px] text-secondary/40 uppercase">Z-Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-secondary">{p.salesAvg7}</p>
                                        <p className="text-[10px] text-secondary/40 uppercase">7-Day Avg</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-secondary">{p.salesAvg30}</p>
                                        <p className="text-[10px] text-secondary/40 uppercase">30-Day Avg</p>
                                    </div>
                                </div>
                                {p.actions?.length > 0 && (
                                    <div className="space-y-1.5">
                                        {p.actions.map((action, j) => (
                                            <div key={j} className="flex items-center gap-2 text-xs">
                                                <span className={`w-1.5 h-1.5 rounded-full ${action.type === 'discount' ? 'bg-green-400' : action.type === 'removal' ? 'bg-red-400' : 'bg-amber-400'}`} />
                                                <span className="text-secondary/70">{action.suggestion}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            </>
        );
    };

    const renderPricing = () => {
        if (aiLoading.pricing) return <Spinner />;
        if (!pricing) return <p className="text-secondary/50 text-center py-10">Click Refresh to load pricing suggestions.</p>;

        return (
            <Section title="💰 Smart Dynamic Pricing" subtitle="AI adjusts prices based on demand, conversion rates, and time"
                action={
                    <div className="flex gap-2">
                        <button type="button" onClick={() => loadWithState('pricing', async () => setPricing(await apiFetch('/api/analytics/pricing')))} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">🔄 Refresh</button>
                        <button type="button" onClick={applyPricing} disabled={aiLoading.applyPricing} className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 btn-shimmer">
                            {aiLoading.applyPricing ? '⏳ Applying...' : '⚡ Apply Prices'}
                        </button>
                    </div>
                }>
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-secondary/5">
                                <tr>
                                    {['Product', 'Base Price', 'AI Price', 'Adjustment', 'Demand', 'Conversion', 'Reason'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-secondary/60 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pricing.suggestions?.map((s, i) => (
                                    <tr key={i} className="border-t border-gray-100 hover:bg-primary/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-secondary">{s.name}</td>
                                        <td className="px-4 py-3 text-secondary/60">${s.basePrice}</td>
                                        <td className="px-4 py-3 font-bold text-primary">${s.dynamicPrice}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-semibold ${s.adjustmentPct > 0 ? 'text-green-600' : s.adjustmentPct < 0 ? 'text-red-500' : 'text-secondary/50'}`}>
                                                {s.adjustmentPct > 0 ? '+' : ''}{s.adjustmentPct}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3"><ProgressBar value={s.demandScore} /></td>
                                        <td className="px-4 py-3 text-secondary/60">{s.conversionRate}%</td>
                                        <td className="px-4 py-3 text-xs text-secondary/50 max-w-[200px] truncate">{s.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>
        );
    };

    const renderOffers = () => (
        <Section title="🎁 Personalized Offers Engine" subtitle="AI generates targeted discounts based on user behavior">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Inactivity Offers', desc: 'Win-back users who haven\'t purchased in 7+ days. System auto-generates targeted discounts.', icon: '😴', endpoint: 'inactivity', params: '7-day inactivity threshold' },
                    { title: 'Loyalty Rewards', desc: 'Reward loyal customers with 10+ purchases. Auto-generates exclusive discounts.', icon: '👑', endpoint: 'loyalty', params: '10+ purchase threshold' },
                    { title: 'Cross-Sell Offers', desc: 'Suggest new products based on user taste DNA. AI matches unseen products for each user.', icon: '🎯', endpoint: 'cross_sell', params: 'Coffee DNA matching' },
                ].map((offer, i) => (
                    <div key={i} className="glass rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: `${i * 150}ms` }}>
                        <span className="text-4xl block mb-4">{offer.icon}</span>
                        <h3 className="text-lg font-bold text-secondary mb-2">{offer.title}</h3>
                        <p className="text-sm text-secondary/60 mb-4">{offer.desc}</p>
                        <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 rounded-lg px-3 py-2">
                            <span>⚙️</span>
                            <span>{offer.params}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-secondary/40 mb-2">API Endpoint:</p>
                            <code className="text-xs bg-secondary/5 px-2 py-1 rounded text-secondary/70">/api/offers/{offer.endpoint}</code>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-secondary mb-4">📐 Offer Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Inactivity Threshold', value: '7 days' },
                        { label: 'Inactivity Discount', value: '15%' },
                        { label: 'Loyalty Threshold', value: '10 purchases' },
                        { label: 'Loyalty Discount', value: '10%' },
                        { label: 'Cross-Sell Discount', value: '12%' },
                        { label: 'Welcome Discount', value: '20%' },
                        { label: 'Offer Valid For', value: '7 days' },
                        { label: 'Min Order', value: '$0' },
                    ].map((cfg, i) => (
                        <div key={i} className="bg-secondary/5 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-primary">{cfg.value}</p>
                            <p className="text-[10px] text-secondary/50 uppercase tracking-wider mt-1">{cfg.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );

    const renderSubscriptions = () => (
        <Section title="🔄 Smart Subscription System" subtitle="AI-powered auto-adjusting coffee subscriptions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4">📋 How It Works</h3>
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Subscribe', desc: 'User selects products and frequency (weekly/biweekly/monthly).' },
                            { step: '2', title: 'AI Monitors', desc: 'System tracks user taste profile evolution over time.' },
                            { step: '3', title: 'Auto-Adjust', desc: 'When taste changes significantly, AI swaps products automatically.' },
                            { step: '4', title: 'Notify', desc: 'User receives notification with reason and new product suggestions.' },
                        ].map((s, i) => (
                            <div key={i} className="flex gap-3 animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-sm font-bold text-primary">{s.step}</div>
                                <div>
                                    <p className="text-sm font-semibold text-secondary">{s.title}</p>
                                    <p className="text-xs text-secondary/50">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4">⚙️ Available Frequencies</h3>
                    <div className="space-y-3">
                        {[
                            { freq: 'Weekly', days: '7 days', icon: '📅', best: 'Heavy drinkers' },
                            { freq: 'Biweekly', days: '14 days', icon: '📆', best: 'Regular drinkers' },
                            { freq: 'Monthly', days: '30 days', icon: '🗓️', best: 'Casual enjoyers' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/5 hover:bg-primary/5 transition-colors">
                                <span className="text-2xl">{f.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-secondary">{f.freq}</p>
                                    <p className="text-xs text-secondary/50">Every {f.days} • Best for: {f.best}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-secondary/60 uppercase mb-2">API Endpoints</h4>
                        <div className="space-y-1">
                            {['GET /api/subscriptions', 'POST /api/subscriptions', 'POST /api/subscriptions/:id/adjust', 'GET /api/subscriptions/suggestions'].map((ep, i) => (
                                <code key={i} className="block text-xs bg-secondary/5 px-2 py-1 rounded text-secondary/70">{ep}</code>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );

    const renderQuiz = () => {
        if (aiLoading.quiz) return <Spinner />;

        return (
            <Section title="🧪 Coffee Quiz System" subtitle="8-question personality quiz that builds a Coffee DNA profile">
                <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-secondary mb-2">Quiz Overview</h3>
                    <p className="text-sm text-secondary/60 mb-4">The quiz maps creative lifestyle questions to coffee taste dimensions. Each answer option carries hidden weights that calculate the user's Coffee DNA profile, then recommends matching products using cosine similarity.</p>
                    <div className="flex gap-4 text-center">
                        <div className="bg-primary/5 rounded-xl px-6 py-3"><p className="text-2xl font-bold text-primary">{quizQuestions?.questions?.length || 8}</p><p className="text-[10px] text-secondary/50 uppercase">Questions</p></div>
                        <div className="bg-primary/5 rounded-xl px-6 py-3"><p className="text-2xl font-bold text-primary">5</p><p className="text-[10px] text-secondary/50 uppercase">Dimensions</p></div>
                        <div className="bg-primary/5 rounded-xl px-6 py-3"><p className="text-2xl font-bold text-primary">6</p><p className="text-[10px] text-secondary/50 uppercase">Personalities</p></div>
                        <div className="bg-primary/5 rounded-xl px-6 py-3"><p className="text-2xl font-bold text-primary">3</p><p className="text-[10px] text-secondary/50 uppercase">Top Matches</p></div>
                    </div>
                </div>

                {quizQuestions?.questions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizQuestions.questions.map((q, i) => (
                            <div key={i} className="glass rounded-2xl p-5 animate-fadeInUp" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">Q{q.id}</span>
                                    <h4 className="text-sm font-semibold text-secondary">{q.question}</h4>
                                </div>
                                <div className="space-y-2">
                                    {q.options.map((opt, j) => (
                                        <div key={j} className="flex items-center gap-2 text-xs bg-secondary/5 rounded-lg px-3 py-2">
                                            <span className="text-base">{opt.icon}</span>
                                            <span className="text-secondary/70 flex-1">{opt.text}</span>
                                            <span className="text-[9px] text-secondary/40 font-mono">{Object.entries(opt.weights).map(([k, v]) => `${k[0]}:${v}`).join(' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-3">🎭 Coffee Personalities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { label: 'The Purist', emoji: '⬛', trigger: 'Bitterness ≥ 7, Body ≥ 7' },
                            { label: 'The Sweet Tooth', emoji: '🍯', trigger: 'Sweetness ≥ 7' },
                            { label: 'The Explorer', emoji: '🌍', trigger: 'Acidity ≥ 7' },
                            { label: 'The Traditionalist', emoji: '🏛️', trigger: 'Roast Level ≥ 7' },
                            { label: 'The Comfort Seeker', emoji: '🧣', trigger: 'Body ≥ 6, Sweetness ≥ 5' },
                            { label: 'The Balanced Brewer', emoji: '⚖️', trigger: 'Default / balanced scores' },
                        ].map((p, i) => (
                            <div key={i} className="bg-secondary/5 rounded-xl p-4 text-center hover:bg-primary/5 transition-colors">
                                <span className="text-3xl block mb-2">{p.emoji}</span>
                                <p className="text-sm font-bold text-secondary">{p.label}</p>
                                <p className="text-[10px] text-secondary/40 mt-1">{p.trigger}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        );
    };

    const renderChatbot = () => (
        <Section title="🤖 AI Coffee Assistant" subtitle="Test the chatbot and monitor its behavior">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live Test */}
                <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
                    <div className="px-5 py-3 bg-secondary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-semibold text-secondary">Live Chatbot Test</span>
                        </div>
                        <button type="button" onClick={resetChatTest} className="text-xs text-primary hover:text-primary-dark font-medium">🔄 Reset</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {chatTest.messages.length === 0 && (
                            <div className="text-center py-10">
                                <span className="text-4xl block mb-3">☕</span>
                                <p className="text-sm text-secondary/40">Send a message to start the conversation</p>
                                <p className="text-xs text-secondary/30 mt-1">Try: "Hi", "hello", or any greeting</p>
                            </div>
                        )}
                        {chatTest.messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-secondary/5 text-secondary rounded-bl-sm'
                                }`}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    {msg.quickReplies && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {msg.quickReplies.map((qr, j) => (
                                                <button type="button" key={j} onClick={() => { setChatTest(p => ({ ...p, input: qr })); setTimeout(() => sendChatMessage(), 50); }}
                                                    className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors font-medium">
                                                    {qr}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {msg.recommendations && (
                                        <div className="mt-2 space-y-1">
                                            {msg.recommendations.map((rec, j) => (
                                                <div key={j} className="bg-white/10 rounded-lg px-2 py-1 text-xs flex justify-between">
                                                    <span>{rec.name}</span>
                                                    <span className="font-bold">{rec.similarity}% match</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                        <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex gap-2">
                            <input value={chatTest.input} onChange={(e) => setChatTest(p => ({ ...p, input: e.target.value }))}
                                placeholder="Type a message..." className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                            <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors btn-shimmer">Send</button>
                        </form>
                    </div>
                </div>

                {/* Chatbot Info */}
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-secondary mb-4">🧠 How the Chatbot Works</h3>
                        <div className="space-y-3">
                            {[
                                { step: 'Greeting', desc: 'Welcomes user and starts the preference flow', state: 'greeting' },
                                { step: 'Strength', desc: 'Asks about coffee strength preference', state: 'ask_strength' },
                                { step: 'Sweetness', desc: 'Asks about sweetness preference', state: 'ask_sweetness' },
                                { step: 'Flavor', desc: 'Asks about preferred flavor notes', state: 'ask_flavor' },
                                { step: 'Time', desc: 'Asks about consumption time', state: 'ask_time' },
                                { step: 'Recommend', desc: 'Generates recommendations using Cosine Similarity', state: 'recommend' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-semibold text-secondary w-24">{s.step}</span>
                                    <span className="text-secondary/50 flex-1">{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-secondary mb-3">🔬 Algorithm</h3>
                        <div className="bg-secondary/5 rounded-xl p-4 font-mono text-xs text-secondary/70 space-y-1">
                            <p>1. Convert user answers → preference vector</p>
                            <p>2. For each product, get coffeeDNA vector</p>
                            <p>3. Compute cosine similarity (user, product)</p>
                            <p>4. Sort by similarity descending</p>
                            <p>5. Return top 3 matches with % score</p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );

    const renderTasteProfiles = () => {
        // Show sample taste profile visualization
        const sampleProfile = { bitterness: 6, acidity: 4, roastLevel: 7, body: 6, sweetness: 5 };
        return (
            <Section title="🧬 Taste Profile System (Coffee DNA)" subtitle="How user taste profiles are tracked and evolved">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                        <RadarChart profile={sampleProfile} size={220} label="Sample User Coffee DNA" />
                        <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                            {Object.entries(sampleProfile).map(([k, v]) => (
                                <div key={k}>
                                    <p className="text-lg font-bold text-primary">{v}</p>
                                    <p className="text-[9px] text-secondary/40 uppercase">{k.replace('Level', '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-secondary mb-3">📊 Profile Update Algorithm</h3>
                            <div className="bg-secondary/5 rounded-xl p-4">
                                <p className="text-xs font-mono text-secondary/70 mb-2">Exponential Moving Average (EMA):</p>
                                <p className="text-sm font-mono text-primary font-bold">new = α × product + (1-α) × current</p>
                                <p className="text-xs text-secondary/50 mt-2">α = 0.3 (30% weight to new data)</p>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-secondary mb-3">🔮 Taste Evolution Prediction</h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-secondary/60">Uses <strong>Linear Regression</strong> on the last 10 taste history points per dimension:</p>
                                <div className="bg-secondary/5 rounded-xl p-3 font-mono text-xs text-secondary/70">
                                    <p>y = mx + b (per dimension)</p>
                                    <p>Predict 3 steps ahead</p>
                                    <p>Classify: increasing / decreasing / stable</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-secondary mb-3">🔄 Update Triggers</h3>
                            <div className="space-y-2">
                                {['Quiz Completion', 'Product Purchase', 'Product Rating', 'Manual Update'].map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-secondary/60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        );
    };

    // ═════════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═════════════════════════════════════════════════════════════════
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':      return renderOverview();
            case 'products':      return renderProducts();
            case 'analytics':     return renderAnalytics();
            case 'stagnation':    return renderStagnation();
            case 'pricing':       return renderPricing();
            case 'offers':        return renderOffers();
            case 'subscriptions': return renderSubscriptions();
            case 'quiz':          return renderQuiz();
            case 'chatbot':       return renderChatbot();
            case 'taste':         return renderTasteProfiles();
            default:              return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-secondary text-white flex-shrink-0 min-h-screen sticky top-0`}>
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        {sidebarOpen && (
                            <div className="animate-fadeInUp">
                                <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                                    <span className="text-primary-light">AI</span> Dashboard
                                </h1>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Control Center</p>
                            </div>
                        )}
                        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-sm">
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="space-y-1">
                        {TABS.map(tab => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-primary/20 text-primary-light'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }`}
                            >
                                <span className="text-base flex-shrink-0">{tab.icon}</span>
                                {sidebarOpen && <span className="truncate">{tab.label}</span>}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* User Info */}
                {sidebarOpen && (
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-warm flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-medium text-white/80 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-white/40">Administrator</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                            {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-xs text-secondary/40 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden md:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            AI Systems Online
                        </span>
                    </div>
                </div>

                {renderActiveTab()}
            </main>
        </div>
    );
};

export default AdminDashboard;
