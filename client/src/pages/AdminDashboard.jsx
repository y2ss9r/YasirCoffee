import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatPrice } from '../utils/formatPrice';

const emptyForm = {
    name: '',
    price: '',
    image: '',
    brand: '',
    category: '',
    countInStock: '',
    description: '',
    unitCost: '',
    currency: 'USD',
    slug: '',
};

const AdminDashboard = () => {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const token = useMemo(() => user?.token || null, [user]);

    // useApi for fetching the product list
    const { data, loading, error, request: fetchProducts } = useApi('/api/products');

    useEffect(() => {
        fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync products state when api data changes
    useEffect(() => {
        if (data?.products) setProducts(data.products);
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setForm({
            name: product.name || '',
            price: product.price ?? '',
            image: product.image || '',
            brand: product.brand || '',
            category: product.category || '',
            countInStock: product.countInStock ?? '',
            description: product.description || '',
            unitCost: product.unitCost ?? '',
            currency: product.currency || 'USD',
            slug: product.slug || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Failed to delete');
            fetchProducts();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        const payload = {
            name: form.name.trim(),
            price: Number(form.price),
            image: form.image.trim(),
            brand: form.brand.trim(),
            category: form.category.trim(),
            countInStock: Number(form.countInStock),
            description: form.description.trim(),
            unitCost: Number(form.unitCost),
            currency: form.currency,
            slug: form.slug.trim() || undefined,
        };

        try {
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Failed to save product');

            resetForm();
            fetchProducts();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 py-10">
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
                    <p className="text-secondary/70">Manage products: add, edit, and remove items.</p>
                </div>

                {/* Show form errors or fetch errors */}
                {(formError || error) && (
                    <div className="mb-6 rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">
                        {formError || error}
                    </div>
                )}

                <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-secondary">
                            {editingId ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        {editingId && (
                            <button
                                onClick={resetForm}
                                className="text-sm font-medium text-secondary/70 hover:text-secondary"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" min="0" placeholder="Price" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="countInStock" value={form.countInStock} onChange={handleChange} type="number" min="0" placeholder="Count In Stock" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="unitCost" value={form.unitCost} onChange={handleChange} type="number" step="0.01" min="0" placeholder="Unit Cost" required className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (optional)" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />

                        {/* Currency Selector */}
                        <div className="md:col-span-2">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Display Currency</label>
                            <div className="flex gap-3">
                                {['USD', 'TRY'].map((cur) => (
                                    <label
                                        key={cur}
                                        className={`flex items-center gap-2 cursor-pointer rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                                            form.currency === cur
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="currency"
                                            value={cur}
                                            checked={form.currency === cur}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        {cur === 'USD' ? '$ USD — Dollar' : '₺ TRY — Turkish Lira'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required rows="3" className="rounded-md border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
                        <button type="submit" disabled={saving} className="md:col-span-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-secondary">Products</h2>
                        <button onClick={() => fetchProducts()} className="text-sm font-medium text-secondary/70 hover:text-secondary">
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 text-secondary/70">
                                    <tr>
                                        <th className="py-2">Name</th>
                                        <th className="py-2">Price</th>
                                        <th className="py-2">Currency</th>
                                        <th className="py-2">Stock</th>
                                        <th className="py-2">Category</th>
                                        <th className="py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id} className="border-b border-gray-100">
                                                <td className="py-3 font-medium text-secondary">{product.name}</td>
                                                <td className="py-3">{formatPrice(product.price, product.currency)}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                        product.currency === 'TRY'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {product.currency === 'TRY' ? '₺ TRY' : '$ USD'}
                                                    </span>
                                                </td>
                                                <td className="py-3">{product.countInStock}</td>
                                                <td className="py-3">{product.category}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(product)} className="text-xs font-semibold text-primary hover:text-primary/80">Edit</button>
                                                    <button onClick={() => handleDelete(product._id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

