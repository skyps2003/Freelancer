import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantsModal = ({ isOpen, onClose, offer }) => {
    if (!isOpen || !offer) return null;

    const applicants = offer.applicants || [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-start z-10">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">Postulantes</h2>
                            <p className="text-gray-400 text-sm">{offer.title}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-white/10 px-3 py-1 rounded-full">
                                    {applicants.length} {applicants.length === 1 ? 'Postulante' : 'Postulantes'}
                                </span>
                                <div className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-lg text-sm font-bold">
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
                    <div className="p-6">
                        {applicants.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sin postulantes aún</h3>
                                <p className="text-gray-400">Nadie ha postulado a esta oferta todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((applicant, index) => (
                                    <motion.div
                                        key={applicant._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-secondary/30 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shrink-0">
                                                <div className="w-full h-full rounded-full bg-[#0f0f0f] overflow-hidden flex items-center justify-center">
                                                    {applicant.user?.avatar ? (
                                                        <img src={applicant.user.avatar} alt={applicant.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold text-primary">
                                                            {applicant.user?.name?.[0] || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white group-hover:text-secondary transition">
                                                            {applicant.user?.name || 'Usuario'}
                                                        </h4>
                                                        <p className="text-sm text-gray-400">{applicant.user?.email || 'Sin email'}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {new Date(applicant.date).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Bio */}
                                                {applicant.user?.bio && (
                                                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                                        {applicant.user.bio}
                                                    </p>
                                                )}

                                                {/* Message */}
                                                {applicant.message && (
                                                    <div className="bg-white/5 border border-white/5 rounded-lg p-3 mt-3">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mensaje</p>
                                                        <p className="text-sm text-gray-300">{applicant.message}</p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2 mt-4">
                                                    <a
                                                        href={`mailto:${applicant.user?.email}`}
                                                        className="flex-1 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-black transition text-sm font-bold text-center"
                                                    >
                                                        Contactar
                                                    </a>
                                                    <button className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-bold">
                                                        Ver Perfil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplicantsModal;
