import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Auth = () => {
    const authContext = useContext(AuthContext);
    const { login, register, error, clearErrors, isAuthenticated, user } = authContext;
    const navigate = useNavigate();
    const location = useLocation();

    // Determine initial mode from URL query param
    const queryParams = new URLSearchParams(location.search);
    const initialModeParam = queryParams.get('mode');
    const [isLogin, setIsLogin] = useState(initialModeParam !== 'register');
    const [localError, setLocalError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'FREELANCER'
    });

    const { name, email, password, confirmPassword, role } = formData;

    // Update mode if URL changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setIsLogin(params.get('mode') !== 'register');
        clearErrors();
        setLocalError(null);
    }, [location.search]);

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        setLocalError(null);
        if (isLogin) {
            login({ email, password });
        } else {
            if (password !== confirmPassword) {
                setLocalError('Las contraseñas no coinciden');
                return;
            }
            register({ name, email, password, role });
        }
    };

    const toggleMode = () => {
        const newMode = isLogin ? 'register' : 'login';
        navigate(`?mode=${newMode}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen opacity-50 animate-pulse-slow delay-1000" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-card p-8 md:p-12 w-full max-w-[480px] z-10 relative overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40 rounded-2xl"
            >
                {/* Decoration Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-secondary" />

                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                        Lumina<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Market</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-light">
                        {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                {(error || localError) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-alert/10 border border-alert/30 text-alert p-4 rounded-xl mb-8 text-sm text-center font-semibold shadow-inner"
                    >
                        {error || localError}
                    </motion.div>
                )}

                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5 overflow-hidden"
                        >
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                placeholder="Nombre completo"
                                className="input-field bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 w-full p-4 rounded-xl text-white outline-none placeholder-gray-500"
                                required
                            />

                            <div className="flex gap-3 p-1 bg-black/40 rounded-xl border border-white/5">
                                <label className={`flex-1 py-3 text-center cursor-pointer rounded-lg transition-all duration-300 relative overflow-hidden ${role === 'EMPRESA' ? 'text-main font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                    {role === 'EMPRESA' && <motion.div layoutId="roleBg" className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400" />}
                                    <input type="radio" name="role" value="EMPRESA" checked={role === 'EMPRESA'} onChange={onChange} className="hidden" />
                                    <span className="relative z-10 text-sm font-bold">Empresa</span>
                                </label>
                                <label className={`flex-1 py-3 text-center cursor-pointer rounded-lg transition-all duration-300 relative overflow-hidden ${role === 'FREELANCER' ? 'text-main font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                    {role === 'FREELANCER' && <motion.div layoutId="roleBg" className="absolute inset-0 bg-gradient-to-r from-secondary to-blue-400" />}
                                    <input type="radio" name="role" value="FREELANCER" checked={role === 'FREELANCER'} onChange={onChange} className="hidden" />
                                    <span className="relative z-10 text-sm font-bold">Freelancer</span>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Correo electrónico"
                        className="input-field bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 w-full p-4 rounded-xl text-white outline-none placeholder-gray-500"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Contraseña"
                        className="input-field bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 w-full p-4 rounded-xl text-white outline-none placeholder-gray-500"
                        required
                    />

                    {!isLogin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="Confirmar contraseña"
                                className="input-field bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 w-full p-4 rounded-xl text-white outline-none placeholder-gray-500"
                                required
                            />
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6, 214, 160, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary w-full py-4 text-lg font-bold uppercase tracking-wide bg-gradient-to-r from-primary to-green-400 border-none relative overflow-hidden group rounded-xl text-main shadow-lg"
                    >
                        <span className="relative z-10">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                </form>

                <div className="mt-10 pt-6 border-t border-white/5 text-center">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? '¿Aún no tienes una cuenta?' : '¿Ya eres miembro?'}
                        <button
                            onClick={toggleMode}
                            className="text-white font-bold hover:text-primary ml-2 outline-none transition-colors border-b-2 border-transparent hover:border-primary"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
