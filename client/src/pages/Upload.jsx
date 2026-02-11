import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { motion } from 'framer-motion';

const Upload = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [file, setFile] = useState(null);

    // Form data for Product (Freelancer)
    const [productForm, setProductForm] = useState({
        title: '', description: '', price: '', category: 'Naturaleza', tags: '', type: 'Virtual', shippingCost: ''
    });

    // Form data for Offer (Company)
    const [offerForm, setOfferForm] = useState({
        title: '',
        description: '',
        budget: '',
        category: 'Desarrollo Web',
        deadline: '',
        duration: '1-2 semanas',
        projectType: 'Proyecto Único'
    });

    const categories = ['Naturaleza', 'Tecnología', 'Abstracto', 'Servicios', 'Negocios', 'Arte'];
    const jobCategories = ['Desarrollo Web', 'Diseño Gráfico', 'Marketing', 'Redacción', 'Video', 'Otros'];

    const onProductSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Subiendo archivo...' });

        const data = new FormData();
        data.append('title', productForm.title);
        data.append('description', productForm.description);
        data.append('price', productForm.price);
        data.append('category', productForm.category);
        data.append('tags', productForm.tags.split(',').map(tag => tag.trim()));
        data.append('type', productForm.type);
        if (productForm.type === 'Fisico') {
            data.append('shippingCost', productForm.shippingCost);
        }
        if (file) data.append('image', file);

        try {
            await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setStatus({ type: 'success', msg: '¡Portafolio publicado con éxito!' });
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Error al publicar. Asegúrate de subir una imagen.' });
        }
    };

    const onOfferSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Publicando oferta...' });

        try {
            await api.post('/offers', offerForm);
            setStatus({ type: 'success', msg: '¡Oferta de trabajo publicada!' });
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Error al publicar oferta.' });
        }
    };

    const isCompany = user?.role === 'EMPRESA';

    return (
        <div className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
            {/* Ambient Background Effects - Global Harmony */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-1000 pointer-events-none" />
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 w-full max-w-2xl relative z-10"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        {isCompany ? 'Publicar Oferta de Trabajo' : 'Subir Portafolio'}
                    </h2>
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                {status.msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-6 text-center font-bold ${status.type === 'success' ? 'bg-primary/20 text-primary border border-primary' :
                            status.type === 'error' ? 'bg-alert/20 text-alert border border-alert' : 'bg-gray-800 text-gray-300'
                            }`}
                    >
                        {status.msg}
                    </motion.div>
                )}

                {isCompany ? (
                    // COMPANY FORM
                    <form onSubmit={onOfferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Título del Trabajo</label>
                            <input className="input-field" value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} required placeholder="Ej: Diseñador UI/UX Senior" />
                        </div>

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Presupuesto (S/)</label>
                            <input type="number" className="input-field" value={offerForm.budget} onChange={e => setOfferForm({ ...offerForm, budget: e.target.value })} required placeholder="0.00" />
                        </div>

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Categoría</label>
                            <select className="input-field bg-gray-900" value={offerForm.category} onChange={e => setOfferForm({ ...offerForm, category: e.target.value })}>
                                {jobCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Descripción del Puesto</label>
                            <textarea rows="6" className="input-field resize-none" value={offerForm.description} onChange={e => setOfferForm({ ...offerForm, description: e.target.value })} required placeholder="Describe los requisitos y responsabilidades..." />
                        </div>

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Fecha Límite para Postular</label>
                            <input
                                type="date"
                                className="input-field"
                                value={offerForm.deadline}
                                onChange={e => setOfferForm({ ...offerForm, deadline: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Duración Estimada</label>
                            <select className="input-field bg-gray-900" value={offerForm.duration} onChange={e => setOfferForm({ ...offerForm, duration: e.target.value })}>
                                <option value="1-2 semanas">1-2 semanas</option>
                                <option value="2-4 semanas">2-4 semanas</option>
                                <option value="1-3 meses">1-3 meses</option>
                                <option value="3-6 meses">3-6 meses</option>
                                <option value="Más de 6 meses">Más de 6 meses</option>
                            </select>
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Tipo de Proyecto</label>
                            <select className="input-field bg-gray-900" value={offerForm.projectType} onChange={e => setOfferForm({ ...offerForm, projectType: e.target.value })}>
                                <option value="Proyecto Único">Proyecto Único</option>
                                <option value="Trabajo Continuo">Trabajo Continuo</option>
                                <option value="Contrato Temporal">Contrato Temporal</option>
                            </select>
                        </div>

                        <div className="col-span-full mt-4">
                            <button className="btn-primary w-full" disabled={status.type === 'loading'}>
                                {status.type === 'loading' ? 'Publicando...' : 'Publicar Oferta'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // FREELANCER FORM (Existing)
                    <form onSubmit={onProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Título</label>
                            <input className="input-field" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} required />
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Imagen del Proyecto</label>
                            <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary transition group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <div className="flex flex-col items-center gap-2 group-hover:text-primary transition">
                                    <svg className="w-10 h-10 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span className="text-gray-400 group-hover:text-white font-medium">
                                        {file ? file.name : 'Arrastra una imagen o haz clic aquí'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-2 block">Tipo de Producto</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="Virtual"
                                        checked={productForm.type === 'Virtual'}
                                        onChange={e => setProductForm({ ...productForm, type: e.target.value })}
                                        className="w-4 h-4 text-primary bg-gray-800 border-gray-600 focus:ring-primary focus:ring-2"
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition">Virtual (Digital)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="Fisico"
                                        checked={productForm.type === 'Fisico'}
                                        onChange={e => setProductForm({ ...productForm, type: e.target.value })}
                                        className="w-4 h-4 text-primary bg-gray-800 border-gray-600 focus:ring-primary focus:ring-2"
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition">Físico (Con Envío)</span>
                                </label>
                            </div>
                        </div>

                        {productForm.type === 'Fisico' && (
                            <div className="col-span-full md:col-span-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm text-gray-400 mb-1 block">Costo de Envío (S/)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={productForm.shippingCost}
                                    onChange={e => setProductForm({ ...productForm, shippingCost: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Precio / Tarifa (S/)</label>
                            <input type="number" className="input-field" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                        </div>

                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm text-gray-400 mb-1 block">Categoría</label>
                            <select className="input-field bg-gray-900" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Etiquetas (separadas por coma)</label>
                            <input className="input-field" placeholder="ej: vector, azul, moderno" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} />
                        </div>

                        <div className="col-span-full">
                            <label className="text-sm text-gray-400 mb-1 block">Descripción</label>
                            <textarea rows="4" className="input-field resize-none" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
                        </div>

                        <div className="col-span-full mt-4">
                            <button className="btn-primary w-full" disabled={status.type === 'loading'}>
                                {status.type === 'loading' ? 'Publicando...' : 'Publicar Ahora'}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Upload;
