import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutModal = ({ isOpen, onClose, onPaymentSuccess, amount }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    // Helper for formatting
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(val.substring(0, 19));
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
        setExpiry(val.substring(0, 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        // Simulation
        setTimeout(() => {
            if (cardNumber.replace(/\s/g, '').endsWith('4242')) {
                setSuccess(true);
                setTimeout(() => {
                    onPaymentSuccess({ cardNumber, amount });
                    setProcessing(false);
                    setSuccess(false);
                    setCardNumber('');
                    setExpiry('');
                    setCvv('');
                }, 1500);
            } else if (cardNumber.replace(/\s/g, '').endsWith('0000')) {
                setError('Fondos insuficientes');
                setProcessing(false);
            } else {
                setError('Tarjeta rechazada por el banco emisor');
                setProcessing(false);
            }
        }, 2000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Pasarela de Pago Segura
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {!success ? (
                        <div className="p-8">
                            {/* Amount Display */}
                            <div className="flex flex-col items-center justify-center mb-8">
                                <span className="text-gray-400 text-sm uppercase tracking-wide">Total a Pagar</span>
                                <span className="text-4xl font-bold text-white mt-1">S/ {amount}</span>
                            </div>

                            {/* Card Visual (Simplified, Elegant) */}
                            <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-xl border border-white/10 mb-8 flex flex-col justify-between h-40 shadow-inner card-shine relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="flex justify-between items-start z-10">
                                    <div className="w-12 h-8 bg-white/20 rounded backdrop-blur-md"></div>
                                    <span className="text-white/60 font-mono text-sm">CREDIT</span>
                                </div>
                                <div className="z-10">
                                    <div className="text-white font-mono text-xl tracking-widest mb-1">
                                        {cardNumber || '•••• •••• •••• ••••'}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 uppercase">
                                        <span>Titular</span>
                                        <span>Expira</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Número de Tarjeta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono pl-12"
                                            placeholder="0000 0000 0000 0000"
                                            required
                                        />
                                        <svg className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Vencimiento</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={handleExpiryChange}
                                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-center"
                                            placeholder="MM/YY"
                                            required
                                            maxLength={5}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">CVC / CVV</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                                className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-center"
                                                placeholder="123"
                                                required
                                            />
                                            <svg className="w-5 h-5 text-gray-500 absolute right-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary text-black font-bold py-4 rounded-xl mt-6 hover:bg-emerald-400 transition-all shadow-[0_4px_20px_rgba(6,214,160,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </>
                                    ) : 'Confirmar Pago'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary border border-primary/50"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">¡Pago Exitoso!</h3>
                            <p className="text-gray-400 max-w-xs mx-auto">Tu transacción ha sido procesada correctamente. Recibirás un correo con los detalles.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CheckoutModal;
