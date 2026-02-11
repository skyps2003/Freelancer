import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import CheckoutModal from '../components/CheckoutModal';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', budget_max: '', deadline: '' });

    // Payment State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [selectedProjectForPayment, setSelectedProjectForPayment] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects/my-projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setIsModalOpen(false);
            setNewProject({ title: '', description: '', budget_max: '', deadline: '' });
            fetchProjects();
        } catch (err) {
            alert('Error creating project');
        }
    };

    const handleAcceptProposal = (project, proposal) => {
        setSelectedProjectForPayment(project);
        setSelectedProposal(proposal);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async ({ cardNumber, cvv }) => {
        try {
            // 1. Process Payment (Mock API Call)
            await api.post('/payments/checkout', {
                projectId: selectedProjectForPayment._id,
                amount: selectedProposal.price,
                cardNumber,
                cvv
            });

            // 2. Assign Project
            await api.patch(`/projects/${selectedProjectForPayment._id}/assign`, {
                proposalId: selectedProposal._id
            });

            setPaymentModalOpen(false);
            fetchProjects(); // Refresh UI
            alert('Proposal Accepted & Paid!');
        } catch (err) {
            alert(err.response?.data?.msg || 'Payment Failed');
            setPaymentModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Panel de Empresa</h1>
                        <p className="text-gray-400 mt-1">Gestiona tus proyectos y contrata talento</p>
                    </div>
                    <div className="flex gap-4 items-center bg-black/20 p-2 rounded-xl backdrop-blur-sm">
                        <div className="px-4">
                            <div className="text-xs text-gray-400">Bienvenido</div>
                            <div className="font-bold text-white">{user?.name}</div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="bg-alert/10 text-alert border border-alert/30 px-4 py-2 rounded-lg font-bold hover:bg-alert hover:text-white transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary mb-10 flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Publicar Necesidad
                </button>

                <div className="grid gap-8">
                    {projects.map(project => (
                        <div key={project._id} className="glass p-6 md:p-8 rounded-2xl transition hover:border-primary/30">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${project.status === 'PENDIENTE' ? 'bg-warning text-black' :
                                                project.status === 'ASIGNADO' ? 'bg-primary text-main' :
                                                    project.status === 'FINALIZADO' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{project.description}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="text-3xl font-bold text-primary">${project.budget_max}</div>
                                    <div className="text-sm text-gray-400">Presupuesto Máximo</div>
                                    <div className="text-xs text-gray-500 mt-2 bg-black/20 px-3 py-1 rounded-full">
                                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Proposals Section */}
                            <div className="mt-8 border-t border-white/5 pt-6">
                                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                                    Ofertas Recibidas
                                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{project.proposals?.length || 0}</span>
                                </h3>

                                {project.proposals && project.proposals.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {project.proposals.map(prop => (
                                            <div key={prop._id} className="bg-black/20 p-5 rounded-xl border border-white/5 hover:border-primary/30 transition relative overflow-hidden group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-2xl text-white">${prop.price}</div>
                                                    {prop.status === 'ACEPTADA' && <span className="bg-primary text-main text-xs font-bold px-2 py-1 rounded">ACEPTADA</span>}
                                                </div>
                                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">{prop.freelancer_id?.name || 'Freelancer'}</div>
                                                <p className="text-gray-300 text-sm italic mb-4 line-clamp-3">"{prop.cover_letter}"</p>

                                                {project.status === 'PENDIENTE' || project.status === 'EN_LICITACION' ? (
                                                    <button
                                                        onClick={() => handleAcceptProposal(project, prop)}
                                                        className="w-full py-2 rounded-lg border border-primary text-primary font-bold hover:bg-primary hover:text-main transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                                    >
                                                        Aceptar Oferta
                                                    </button>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-black/10 rounded-xl border border-dashed border-gray-700">
                                        Aún no hay ofertas para este proyecto.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Project Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="glass-card p-8 w-full max-w-lg relative animate-fade-in-up">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition">&times;</button>
                            <h2 className="text-3xl font-bold mb-6 text-white">Publicar Proyecto</h2>
                            <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
                                <input className="input-field text-lg font-bold" placeholder="Título del Proyecto" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} required />
                                <textarea className="input-field resize-none" placeholder="Describe detalladamente lo que necesitas..." rows="4" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Presupuesto Máximo ($)</label>
                                        <input type="number" className="input-field" placeholder="0.00" value={newProject.budget_max} onChange={e => setNewProject({ ...newProject, budget_max: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Fecha Límite</label>
                                        <input type="date" className="input-field" value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} required />
                                    </div>
                                </div>
                                <button className="btn-primary mt-4 w-full">Publicar Ahora</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                <CheckoutModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    amount={selectedProposal?.price}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            </div>
        </div>
    );
};

export default CompanyDashboard;
