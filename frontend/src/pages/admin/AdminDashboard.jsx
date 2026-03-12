import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('customers'); // 'customers', 'products', 'categories'
    
    // Data States
    const [customers, setCustomers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Helper to get full image URL (handles VM/local seamlessly)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
        return `${baseUrl.replace(/\/api\/?$/, '')}${imagePath}`;
    };

    // UI Feedback
    const [msg, setMsg] = useState({ text: '', type: '' });
    const showMessage = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    // --- Fetch Data ---
    const fetchData = async () => {
        try {
            const [custRes, subRes, prodRes, catRes] = await Promise.all([
                axiosInstance.get('admin/customers/'),
                axiosInstance.get('subscription/admin/'),
                axiosInstance.get('product/'),
                axiosInstance.get('category/')
            ]);
            setCustomers(custRes.data);
            setSubscriptions(subRes.data);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            showMessage("Failed to load dashboard data.", "error");
        }
    };

    useEffect(() => {
        if (user && (user.is_staff || user.is_superuser)) {
            fetchData();
        }
    }, [user]);

    // --- Category Management ---
    const [catName, setCatName] = useState('');
    const [catDescription, setCatDescription] = useState('');
    const [editCatId, setEditCatId] = useState(null);
    const [editCatName, setEditCatName] = useState('');
    const [editCatDescription, setEditCatDescription] = useState('');

    const handleAddCategory = async (e) => {
        if (e) e.preventDefault();
        try {
            await axiosInstance.post('category/admin/', { name: catName, description: catDescription });
            showMessage('Category added successfully!');
            setCatName('');
            setCatDescription('');
            fetchData();
        } catch (err) {
            showMessage('Failed to add category.', 'error');
        }
    };

    const handleUpdateCategory = async (id) => {
        try {
            await axiosInstance.put(`category/admin/${id}/`, { name: editCatName, description: editCatDescription });
            showMessage('Category updated successfully!');
            setEditCatId(null);
            fetchData();
        } catch (err) {
            showMessage('Failed to update category.', 'error');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await axiosInstance.delete(`category/admin/${id}/`);
            showMessage('Category deleted successfully!');
            fetchData();
        } catch (err) {
            showMessage('Failed to delete category.', 'error');
        }
    };

    // --- Product Management ---
    const [prodData, setProdData] = useState({ name: '', description: '', price: '', category: '', stock_quantity: '', image: null });
    const [editProdId, setEditProdId] = useState(null);
    const [editProdData, setEditProdData] = useState({});

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(prodData).forEach(key => {
                if (prodData[key] !== null) formData.append(key, prodData[key]);
            });
            await axiosInstance.post('product/admin/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showMessage('Product added successfully!');
            setProdData({ name: '', price: '', category: '', stock_quantity: '', image: null });
            fetchData();
        } catch (err) {
            showMessage('Failed to add product.', 'error');
        }
    };

    const handleUpdateProduct = async (id) => {
        try {
            const formData = new FormData();
            Object.keys(editProdData).forEach(key => {
                if(key !== 'image' || editProdData[key] instanceof File) {
                    formData.append(key, editProdData[key]);
                }
            });
            await axiosInstance.put(`product/admin/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showMessage('Product updated successfully!');
            setEditProdId(null);
            fetchData();
        } catch (err) {
            showMessage('Failed to update product.', 'error');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axiosInstance.delete(`product/admin/${id}/`);
            showMessage('Product deleted successfully!');
            fetchData();
        } catch (err) {
            showMessage('Failed to delete product.', 'error');
        }
    };

    // --- Customer Management ---
    const [editCustId, setEditCustId] = useState(null);
    const [editCustData, setEditCustData] = useState({});

    const handleUpdateCustomer = async (id) => {
        try {
            await axiosInstance.put(`admin/customers/${id}/`, editCustData);
            showMessage('Customer updated successfully!');
            setEditCustId(null);
            fetchData();
        } catch (err) {
            showMessage('Failed to update customer.', 'error');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            await axiosInstance.delete(`admin/customers/${id}/`);
            showMessage('Customer deleted successfully!');
            fetchData();
        } catch (err) {
            showMessage('Failed to delete customer.', 'error');
        }
    };


    if (!user || (!user.is_staff && !user.is_superuser)) {
        return <div className="p-12 text-center text-red-600 font-bold text-xl">Access Denied: Admin Privileges Required.</div>;
    }

    const tabs = [
        { id: 'customers', label: 'Customers 👥' },
        { id: 'products', label: 'Products 📦' },
        { id: 'categories', label: 'Categories 🏷️' },
        { id: 'subscriptions', label: 'Subscriptions 📈' }
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container max-w-7xl px-4 py-6 mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h1>
                            <p className="mt-1 text-slate-500 font-medium">Manage your business resources</p>
                        </div>
                        {msg.text && (
                            <div className={`px-4 py-2 rounded-lg font-semibold text-sm animate-pulse ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {msg.text}
                            </div>
                        )}
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-4 mt-6 overflow-x-auto pb-2 custom-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-y(-1px)' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl px-4 py-8 mx-auto">
                {/* --- CUSTOMERS TAB --- */}
                {activeTab === 'customers' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Customer Directory</h2>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider rounded-full">{customers.length} Users</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subscriptions</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customers.map(customer => {
                                        const custSubs = subscriptions.filter(s => s.customer === customer.id && s.status === 'active');
                                        const isEditing = editCustId === customer.id;
                                        return (
                                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <input type="text" value={editCustData.username || ''} onChange={(e) => setEditCustData({...editCustData, username: e.target.value})} className="w-full px-2 py-1 border rounded" />
                                                    ) : (
                                                        <div className="font-bold text-slate-800">{customer.username}</div>
                                                    )}
                                                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {customer.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input type="email" value={editCustData.email || ''} onChange={(e) => setEditCustData({...editCustData, email: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" placeholder="Email" />
                                                            <input type="text" value={editCustData.phone || ''} onChange={(e) => setEditCustData({...editCustData, phone: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" placeholder="Phone" />
                                                            <input type="text" value={editCustData.address || ''} onChange={(e) => setEditCustData({...editCustData, address: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" placeholder="Address" />
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm">
                                                            <div className="text-slate-700 flex items-center gap-1">✉️ {customer.email}</div>
                                                            <div className="text-slate-600 mt-1">📞 {customer.phone || 'N/A'}</div>
                                                            <div className="text-slate-500 text-xs mt-1 max-w-[200px] truncate" title={customer.address}>📍 {customer.address || 'N/A'}</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {custSubs.length > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">{custSubs.length} Active</span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs font-medium">None</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditCustId(null)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition">Cancel</button>
                                                            <button onClick={() => handleUpdateCustomer(customer.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">Save</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditCustId(customer.id); setEditCustData(customer); }} className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Edit</button>
                                                            <button onClick={() => handleDeleteCustomer(customer.id)} className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {customers.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No customers found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Add Product Form */}
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-indigo-500">➕</span> Add New Product</h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                    <div className="md:col-span-1">
                                        <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                                        <input type="text" value={prodData.name} onChange={(e) => setProdData({ ...prodData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                                        <input type="number" step="0.01" value={prodData.price} onChange={(e) => setProdData({ ...prodData, price: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                                        <input type="number" value={prodData.stock_quantity} onChange={(e) => setProdData({ ...prodData, stock_quantity: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                        <select value={prodData.category} onChange={(e) => setProdData({ ...prodData, category: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" required>
                                            <option value="">Select...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => setProdData({ ...prodData, image: e.target.files[0] })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition" />
                                    </div>
                                    <div className="md:col-span-1 flex gap-2">
                                        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-sm">Save</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Description <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                                    <textarea value={prodData.description} onChange={(e) => setProdData({ ...prodData, description: e.target.value })} rows={2} placeholder="Short product description..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" />
                                </div>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map(product => {
                                        const isEditing = editProdId === product.id;
                                        const catNameDisplay = categories.find(c => c.id === product.category)?.name || `ID: ${product.category}`;
                                        return (
                                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input type="text" value={editProdData.name || ''} onChange={(e) => setEditProdData({...editProdData, name: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" placeholder="Name" />
                                                            <textarea value={editProdData.description || ''} onChange={(e) => setEditProdData({...editProdData, description: e.target.value})} rows={2} className="w-full px-2 py-1 border rounded text-sm resize-none" placeholder="Description (optional)" />
                                                        </div>
                                                    ) : (
                                                        <div className="font-bold text-slate-800 flex items-center gap-3">
                                                            {product.image && <img src={getImageUrl(product.image)} alt={product.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />}
                                                            <div>
                                                                <div>{product.name}</div>
                                                                {product.description && <div className="text-xs text-slate-400 font-normal mt-0.5 max-w-[200px] truncate">{product.description}</div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <input type="number" step="0.01" value={editProdData.price || ''} onChange={(e) => setEditProdData({...editProdData, price: e.target.value})} className="w-20 px-2 py-1 border rounded text-sm" />
                                                    ) : (
                                                        <span className="font-semibold text-slate-700">₹{product.price}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <input type="number" value={editProdData.stock_quantity || ''} onChange={(e) => setEditProdData({...editProdData, stock_quantity: e.target.value})} className="w-20 px-2 py-1 border rounded text-sm" />
                                                    ) : (
                                                        <span className={`font-semibold ${product.stock_quantity > 10 ? 'text-green-600' : 'text-orange-500'}`}>{product.stock_quantity}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <select value={editProdData.category || ''} onChange={(e) => setEditProdData({...editProdData, category: e.target.value})} className="w-full px-2 py-1 border rounded text-sm">
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{catNameDisplay}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditProdId(null)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition">Cancel</button>
                                                            <button onClick={() => handleUpdateProduct(product.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">Save</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditProdId(product.id); setEditProdData(product); }} className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Edit</button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {products.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No products found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">New Category Name</label>
                                    <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g., Dairy Products" onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)} />
                                </div>
                                <button onClick={handleAddCategory} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-sm mb-[1px]">Add Category</button>
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Description <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                                <textarea value={catDescription} onChange={(e) => setCatDescription(e.target.value)} rows={2} placeholder="Short category description..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categories.map(category => {
                                        const isEditing = editCatId === category.id;
                                        return (
                                            <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-mono text-slate-400">{category.id}</td>
                                                <td className="px-6 py-4">
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="w-full px-3 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" autoFocus />
                                                            <textarea value={editCatDescription} onChange={(e) => setEditCatDescription(e.target.value)} rows={2} className="w-full px-3 py-1 border border-slate-200 rounded text-sm resize-none" placeholder="Description (optional)" />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="font-bold text-slate-800">{category.name}</span>
                                                            {category.description && <div className="text-xs text-slate-400 mt-0.5">{category.description}</div>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditCatId(null)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition">Cancel</button>
                                                            <button onClick={() => handleUpdateCategory(category.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">Save</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditCatId(category.id); setEditCatName(category.name); setEditCatDescription(category.description || ''); }} className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Edit</button>
                                                            <button onClick={() => handleDeleteCategory(category.id)} className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold transition">Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {categories.length === 0 && (
                                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500">No categories found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- SUBSCRIPTIONS TAB --- */}
                {activeTab === 'subscriptions' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">All Subscriptions</h2>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full">{subscriptions.length} Active</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Frequency</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status / Dates</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscriptions.map(sub => {
                                        return (
                                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-800">ID: {sub.customer}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                        {sub.product_details?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">Product ID: {sub.product}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">
                                                    {sub.quantity} {sub.quantity === 1 ? 'unit' : 'units'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-wider">
                                                        {sub.delivery_frequency.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex w-fit px-2 py-0.5 text-xs font-bold rounded-full ${
                                                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            sub.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            {sub.status.toUpperCase()}
                                                        </span>
                                                        <span className="text-xs text-slate-500 mt-1">Start: {sub.start_date}</span>
                                                        {sub.end_date && <span className="text-xs text-slate-500">End: {sub.end_date}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {subscriptions.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No subscriptions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
