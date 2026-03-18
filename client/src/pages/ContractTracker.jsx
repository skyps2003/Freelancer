import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const ContractTracker = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [contractData, setContractData] = useState(null);
    const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [deliverableForm, setDeliverableForm] = useState({ fileUrl: '', link: '', comment: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchContractDetails();
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            const res = await api.get(`/contracts/${id}`);
            setContractData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setNotification({ type: 'error', message: 'Error cargando el contrato' });
            setLoading(false);
        }
    };

    const handleDeliverSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/contracts/milestone/${selectedMilestone._id}/deliver`, deliverableForm);
            setIsDeliverModalOpen(false);
            setNotification({ type: 'success', message: 'Entregable enviado con éxito' });
            setTimeout(() => setNotification(null), 3000);
            fetchContractDetails(); // Refresh
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.message || 'Error al enviar entregable' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/contracts/milestone/${selectedMilestone._id}/review`, { status: 'REJECTED', comment: rejectReason || 'Necesita revisiones.' });
            setIsRejectModalOpen(false);
            setNotification({ type: 'success', message: 'Hito Rechazado' });
            setTimeout(() => setNotification(null), 3000);
            fetchContractDetails();
        } catch (err) {
            setNotification({ type: 'error', message: 'Error al rechazar el hito' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleReview = async (milestoneId, status, comment) => {
        try {
            await api.put(`/contracts/milestone/${milestoneId}/review`, { status, comment });
            setNotification({ type: 'success', message: `Hito ${status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}` });
            setTimeout(() => setNotification(null), 3000);
            fetchContractDetails();
        } catch (err) {
            setNotification({ type: 'error', message: 'Error al revisar el hito' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleAcceptContract = async () => {
        try {
            await api.put(`/contracts/${id}/accept`);
            setNotification({ type: 'success', message: '¡Contrato aceptado exitosamente!' });
            setTimeout(() => setNotification(null), 3000);
            fetchContractDetails();
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.message || 'Error al aceptar el contrato' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleRejectContract = async () => {
        try {
            const reason = prompt('Por favor, indica un motivo de rechazo:');
            if (reason === null) return; // User cancelled
            await api.put(`/contracts/${id}/reject`, { reason });
            setNotification({ type: 'success', message: 'Contrato rechazado.' });
            setTimeout(() => setNotification(null), 3000);
            fetchContractDetails();
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.message || 'Error al rechazar el contrato' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (loading) {
        return <div className="min-h-screen p-8 text-white text-center">Cargando...</div>;
    }

    if (!contractData || !contractData.contract) {
        return <div className="min-h-screen p-8 text-white text-center">Contrato no encontrado</div>;
    }

    const { contract, milestones, deliverables, activities } = contractData;

    // Calculate progress based on approved milestones
    const completedMilestones = milestones.filter(m => m.status === 'APPROVED').length;
    const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

    const isClient = (user?._id || user?.id) === (contract.company?._id || contract.company);
    const isFreelancer = (user?._id || user?.id) === (contract.freelancer?._id || contract.freelancer);

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <button onClick={() => navigate(-1)} className="group flex items-center text-gray-500 mb-8 hover:text-white transition-colors">
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver
                </button>

                {/* Pendient Banner for Freelancer */}
                {contract.status === 'PENDING' && isFreelancer && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }}
                        className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-l-4 border-emerald-500 rounded-r-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-emerald-400 mb-2 flex items-center gap-3">
                                <span></span> ¡Tienes un nuevo contrato propuesto!
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                La empresa ha definido los hitos y plazos de entrega a continuación. Por favor, revisa detalladamente cada hito y <strong>acepta el contrato</strong> para oficializar el proyecto y empezar a trabajar de inmediato.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto relative z-10">
                            <button onClick={handleAcceptContract} className="flex-1 sm:flex-none bg-emerald-500 text-black px-8 py-3 rounded-xl font-black hover:bg-emerald-400 transition-all shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Aceptar y Cerrar Trato
                            </button>
                            <button onClick={handleRejectContract} className="flex-1 sm:flex-none bg-[#1A1A1A] text-gray-400 border border-white/5 px-8 py-3 rounded-xl font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">
                                Rechazar Contrato
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Pendient Banner for Company */}
                {contract.status === 'PENDING' && isClient && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#151515] border border-white/5 shadow-sm rounded-2xl p-5 mb-10 text-center flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-gray-400">Esperando a que el Freelancer revise y acepte el contrato...</span>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151515] p-6 md:p-10 rounded-3xl border border-white/5 shadow-lg mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{contract.title}</h1>
                        <span className={`px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${(contract.status === 'COMPLETED' || progress === 100) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            contract.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                contract.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {(contract.status === 'COMPLETED' || progress === 100) ? 'COMPLETADO' : contract.status === 'PENDING' ? 'PENDIENTE' : contract.status === 'ACTIVE' ? 'ACTIVO' : 'CANCELADO'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#0E0E0E] p-6 rounded-2xl border border-white/5 relative z-10 mt-8 shadow-inner">
                        <div className="space-y-1">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Empresa Cliente</span>
                            <span className="text-gray-200 font-bold text-lg">{contract.company?.name || 'N/A'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Freelancer a Cargo</span>
                            <span className="text-gray-200 font-bold text-lg">{contract.freelancer?.name || 'N/A'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Presupuesto Total</span>
                            <span className="text-emerald-400 font-black text-2xl">S/ {contract.totalAmount.toLocaleString('en-US')}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Fecha Límite Final</span>
                            <span className="text-gray-200 font-bold text-lg">{new Date(contract.deadline).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-12 bg-[#151515] p-6 rounded-3xl border border-white/5 shadow-md relative overflow-hidden">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h3 className="text-white font-bold text-xl">Progreso del Proyecto</h3>
                            <p className="text-gray-400 text-sm mt-1">{completedMilestones} de {milestones.length} hitos completados</p>
                        </div>
                        <span className="text-emerald-400 font-black text-4xl">{progress}%</span>
                    </div>
                    <div className="h-6 w-full bg-[#0E0E0E] rounded-full overflow-hidden shadow-inner border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', type: "spring", stiffness: 50 }}
                            className="h-full bg-emerald-500 rounded-full relative"
                        >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                        </motion.div>
                    </div>
                </div>

                <div>
                    {/* Milestones Section - Full Width */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-black text-white tracking-tight">Hitos de Entrega</h2>
                        </div>
                        {milestones.length === 0 ? <p className="text-gray-500 italic bg-[#151515] p-6 rounded-2xl shadow-sm text-center border border-white/5">No se han definido hitos.</p> : null}

                        {milestones.map((milestone, idx) => {
                            const isPendingOrInProgressOrRejected = milestone.status === 'PENDING' || milestone.status === 'IN_PROGRESS' || milestone.status === 'REJECTED';
                            const isReview = milestone.status === 'REVIEW';

                            // Find any deliverables for this milestone
                            const milestoneDeliverables = deliverables.filter(d => d.milestone === milestone._id);

                            return (
                                <motion.div
                                    key={milestone._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.15, type: 'spring', stiffness: 100 }}
                                    className={`bg-[#151515] border rounded-[2rem] p-6 md:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl shadow-sm ${milestone.status === 'APPROVED' ? 'border-emerald-500/30' :
                                        milestone.status === 'REVIEW' ? 'border-yellow-500/30' :
                                            'border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    {milestone.status === 'APPROVED' && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-emerald-500/10"></div>}

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${milestone.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                milestone.status === 'REVIEW' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-[#1A1A1A] text-gray-500 border border-white/5'
                                                }`}>
                                                {milestone.status === 'APPROVED' ? '✓' : idx + 1}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-200 group-hover:text-emerald-400 transition-colors">{milestone.title}</h3>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-1.5 ml-16 md:ml-0">
                                            <span className="text-3xl font-black text-gray-100">S/ {milestone.amount.toLocaleString('en-US')}</span>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold tracking-widest uppercase border inline-flex items-center justify-center ${milestone.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                milestone.status === 'REVIEW' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                                                    milestone.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-[#1A1A1A] text-gray-500 border-white/5'
                                                }`}>
                                                {milestone.status === 'APPROVED' ? 'APROBADO' : milestone.status === 'PENDING' ? 'PENDIENTE' : milestone.status === 'REVIEW' ? 'EN REVISIÓN' : milestone.status === 'REJECTED' ? 'RECHAZADO' : milestone.status}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 mb-6 leading-relaxed ml-16 text-sm relative z-10">{milestone.description}</p>

                                    {/* Deliverables Section for this milestone */}
                                    {milestoneDeliverables.length > 0 && (
                                        <div className="ml-16 mt-6 bg-[#0E0E0E] rounded-2xl border border-white/5 p-5 relative z-10 shadow-inner">
                                            <h4 className="text-gray-300 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                Archivos Entregados:
                                            </h4>
                                            <div className="space-y-4">
                                                {milestoneDeliverables.map(del => (
                                                    <div key={del._id} className="bg-[#151515] rounded-xl p-4 border border-white/5 transition shadow-sm hover:shadow-md">
                                                        <p className="mb-2 text-sm text-gray-300 italic">"{del.comment}"</p>
                                                        {del.link && (
                                                            <a href={del.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-[#0E0E0E] transition-colors">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                Abrir Enlace
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-8 ml-16 flex flex-wrap gap-4 relative z-10">
                                        {isFreelancer && isPendingOrInProgressOrRejected && contract.status !== 'PENDING' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedMilestone(milestone);
                                                    setDeliverableForm({ fileUrl: '', link: '', comment: '' });
                                                    setIsDeliverModalOpen(true);
                                                }}
                                                className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                Subir Trabajo / Entregable
                                            </button>
                                        )}
                                        {isClient && isReview && (
                                            <>
                                                <button
                                                    onClick={() => handleReview(milestone._id, 'APPROVED', 'Excelente trabajo.')}
                                                    className="bg-emerald-500 text-black shadow-md hover:shadow-emerald-500/20 hover:bg-emerald-400 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Aprobar y Liberar Pago
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedMilestone(milestone);
                                                        setRejectReason('');
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    className="bg-[#1A1A1A] text-red-400 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Solicitar Cambios
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Feed - Full Width Below */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white tracking-tight">Registro General</h2>
                            <span className="bg-white/5 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">{activities.length} eventos</span>
                        </div>
                    </div>

                    {activities.length === 0 ? (
                        <div className="bg-[#151515] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No hay actividad reciente.</p>
                            <p className="text-gray-600 text-xs mt-1">Las acciones del contrato aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {activities.map((act, idx) => {
                                const actionConfig = {
                                    'CREATED_CONTRACT': { icon: 'doc', bg: 'bg-blue-500/10', border: 'border-blue-500/20', color: '#60a5fa', label: 'Contrato creado' },
                                    'CONTRACT_ACCEPTED': { icon: 'check', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: '#34d399', label: 'Contrato aceptado' },
                                    'CONTRACT_REJECTED': { icon: 'x', bg: 'bg-red-500/10', border: 'border-red-500/20', color: '#f87171', label: 'Contrato rechazado' },
                                    'CONTRACT_COMPLETED': { icon: 'trophy', bg: 'bg-amber-500/10', border: 'border-amber-500/20', color: '#fbbf24', label: 'Proyecto completado' },
                                    'SUBMITTED_DELIVERABLE': { icon: 'upload', bg: 'bg-purple-500/10', border: 'border-purple-500/20', color: '#c084fc', label: 'Entregable enviado' },
                                    'MILESTONE_APPROVED': { icon: 'check-circle', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: '#34d399', label: 'Hito aprobado' },
                                    'MILESTONE_REJECTED': { icon: 'refresh', bg: 'bg-orange-500/10', border: 'border-orange-500/20', color: '#fb923c', label: 'Revisión solicitada' },
                                };
                                const config = actionConfig[act.action] || { icon: 'dot', bg: 'bg-white/5', border: 'border-white/10', color: '#9ca3af', label: 'Actividad' };

                                const iconSvg = {
                                    'doc': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                                    'check': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
                                    'x': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
                                    'trophy': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14M9 3v2a4 4 0 004 0V3M7 7a5 5 0 0010 0M12 12v5m-3 4h6" /></svg>,
                                    'upload': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
                                    'check-circle': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                    'refresh': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
                                    'dot': <svg className="w-5 h-5" fill="none" stroke={config.color} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" strokeWidth="2" /></svg>,
                                };

                                return (
                                    <motion.div
                                        key={act._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                                        className="bg-[#151515] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100" style={{backgroundColor: config.color + '10'}}></div>

                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={`w-11 h-11 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                                                {iconSvg[config.icon]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.border} border`} style={{color: config.color}}>
                                                        {config.label}
                                                    </span>
                                                    <time className="text-[10px] text-gray-600 font-medium shrink-0">
                                                        {new Date(act.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </time>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-relaxed">{act.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Submit Deliverable Modal */}
                <AnimatePresence>
                    {isDeliverModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#151515] border border-white/10 p-8 w-full max-w-md relative rounded-2xl shadow-2xl"
                            >
                                <button onClick={() => setIsDeliverModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl transition">&times;</button>
                                <h2 className="text-2xl font-bold mb-1 text-white">Subir Entregable</h2>
                                <p className="text-sm text-gray-400 mb-6">Hito: <span className="text-emerald-400 font-bold">{selectedMilestone?.title}</span></p>

                                <form onSubmit={handleDeliverSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-gray-400 font-medium text-xs mb-1 ml-1">Enlace del Entregable (GitHub, Drive, Demo URL)</label>
                                        <input
                                            type="url"
                                            className="w-full bg-[#0E0E0E] border border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 px-4 py-3 rounded-xl text-white outline-none transition"
                                            placeholder="https://..."
                                            value={deliverableForm.link}
                                            onChange={e => setDeliverableForm({ ...deliverableForm, link: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 font-medium text-xs mb-1 ml-1">Comentario para el cliente</label>
                                        <textarea
                                            className="w-full bg-[#0E0E0E] border border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 px-4 py-3 rounded-xl text-white outline-none transition resize-none h-32"
                                            placeholder="Describe qué has entregado o cualquier nota importante..."
                                            value={deliverableForm.comment}
                                            onChange={e => setDeliverableForm({ ...deliverableForm, comment: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all transform hover:scale-[1.02] shadow-lg">
                                        Enviar Trabajo
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Submit Reject Modal */}
                <AnimatePresence>
                    {isRejectModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#151515] border border-white/10 p-8 w-full max-w-md relative rounded-2xl shadow-2xl"
                            >
                                <button onClick={() => setIsRejectModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl transition">&times;</button>
                                <h2 className="text-2xl font-bold mb-1 text-white">Rechazar Hito</h2>
                                <p className="text-sm text-gray-400 mb-6">Hito: <span className="text-red-400 font-bold">{selectedMilestone?.title}</span></p>

                                <form onSubmit={handleRejectSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-gray-400 font-medium text-xs mb-1 ml-1">Motivo del rechazo</label>
                                        <textarea
                                            className="w-full bg-[#0E0E0E] border border-white/5 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 px-4 py-3 rounded-xl text-white outline-none transition resize-none h-32"
                                            placeholder="Indica los cambios necesarios o el motivo del rechazo..."
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold py-3 rounded-xl hover:bg-red-500/20 transition-all transform hover:scale-[1.02] shadow-lg">
                                        Enviar Motivo de Rechazo
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ContractTracker;
