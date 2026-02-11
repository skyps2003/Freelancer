import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailsModal = ({ isOpen, onClose, product, onChat, onBuy, transaction }) => {
    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-[0_0_50px_rgba(6,214,160,0.1)]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-white text-white hover:text-black p-2 rounded-full transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4 relative">
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                        />
                        {/* Sold Overlay for Image */}
                        {product.status === 'SOLD' && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1 rounded-full font-bold shadow-lg border border-white/20">
                                VENDIDO
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">

                        {/* Transaction / Buyer Details - Only if sold and transaction exists */}
                        {transaction && (
                            <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 animate-fadeIn">
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Detalles de Venta</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                                            {transaction.buyer_id?.avatar ? (
                                                <img src={transaction.buyer_id.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold">{transaction.buyer_id?.name?.[0]}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Vendido a:</div>
                                        <div className="text-white font-bold text-lg">{transaction.buyer_id?.name}</div>
                                        <div className="text-xs text-secondary font-medium">
                                            {new Date(transaction.timestamp).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 border-primary/20">
                                {product.seller?.avatar ? (
                                    <img src={product.seller.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary flex items-center justify-center text-black font-bold text-xl">{product.seller?.name?.[0]}</div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{product.seller?.name || 'Vendedor'}</h4>
                                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Freelancer Verificado</span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{product.title}</h2>
                        <div className="text-4xl font-bold text-primary mb-6">S/ {product.price}</div>

                        <div className="prose prose-invert max-w-none text-gray-300 mb-8 flex-1">
                            <h3 className="text-white text-lg font-bold mb-2">Descripción</h3>
                            <p>{product.description}</p>

                            {/* Fake specs for visual richness */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block">Categoría</span>
                                    <span className="text-white font-medium">{product.category || 'General'}</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block">Entrega</span>
                                    <span className="text-white font-medium">Digital / Inmediata</span>
                                </div>
                            </div>
                        </div>

                        {!transaction && (
                            <div className="flex gap-4 mt-auto">
                                <button
                                    onClick={() => { onClose(); onChat(product); }}
                                    className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white hover:text-black transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    Contactar
                                </button>
                                <button
                                    onClick={() => { onClose(); onBuy(product); }}
                                    disabled={product.status === 'SOLD'}
                                    className={`flex-1 font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 ${product.status === 'SOLD'
                                            ? 'bg-red-500/20 border-2 border-red-500 text-red-400 cursor-not-allowed'
                                            : 'bg-primary text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(6,214,160,0.3)]'
                                        }`}
                                >
                                    {product.status === 'SOLD' ? 'VENDIDO' : 'Comprar Ahora'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductDetailsModal;
