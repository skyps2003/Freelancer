import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;

    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [expiry, setExpiry] = useState('');
    const [holder, setHolder] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 bg-[url('/img/pattern.svg')] bg-fixed">
                <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
                <p className="text-gray-400 mb-8">Parece que no has seleccionado ningún producto.</p>
                <button onClick={() => navigate('/')} className="bg-primary text-black px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition">
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleCardChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 16) {
            setCardNumber(formatCardNumber(val));
        }
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 4) val = val.substring(0, 4);
        if (val.length >= 2) {
            setExpiry(val.substring(0, 2) + '/' + val.substring(2));
        } else {
            setExpiry(val);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            const totalAmount = Number(product.price) + (product.type === 'Fisico' ? Number(product.shippingCost || 0) : 0);

            const res = await api.post('/payments/checkout/product', {
                productId: product._id,
                amount: totalAmount,
                cardNumber
            });

            if (res.data.status === 'APPROVED') {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError('Error al procesar el pago. Inténtalo de nuevo.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6 bg-[url('/img/pattern.svg')] bg-fixed">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition group"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Seguir comprando
                </button>

                <h1 className="text-4xl font-bold mb-10 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Finalizar Compra</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Product Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden"
                    >
                        {/* Decoration */}
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px]"></div>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            Resumen del Pedido
                            <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-gray-400 font-normal">1 Artículo</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-white/10">
                            <div className="w-full sm:w-40 h-40 bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-white/5 mx-auto sm:mx-0">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                                <div className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-lg font-mono font-bold">
                                    S/ {product.price}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>S/ {product.price}</span>
                            </div>
                            {product.type === 'Fisico' && (
                                <div className="flex justify-between text-gray-400">
                                    <span>Envío</span>
                                    <span>S/ {product.shippingCost || 0}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-400">
                                <span>Comisión de servicio</span>
                                <span>S/ 0.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
                                <span>Total a Pagar</span>
                                <span className="text-primary">
                                    S/ {Number(product.price) + (product.type === 'Fisico' ? Number(product.shippingCost || 0) : 0)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
                            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <p className="text-sm text-yellow-200/80">Transacción protegida con encriptación de extremo a extremo.</p>
                        </div>
                    </motion.div>

                    {/* Right: Payment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative"
                    >
                        {/* Credit Card Preview */}
                        <div className="mb-8 perspective-1000">
                            <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden h-56 flex flex-col justify-between transform transition hover:scale-[1.02] duration-300">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                                <div className="flex justify-between items-start z-10">
                                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                                        <div className="w-8 h-5 border border-white/30 rounded bg-yellow-500/20"></div>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">CREDIT</span>
                                </div>

                                <div className="z-10">
                                    <p className="font-mono text-2xl tracking-widest text-shadow">{cardNumber || '•••• •••• •••• ••••'}</p>
                                </div>

                                <div className="flex justify-between items-end z-10">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Titular</p>
                                        <p className="font-mono text-sm uppercase tracking-wide">{holder || 'NOMBRE APELLIDO'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Expira</p>
                                        <p className="font-mono text-sm">{expiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!success ? (
                            <form onSubmit={handlePayment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Número de Tarjeta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono transition"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={handleCardChange}
                                            maxLength={19}
                                            required
                                        />
                                        <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Titular de la Tarjeta</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition uppercase"
                                        placeholder="Como aparece en la tarjeta"
                                        value={holder}
                                        onChange={(e) => setHolder(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Vencimiento</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono transition"
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={handleExpiryChange}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">CVV</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono transition"
                                                placeholder="123"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').substring(0, 3))}
                                                maxLength={3}
                                                required
                                            />
                                            <svg className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 animate-bounce">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(6,214,160,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99] flex justify-center items-center gap-2 text-lg"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar Pago • S/ {Number(product.price) + (product.type === 'Fisico' ? Number(product.shippingCost || 0) : 0)}
                                        </>
                                    )}
                                </button>

                                <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" className="h-6 object-contain" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6 object-contain" alt="PayPal" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 object-contain" alt="Mastercard" />
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                    <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">¡Pago Exitoso!</h2>
                                <p className="text-gray-400 mb-8">Tu pedido ha sido confirmado. Redirigiendo...</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
