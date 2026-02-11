import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const FreelancerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [proposal, setProposal] = useState({ price: '', cover_letter: '' });
    const [notification, setNotification] = useState(null);

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchFeed();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFeed = async () => {
        try {
            const res = await api.get('/projects/feed');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplyClick = (project) => {
        setSelectedProject(project);
        setProposal({ price: '', cover_letter: '' });
        setIsApplyModalOpen(true);
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/proposals', {
                project_id: selectedProject._id,
                price: proposal.price,
                cover_letter: proposal.cover_letter
            });
            setIsApplyModalOpen(false);
            setNotification({ type: 'success', message: '¡Propuesta enviada con éxito!' });
            setTimeout(() => setNotification(null), 3000);
            fetchFeed(); // Refresh feed? Maybe not needed unless we filter out applied.
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.msg || 'Error al enviar propuesta' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Muro de Oportunidades</h1>
                        <p className="text-gray-400 mt-1">Encuentra tu próximo gran proyecto</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-gray-400 hidden md:block">Hola, {user?.name}</span>
                        <button onClick={logout} className="bg-alert/10 text-alert border border-alert/30 px-4 py-2 rounded-lg font-bold hover:bg-alert hover:text-white transition-all">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 font-bold backdrop-blur-md border ${notification.type === 'success' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-alert/20 text-alert border-alert/50'
                                }`}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Inbox / Notifications */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        📬 Bandeja de Entrada
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="bg-alert text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                {notifications.filter(n => !n.read).length} nuevos
                            </span>
                        )}
                    </h2>

                    {notifications.length > 0 ? (
                        <div className="grid gap-4">
                            {notifications.map(note => (
                                <motion.div
                                    key={note._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${note.read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-gray-800 border-primary/30 shadow-lg shadow-primary/5'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${note.type === 'SALE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {note.type === 'SALE' ? '💰' : '💬'}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{note.message}</p>
                                            <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {!note.read && (
                                        <button
                                            onClick={() => markAsRead(note._id)}
                                            className="text-xs text-primary hover:text-white border border-primary/30 hover:bg-primary/20 px-3 py-1 rounded-full transition"
                                        >
                                            Marcar leíó
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/5">
                            <p className="text-gray-400">No tienes notificaciones nuevas.</p>
                        </div>
                    )}
                </div>

                {/* Project Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <motion.div
                            key={project._id}
                            whileHover={{ y: -5 }}
                            className="glass p-6 rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition duration-300"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white line-clamp-2 group-hover:text-primary transition">{project.title}</h2>
                                    <span className="bg-warning text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                                        {project.status === 'PENDIENTE' ? 'NUEVO' : 'ACTIVO'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{project.description}</p>

                                <div className="flex justify-between items-center text-sm text-gray-300 mb-6 bg-black/20 p-3 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Presupuesto</span>
                                        <span className="font-bold text-primary">${project.budget_max}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500">Deadline</span>
                                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleApplyClick(project)}
                                className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-primary hover:text-main hover:border-transparent transition-all duration-300"
                            >
                                Postular Ahora
                            </button>
                        </motion.div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <div className="text-6xl mb-4 text-gray-700">📭</div>
                            <h3 className="text-xl text-gray-400">No hay proyectos disponibles en este momento.</h3>
                            <p className="text-gray-600">Vuelve a intentar más tarde.</p>
                        </div>
                    )}
                </div>

                {/* Apply Modal */}
                <AnimatePresence>
                    {isApplyModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-card p-8 w-full max-w-md relative"
                            >
                                <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition">&times;</button>
                                <h2 className="text-2xl font-bold mb-1 text-white">Tu Oferta</h2>
                                <p className="text-sm text-gray-400 mb-6">Para: <span className="text-primary font-bold">{selectedProject?.title}</span></p>

                                <form onSubmit={handleApplySubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1 ml-1">Tu Precio ($)</label>
                                        <input
                                            type="number"
                                            className="input-field text-xl font-bold text-primary"
                                            placeholder={`Máximo: ${selectedProject?.budget_max}`}
                                            value={proposal.price}
                                            onChange={e => setProposal({ ...proposal, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1 ml-1">Carta de Presentación</label>
                                        <textarea
                                            className="input-field resize-none h-32"
                                            placeholder="Cuéntale al cliente por qué eres el indicado..."
                                            value={proposal.cover_letter}
                                            onChange={e => setProposal({ ...proposal, cover_letter: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full mt-2">
                                        Enviar Propuesta
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

export default FreelancerDashboard;
