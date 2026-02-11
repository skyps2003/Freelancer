import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
// import CheckoutModal from '../components/CheckoutModal'; // Removed
import ProductDetailsModal from '../components/ProductDetailsModal';
import OfferDetailsModal from '../components/OfferDetailsModal';

const Home = () => {
    const { user, logout } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todo');
    const [viewMode, setViewMode] = useState('products'); // 'products' or 'offers'
    const navigate = useNavigate();

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    // const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Removed
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isOfferDetailsOpen, setIsOfferDetailsOpen] = useState(false);

    const categories = ['Todo', 'Naturaleza', 'Tecnología', 'Abstracto', 'Servicios', 'Negocios', 'Arte'];
    const offerCategories = ['Todo', 'Desarrollo Web', 'Diseño Gráfico', 'Marketing', 'Redacción', 'Video', 'Otros'];

    const isCompany = user?.role === 'EMPRESA';
    const isFreelancer = user?.role === 'FREELANCER';

    // Set initial view mode based on role
    useEffect(() => {
        if (isFreelancer) {
            setViewMode('offers');
        } else {
            setViewMode('products');
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [viewMode, category, search]);

    const fetchData = async () => {
        try {
            if (viewMode === 'products') {
                let url = '/products';
                const params = [];
                if (category && category !== 'Todo') params.push(`category=${category}`);
                if (search) params.push(`search=${search}`);
                if (params.length > 0) url += `?${params.join('&')}`;
                const res = await api.get(url);
                setProducts(res.data);
            } else {
                const res = await api.get('/offers');
                let data = res.data;
                if (category && category !== 'Todo') {
                    data = data.filter(o => o.category === category);
                }
                if (search) {
                    const regex = new RegExp(search, 'i');
                    data = data.filter(o => regex.test(o.title) || regex.test(o.description));
                }
                setOffers(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async (offerId, message = '', cvFile = null) => {
        if (!user) {
            navigate('/login?mode=login');
            return;
        }
        if (user.role !== 'FREELANCER') {
            alert("Solo los Freelancers pueden postular a ofertas de trabajo.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('message', message);
            if (cvFile) {
                formData.append('cv', cvFile);
            }

            await api.post(`/offers/${offerId}/apply`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Postulación enviada exitosamente");
            setIsOfferDetailsOpen(false);
            fetchData(); // Refresh to show updated applicant count
        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Error al enviar la postulación";
            alert(errorMsg);
        }
    };

    const openMessageModal = (product) => {
        if (!user) return navigate('/login?mode=login');
        setSelectedProduct(product);
        setIsMessageOpen(true);
    };

    const openCheckoutPage = (product) => {
        if (!user) return navigate('/login?mode=login');
        navigate('/checkout', { state: { product } });
    };

    const activeCategories = viewMode === 'offers' ? offerCategories : categories;

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden bg-[#0a0a0a]">
            {/* Modals */}
            {selectedProduct && (
                <>
                    <MessageModal
                        isOpen={isMessageOpen}
                        onClose={() => setIsMessageOpen(false)}
                        receiverId={selectedProduct.seller?._id}
                        productId={selectedProduct._id}
                        productName={selectedProduct.title}
                    />
                    {/* CheckoutModal removed */}
                    <ProductDetailsModal
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        product={selectedProduct}
                        onChat={(product) => {
                            // Close details, open chat
                            setIsDetailsOpen(false);
                            openMessageModal(product);
                        }}
                        onBuy={(product) => {
                            setIsDetailsOpen(false);
                            openCheckoutPage(product);
                        }}
                    />
                </>
            )}

            {/* Offer Details Modal */}
            <OfferDetailsModal
                isOpen={isOfferDetailsOpen}
                onClose={() => setIsOfferDetailsOpen(false)}
                offer={selectedOffer}
                onApply={handleApply}
                user={user}
            />

            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow pointer-events-none" />
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-1000 pointer-events-none" />
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex justify-between items-center relative backdrop-blur-md bg-black/50">
                <div className="flex items-center gap-8">
                    <h1
                        onClick={() => navigate('/')}
                        className="text-2xl font-bold tracking-tight cursor-pointer group"
                    >
                        Lumina<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary group-hover:opacity-80 transition">Market</span>
                    </h1>

                    {/* Desktop Tabs */}
                    <div className="hidden md:flex bg-white/5 p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setViewMode('products')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'products' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Explorar Proyectos
                        </button>
                        <button
                            onClick={() => setViewMode('offers')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'offers' ? 'bg-secondary text-black shadow-lg shadow-secondary/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Buscar Trabajo
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button
                                onClick={() => navigate('/upload')}
                                className="hidden md:block bg-gradient-to-r from-primary to-emerald-400 text-black font-bold px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(6,214,160,0.5)] transition transform hover:scale-105"
                            >
                                {isCompany ? 'Publicar Oferta' : 'Subir Portafolio'}
                            </button>

                            {/* Chat Button */}
                            <button
                                onClick={() => navigate('/chat')}
                                className="relative p-2 text-gray-400 hover:text-white transition group bg-white/5 rounded-full hover:bg-white/10"
                                title="Mensajes"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse border border-black"></span>
                            </button>

                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/profile')}>
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-white group-hover:text-primary transition">{user.name}</div>
                                    <div className="text-xs text-gray-400">{isCompany ? 'Empresa' : 'Freelancer'}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                        {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{user.name[0]}</div>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={logout} className="text-gray-400 hover:text-alert transition p-2 hover:bg-white/5 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/login?mode=login')} className="text-white font-medium hover:text-primary transition">Iniciar Sesión</button>
                            <button onClick={() => navigate('/login?mode=register')} className="bg-white text-main font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-white/20">Registrarse</button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Tabs */}
            <div className="md:hidden flex justify-center mt-6 px-6">
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-full max-w-sm backdrop-blur-md">
                    <button
                        onClick={() => setViewMode('products')}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'products' ? 'bg-primary text-black font-bold' : 'text-gray-400'}`}
                    >
                        Proyectos
                    </button>
                    <button
                        onClick={() => setViewMode('offers')}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'offers' ? 'bg-secondary text-black font-bold' : 'text-gray-400'}`}
                    >
                        Ofertas
                    </button>
                </div>
            </div>

            {/* Hero Search & Categories */}
            <div className="relative py-16 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        {viewMode === 'offers'
                            ? <span>Encuentra tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-emerald-400">trabajo ideal</span></span>
                            : <span>Descubre talento <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">extraordinario</span></span>
                        }
                    </h2>

                    <div className="relative max-w-2xl mx-auto mb-10 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <input
                            type="text"
                            placeholder={viewMode === 'offers' ? "Buscar ofertas de trabajo..." : "Buscar portafolios, creativos..."}
                            className="relative w-full p-5 pl-12 rounded-full bg-black/80 border border-white/10 text-white placeholder-gray-500 focus:border-white/30 outline-none text-lg backdrop-blur-xl transition-all shadow-2xl"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {activeCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${category === cat ? 'bg-white text-black font-bold shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white border border-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Content Grid */}
            <div className="px-6 max-w-[1600px] mx-auto pb-24">
                {viewMode === 'offers' ? (
                    // OFFERS GRID
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer, index) => (
                            <motion.div
                                key={offer._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => { setSelectedOffer(offer); setIsOfferDetailsOpen(true); }}
                                className="glass-card p-8 border border-white/5 hover:border-secondary/40 transition-all duration-300 group hover:shadow-[0_0_40px_rgba(var(--secondary-rgb),0.1)] relative overflow-hidden flex flex-col h-full cursor-pointer"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-secondary transition duration-300 leading-tight">{offer.title}</h3>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-2 inline-block border border-white/10 px-2 py-1 rounded">{offer.category}</span>
                                    </div>
                                    <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-xl text-lg font-bold whitespace-nowrap shadow-[0_0_15px_rgba(6,214,160,0.1)]">
                                        S/ {offer.budget}
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm mb-8 line-clamp-4 leading-relaxed flex-grow">{offer.description}</p>
                                <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold border border-white/10 text-gray-300 shadow-inner">
                                            {offer.employer?.name?.[0] || 'E'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-secondary font-bold uppercase tracking-wide">Empresa</span>
                                            <span className="text-sm text-white font-medium">{offer.employer?.name}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleApply(offer._id); }}
                                        className="bg-white text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-secondary hover:text-black transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-secondary/30"
                                    >
                                        Postular
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // PRODUCTS STANDARD GRID
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => { setSelectedProduct(product); setIsDetailsOpen(true); }}
                                className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 group flex flex-col h-full shadow-lg cursor-pointer"
                            >
                                {/* Image Section */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 shadow-lg">
                                        <span className="font-bold text-primary text-sm">S/ {product.price}</span>
                                    </div>
                                    {product.status === 'SOLD' && (
                                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                            <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-2xl border-2 border-red-400 transform rotate-[-15deg]">
                                                VENDIDO
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#111] to-transparent opacity-60"></div>
                                </div>

                                {/* Content Section (Below Image) */}
                                <div className="p-4 flex flex-col flex-1 relative">
                                    {/* Seller Info */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                            {product.seller?.avatar ? <img src={product.seller.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">{product.seller?.name?.[0]}</div>}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium truncate">{product.seller?.name || 'Vendedor'}</span>
                                    </div>

                                    <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">{product.title}</h3>

                                    <div className="mt-auto pt-4 flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openMessageModal(product); }}
                                            className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2 rounded-lg hover:bg-white hover:text-black transition flex items-center justify-center gap-2 text-sm font-bold group/btn"
                                            title="Chat con vendedor"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            <span className="hidden sm:inline">Chat</span>
                                        </button>
                                        {product.status === 'SOLD' ? (
                                            <div className="flex-1 bg-red-500/20 border-2 border-red-500 text-red-400 py-2 rounded-lg flex items-center justify-center text-sm font-bold">
                                                VENDIDO
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openCheckoutPage(product); }}
                                                className="flex-1 bg-primary text-black py-2 rounded-lg hover:bg-emerald-400 transition shadow-[0_0_10px_rgba(6,214,160,0.2)] text-sm font-bold"
                                            >
                                                Comprar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {((viewMode === 'offers' && offers.length === 0) || (viewMode === 'products' && products.length === 0)) && (
                    <div className="text-center py-32">
                        <div className="inline-block p-8 rounded-full bg-white/5 mb-6 animate-pulse">
                            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">No encontramos resultados</h3>
                        <p className="text-gray-400 text-lg">Intenta cambiar los filtros o busca con otros términos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
