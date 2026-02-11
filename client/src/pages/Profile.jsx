import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import ApplicantsModal from '../components/ApplicantsModal';
import ProductDetailsModal from '../components/ProductDetailsModal';

const Profile = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [myProducts, setMyProducts] = useState([]);
    const [myOffers, setMyOffers] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [salesCount, setSalesCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        avatar: '',
        skills: []
    });
    const [newSkill, setNewSkill] = useState('');
    // Add file state for avatar upload
    const [avatarFile, setAvatarFile] = useState(null);

    const [status, setStatus] = useState({ type: '', msg: '' });

    // Applicants Modal State
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
    const navigate = useNavigate();

    const isCompany = user?.role === 'EMPRESA';

    useEffect(() => {
        if (user) {
            if (isCompany) {
                fetchMyOffers();
                fetchMyPurchases();
            } else {
                fetchMyProducts();
                fetchSalesCount();
            }
            setEditForm({
                name: user.name || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                skills: user.skills || []
            });
        }
    }, [user, isCompany]);

    const fetchMyProducts = async () => {
        try {
            const res = await api.get('/products/my-products');
            setMyProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyOffers = async () => {
        try {
            const res = await api.get('/offers/my-offers');
            setMyOffers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyPurchases = async () => {
        try {
            const res = await api.get('/payments/my-purchases');
            setMyPurchases(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSalesCount = async () => {
        try {
            const res = await api.get('/payments/my-sales-count');
            setSalesCount(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProductClick = async (product) => {
        setSelectedProduct(product);
        setTransactionDetails(null);

        if (product.status === 'SOLD') {
            try {
                const res = await api.get(`/payments/transaction/product/${product._id}`);
                setTransactionDetails(res.data);
            } catch (err) {
                console.error("Error fetching transaction:", err);
            }
        }
        setIsProductDetailsOpen(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);
        // Create preview URL
        if (file) {
            setEditForm({ ...editForm, avatar: URL.createObjectURL(file) });
        }
    };

    const handleSaveProfile = async () => {
        setStatus({ type: 'loading', msg: 'Guardando...' });

        const data = new FormData();
        data.append('name', editForm.name);
        data.append('bio', editForm.bio);
        data.append('skills', JSON.stringify(editForm.skills));
        if (avatarFile) {
            data.append('avatar', avatarFile);
        } else {
            // If we want to support text URL updates alongside file uploads, checking if it's a blob url
            if (editForm.avatar && !editForm.avatar.startsWith('blob:') && editForm.avatar !== user.avatar) {
                data.append('avatar', editForm.avatar);
            }
        }

        const res = await updateUser(data);
        if (res.success) {
            setStatus({ type: 'success', msg: 'Perfil actualizado' });
            setTimeout(() => {
                setStatus({ type: '', msg: '' });
                setIsEditing(false);
            }, 1500);
        } else {
            setStatus({ type: 'error', msg: res.msg });
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 relative overflow-hidden">
            {/* Applicants Modal */}
            <ApplicantsModal
                isOpen={isApplicantsModalOpen}
                onClose={() => setIsApplicantsModalOpen(false)}
                offer={selectedOffer}
            />

            {/* Product Details Modal (for Freelancers) */}
            <ProductDetailsModal
                isOpen={isProductDetailsOpen}
                onClose={() => setIsProductDetailsOpen(false)}
                product={selectedProduct}
                transaction={transactionDetails} // Pass transaction info
                onChat={() => { }} // No chat needed for sales history
                onBuy={() => { }} // No buy needed for sales history
            />

            {/* Ambient Background Effects - Global Harmony */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-1000 pointer-events-none" />
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 pt-8">
                <div className="max-w-6xl mx-auto mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-md"
                    >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Volver al inicio</span>
                    </button>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shrink-0 relative group">
                            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                                {user?.avatar || editForm.avatar ?
                                    <img src={isEditing ? editForm.avatar : user.avatar} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} /> :
                                    <span className="text-4xl font-bold text-white">{user?.name?.[0]}</span>
                                }
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-xs text-white font-bold">Cambiar</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 w-full relative">
                            {isEditing ? (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase font-bold">Nombre</label>
                                        <input
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            className="w-full bg-black/20 text-white border border-white/10 rounded-lg px-3 py-2 text-xl font-bold focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase font-bold">Biografía</label>
                                        <textarea
                                            name="bio"
                                            value={editForm.bio}
                                            onChange={handleEditChange}
                                            rows="2"
                                            className="w-full bg-black/20 text-gray-300 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none resize-none"
                                        />
                                    </div>

                                    {/* Skills Section - Freelancers Only */}
                                    {!isCompany && (
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Habilidades</label>
                                            <div className="flex gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && newSkill.trim()) {
                                                            e.preventDefault();
                                                            setEditForm({ ...editForm, skills: [...editForm.skills, newSkill.trim()] });
                                                            setNewSkill('');
                                                        }
                                                    }}
                                                    placeholder="Ej: React, Diseño UI..."
                                                    className="flex-1 bg-black/20 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newSkill.trim()) {
                                                            setEditForm({ ...editForm, skills: [...editForm.skills, newSkill.trim()] });
                                                            setNewSkill('');
                                                        }
                                                    }}
                                                    className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-emerald-400 transition"
                                                >
                                                    + Agregar
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {editForm.skills.map((skill, index) => (
                                                    <div key={index} className="bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm({ ...editForm, skills: editForm.skills.filter((_, i) => i !== index) })}
                                                            className="hover:text-red-400 transition"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={status.type === 'loading'}
                                            className="bg-primary text-main font-bold px-6 py-2 rounded-lg hover:shadow-lg transition"
                                        >
                                            {status.type === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-gray-400 hover:text-white px-4 py-2"
                                        >
                                            Cancelar
                                        </button>
                                        {status.msg && (
                                            <span className={`text-sm font-bold ${status.type === 'error' ? 'text-alert' : 'text-primary'}`}>
                                                {status.msg}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompany ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {isCompany ? 'Empresa' : 'Freelancer'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mt-2 max-w-lg mx-auto md:mx-0">{user?.bio || 'Sin biografía.'}</p>
                                    <div className="flex gap-4 mt-4 justify-center md:justify-start">
                                        <div className="bg-black/20 px-4 py-2 rounded-lg">
                                            <span className="block text-xl font-bold text-primary">
                                                {isCompany ? myOffers.length : myProducts.length}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">
                                                {isCompany ? 'Ofertas' : 'Publicaciones'}
                                            </span>
                                        </div>
                                        <div className="bg-black/20 px-4 py-2 rounded-lg">
                                            <span className="block text-xl font-bold text-white">
                                                {isCompany ? `S/ ${user?.wallet || 0}` : salesCount}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">{isCompany ? 'Balance' : 'Productos Vendidos'}</span>
                                        </div>
                                    </div>

                                    {/* Skills Display - Freelancers Only */}
                                    {!isCompany && user?.skills && user.skills.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs text-gray-500 uppercase font-bold mb-2">Habilidades</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.map((skill, index) => (
                                                    <span key={index} className="bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="border border-white/10 px-6 py-2 rounded-lg hover:bg-white/5 transition text-sm text-white"
                                >
                                    Editar Perfil
                                </button>
                                <button onClick={logout} className="bg-alert/10 text-alert border border-alert/30 px-6 py-2 rounded-lg hover:bg-alert hover:text-white transition text-sm">
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Grid */}
                    <h2 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-primary">
                        {isCompany ? 'Mis Ofertas de Trabajo' : 'Mis Publicaciones'}
                    </h2>

                    {isCompany ? (
                        // COMPANY DASHBOARD (Purchases & Offers)
                        <div className="space-y-12">
                            {/* PURCHASES SECTION */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-400 mb-4 uppercase tracking-wider">Mis Compras</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myPurchases.map(pc => (
                                        <div key={pc._id} className="glass rounded-xl overflow-hidden p-4 border border-white/5 group hover:border-primary/30 transition">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                                                    <img src={pc.product_id?.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate">{pc.product_id?.title}</h4>
                                                    <p className="text-primary font-bold text-sm">S/ {pc.amount}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span>Vendedor:</span>
                                                        <span className="text-gray-300">{pc.product_id?.seller?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{new Date(pc.timestamp).toLocaleDateString()}</span>
                                                <button
                                                    onClick={() => navigate(`/chat?receiverId=${pc.product_id?.seller?._id}`)}
                                                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition flex items-center gap-2"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    Contactar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {myPurchases.length === 0 && (
                                        <div className="col-span-full text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            <p className="text-gray-500 text-sm">No has realizado compras.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* OFFERS SECTION */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-400 mb-4 uppercase tracking-wider">Mis Ofertas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myOffers.map(offer => (
                                        <div
                                            key={offer._id}
                                            onClick={() => { setSelectedOffer(offer); setIsApplicantsModalOpen(true); }}
                                            className="glass rounded-xl overflow-hidden p-6 border border-white/5 hover:border-secondary/50 transition cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white text-lg group-hover:text-secondary transition">{offer.title}</h3>
                                                <span className="text-secondary font-bold">S/ {offer.budget}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{offer.description}</p>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{new Date(offer.createdAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-secondary/10 border border-secondary/30 px-3 py-1 rounded-full text-secondary font-bold">
                                                        {offer.applicants?.length || 0} Postulantes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>))}
                                    {myOffers.length === 0 && (
                                        <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            <p className="text-gray-500">Aún no has publicado ofertas.</p>
                                            <button onClick={() => navigate('/upload')} className="text-primary mt-2 font-bold hover:underline">¡Publicar Oferta!</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // FREELANCER PRODUCTS GRID
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {myProducts.map(product => (
                                <div
                                    key={product._id}
                                    className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/50 transition"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-white truncate">{product.title}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-400">{new Date(product.createdAt).toLocaleDateString()}</span>
                                            <span className="text-primary font-bold">S/ {product.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {myProducts.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <p className="text-gray-500">Aún no has subido contenido.</p>
                                    <button onClick={() => navigate('/upload')} className="text-primary mt-2 font-bold hover:underline">¡Empieza ahora!</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default Profile;
