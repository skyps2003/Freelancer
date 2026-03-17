import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ApplicantsModal = ({ isOpen, onClose, offer }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // New States for Contract Form
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [contractForm, setContractForm] = useState({
        deadline: '',
        milestones: [
            { title: 'Avance del 50%', description: 'Primera mitad del trabajo', percentage: 50 },
            { title: 'Entrega Final', description: 'Entrega final y revisión', percentage: 50 }
        ]
    });

    if (!isOpen || !offer) return null;

    const handleAcceptApplicantClick = (applicant) => {
        setSelectedApplicant(applicant);
        
        // Default deadline to 1 month from now or offer deadline
        const defaultDeadline = offer.deadline ? new Date(offer.deadline) : new Date(new Date().setMonth(new Date().getMonth() + 1));
        setContractForm(prev => ({
            ...prev,
            deadline: defaultDeadline.toISOString().split('T')[0]
        }));
    };

    const handleAddMilestone = () => {
        setContractForm(prev => ({
            ...prev,
            milestones: [...prev.milestones, { title: '', description: '', percentage: 0 }]
        }));
    };

    const handleRemoveMilestone = (index) => {
        setContractForm(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };

    const handleMilestoneChange = (index, field, value) => {
        const newMilestones = [...contractForm.milestones];
        newMilestones[index][field] = value;
        setContractForm(prev => ({ ...prev, milestones: newMilestones }));
    };

    const handleSendProposal = async (e) => {
        e.preventDefault();
        
        // Validate percentages
        const totalPercentage = contractForm.milestones.reduce((sum, m) => sum + Number(m.percentage), 0);
        if (totalPercentage !== 100) {
            alert(`Los porcentajes deben sumar 100%. Actualmente suman: ${totalPercentage}%`);
            return;
        }

        try {
            setLoading(true);
            const applicantId = selectedApplicant.user._id || selectedApplicant.user;
            const res = await api.post(`/offers/${offer._id}/accept/${applicantId}`, {
                milestones: contractForm.milestones,
                deadline: contractForm.deadline
            });
            
            // Navigate to the newly created contract tracker
            navigate(`/contracts/${res.data.contractId}`);
            onClose();
        } catch (err) {
            console.error('Error sending proposal:', err);
            alert(err.response?.data?.msg || 'Error al enviar la propuesta');
        } finally {
            setLoading(false);
        }
    };

    const closeAndReset = () => {
        setSelectedApplicant(null);
        onClose();
    };

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
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {selectedApplicant ? 'Configurar Contrato' : 'Postulantes'}
                            </h2>
                            <p className="text-gray-400 text-sm">{offer.title}</p>
                            {!selectedApplicant && (
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-white/10 px-3 py-1 rounded-full">
                                        {applicants.length} {applicants.length === 1 ? 'Postulante' : 'Postulantes'}
                                    </span>
                                    <div className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-lg text-sm font-bold">
                                        S/ {offer.budget}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={selectedApplicant ? () => setSelectedApplicant(null) : closeAndReset}
                            className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-full"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {selectedApplicant ? (
                            // CONTRACT FORM VIEW
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="mb-6 flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                                       {selectedApplicant.user?.avatar ? (
                                            <img src={selectedApplicant.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-xl">
                                                {selectedApplicant.user?.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Propuesta para:</p>
                                        <p className="text-white font-bold">{selectedApplicant.user?.name}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-sm text-gray-400">Presupuesto (S/)</p>
                                        <p className="text-secondary font-bold text-xl">{offer.budget}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSendProposal} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Límite del Proyecto</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full md:w-1/2 bg-[#0f0f0f] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-secondary outline-none transition"
                                            value={contractForm.deadline}
                                            onChange={(e) => setContractForm({...contractForm, deadline: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-300">Hitos de Pago (Milestones)</label>
                                            <button 
                                                type="button" 
                                                onClick={handleAddMilestone}
                                                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
                                            >
                                                + Añadir Hito
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {contractForm.milestones.map((milestone, index) => {
                                                const amount = Math.round((milestone.percentage / 100) * offer.budget) || 0;
                                                return (
                                                    <div key={index} className="bg-[#1a1a1a] border border-white/5 p-4 rounded-xl relative group">
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveMilestone(index)}
                                                                className="text-alert bg-alert/10 hover:bg-alert/20 p-1 rounded-md"
                                                                disabled={contractForm.milestones.length === 1}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                            <div className="md:col-span-5">
                                                                <label className="text-xs text-gray-500 mb-1 block">Nombre del Hito</label>
                                                                <input 
                                                                    type="text" required
                                                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-secondary"
                                                                    placeholder="Ej: Diseño Inicial"
                                                                    value={milestone.title}
                                                                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-4">
                                                                <label className="text-xs text-gray-500 mb-1 block">Porcentaje (%)</label>
                                                                <input 
                                                                    type="number" min="1" max="100" required
                                                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-secondary"
                                                                    value={milestone.percentage}
                                                                    onChange={(e) => handleMilestoneChange(index, 'percentage', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-3 flex flex-col justify-end pb-2">
                                                                <span className="text-secondary font-bold text-right pt-[20px]">S/ {amount}</span>
                                                            </div>
                                                            <div className="md:col-span-12">
                                                                <label className="text-xs text-gray-500 mb-1 block">Descripción (Opcional)</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-gray-300 text-sm outline-none focus:border-secondary transition"
                                                                    placeholder="Detalles sobre entregables de este hito..."
                                                                    value={milestone.description}
                                                                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="mt-4 flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/10">
                                            <span className="text-gray-400 text-sm">Total Porcentaje:</span>
                                            <span className={`font-bold text-lg ${contractForm.milestones.reduce((s, m) => s + Number(m.percentage), 0) === 100 ? 'text-secondary' : 'text-alert'}`}>
                                                {contractForm.milestones.reduce((s, m) => s + Number(m.percentage), 0)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedApplicant(null)}
                                            className="px-6 py-3 rounded-lg text-white font-bold bg-white/5 hover:bg-white/10 transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-6 py-3 rounded-lg text-[#0f0f0f] font-bold bg-secondary hover:bg-white transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? 'Enviando...' : 'Enviar Propuesta al Freelancer'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : applicants.length === 0 ? (
                            // EMPTY LIST VIEW
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
                            // APPLICANTS LIST VIEW
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
                                                <div className="flex gap-2 mt-4 flex-wrap">
                                                    <a
                                                        href={`mailto:${applicant.user?.email}`}
                                                        className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-bold text-center"
                                                    >
                                                        Email
                                                    </a>
                                                    {applicant.cvUrl && (
                                                        <a 
                                                            href={`${api.defaults.baseURL.replace('/api', '')}${applicant.cvUrl}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-bold text-center"
                                                        >
                                                            Ver CV
                                                        </a>
                                                    )}
                                                    <button 
                                                        onClick={() => handleAcceptApplicantClick(applicant)}
                                                        className="w-full mt-2 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-3 rounded-lg hover:bg-secondary hover:text-black transition text-sm font-bold disabled:opacity-50"
                                                    >
                                                        Aceptar y Crear Contrato
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
