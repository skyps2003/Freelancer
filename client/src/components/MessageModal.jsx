import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const MessageModal = ({ isOpen, onClose, receiverId, productId, productName }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post('/messages', {
                receiver: receiverId,
                product: productId,
                content: message
            });
            setSuccess(true);
            setTimeout(() => {
                setSending(false);
                setSuccess(false);
                setMessage('');
                onClose();
            }, 1500);
        } catch (err) {
            console.error(err);
            setSending(false);
            alert('Error al enviar mensaje');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">&times;</button>

                {!success ? (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2">Contactar Vendedor</h3>
                        <p className="text-sm text-gray-400 mb-6">Sobre: <span className="text-primary font-bold">{productName}</span></p>

                        <form onSubmit={handleSend}>
                            <textarea
                                className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none mb-4"
                                placeholder="Escribe tu mensaje aquí..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${sending ? 'bg-gray-700 text-gray-400' : 'bg-primary text-black hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(6,214,160,0.4)]'}`}
                            >
                                {sending ? 'Enviando...' : 'Enviar Mensaje'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-white">¡Mensaje Enviado!</h3>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MessageModal;
