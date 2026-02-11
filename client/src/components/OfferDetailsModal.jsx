import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OfferDetailsModal = ({ isOpen, onClose, offer, onApply, user }) => {
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [cvError, setCvError] = useState('');
    const navigate = useNavigate();

    if (!isOpen || !offer) return null;

    const handleCVChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                setCvError('Solo se permiten archivos PDF');
                setCvFile(null);
                e.target.value = '';
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5000000) {
                setCvError('El archivo no puede superar los 5MB');
                setCvFile(null);
                e.target.value = '';
                return;
            }
            setCvError('');
            setCvFile(file);
        }
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login?mode=login');
            return;
        }

        setApplying(true);
        await onApply(offer._id, message, cvFile);
        setApplying(false);
        setMessage('');
        setCvFile(null);
        setCvError('');
    };

    const isFreelancer = user?.role === 'FREELANCER';
    const alreadyApplied = offer.applicants?.some(app => app.user === user?._id || app.user?._id === user?._id);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-start z-10">
                        <div className="flex-1 pr-4">
                            <h2 className="text-3xl font-bold text-white mb-2">{offer.title}</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-white/10 px-3 py-1 rounded-full">
                                    {offer.category}
                                </span>
                                <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1 rounded-lg text-lg font-bold">
                                    S/ {offer.budget}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-full"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Employer Info */}
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-lg font-bold border border-white/10 text-gray-300">
                                {offer.employer?.name?.[0] || 'E'}
                            </div>
                            <div>
                                <p className="text-xs text-secondary font-bold uppercase tracking-wide">Empresa</p>
                                <p className="text-white font-bold">{offer.employer?.name}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descripción del Proyecto
                            </h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{offer.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Presupuesto</p>
                                <p className="text-2xl font-bold text-secondary">S/ {offer.budget}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Postulantes</p>
                                <p className="text-2xl font-bold text-white">{offer.applicants?.length || 0}</p>
                            </div>
                            {offer.duration && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duración</p>
                                    <p className="text-sm font-bold text-white">{offer.duration}</p>
                                </div>
                            )}
                            {offer.projectType && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tipo</p>
                                    <p className="text-sm font-bold text-white">{offer.projectType}</p>
                                </div>
                            )}
                            {offer.deadline && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 col-span-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fecha Límite</p>
                                    <p className="text-sm font-bold text-primary">
                                        {new Date(offer.deadline).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Apply Section */}
                        {isFreelancer && (
                            <div className="border-t border-white/10 pt-6">
                                {alreadyApplied ? (
                                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center">
                                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="font-bold">Ya has postulado a esta oferta</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-white">Postular a esta oferta</h3>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Escribe un mensaje para el empleador (opcional)..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none"
                                            rows="4"
                                        />

                                        {/* CV Upload Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Subir CV (PDF - Opcional)
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:border-secondary/30 transition">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <span className="text-sm font-medium">
                                                            {cvFile ? cvFile.name : 'Seleccionar PDF'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,application/pdf"
                                                        onChange={handleCVChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {cvFile && (
                                                    <button
                                                        onClick={() => { setCvFile(null); setCvError(''); }}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                                        title="Eliminar archivo"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            {cvError && (
                                                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {cvError}
                                                </p>
                                            )}
                                            {cvFile && !cvError && (
                                                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    CV seleccionado correctamente
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full bg-secondary text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(6,214,160,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                        >
                                            {applying ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    Enviar Postulación
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!user && (
                            <div className="border-t border-white/10 pt-6">
                                <div className="bg-primary/10 border border-primary/30 text-primary p-4 rounded-xl text-center">
                                    <p className="font-bold mb-3">Inicia sesión para postular</p>
                                    <button
                                        onClick={() => navigate('/login?mode=login')}
                                        className="bg-primary text-black font-bold px-6 py-2 rounded-lg hover:bg-emerald-400 transition"
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OfferDetailsModal;
