import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [testCards, setTestCards] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, deposit, withdraw
    const [loading, setLoading] = useState(true);

    // Deposit form
    const [selectedCard, setSelectedCard] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositMsg, setDepositMsg] = useState(null);

    // Withdraw form
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('YAPE');
    const [withdrawAccount, setWithdrawAccount] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawMsg, setWithdrawMsg] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [balRes, txRes, cardsRes] = await Promise.all([
                api.get('/wallet/balance'),
                api.get('/wallet/transactions'),
                api.get('/wallet/cards'),
            ]);
            setBalance(balRes.data.balance);
            setTransactions(txRes.data);
            setTestCards(cardsRes.data);
            if (cardsRes.data.length > 0) setSelectedCard(cardsRes.data[0].number);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setDepositLoading(true);
        setDepositMsg(null);
        try {
            const res = await api.post('/wallet/deposit', {
                cardNumber: selectedCard,
                amount: parseFloat(depositAmount),
            });
            setDepositMsg({ type: 'success', text: res.data.message });
            setBalance(res.data.balance);
            setDepositAmount('');
            fetchAll();
        } catch (err) {
            setDepositMsg({ type: 'error', text: err.response?.data?.message || 'Error al depositar' });
        } finally {
            setDepositLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawLoading(true);
        setWithdrawMsg(null);
        try {
            const res = await api.post('/wallet/withdraw', {
                amount: parseFloat(withdrawAmount),
                method: withdrawMethod,
                account: withdrawAccount,
            });
            setWithdrawMsg({ type: 'success', text: res.data.message });
            setBalance(res.data.balance);
            setWithdrawAmount('');
            setWithdrawAccount('');
            fetchAll();
        } catch (err) {
            setWithdrawMsg({ type: 'error', text: err.response?.data?.message || 'Error al retirar' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const txConfig = {
        'DEPOSIT': { icon: <svg className="w-5 h-5" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>, color: '#34d399', bg: 'bg-emerald-500/10', label: 'Depósito' },
        'ESCROW_LOCK': { icon: <svg className="w-5 h-5" fill="none" stroke="#60a5fa" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, color: '#60a5fa', bg: 'bg-blue-500/10', label: 'Escrow Bloqueado' },
        'ESCROW_RELEASE': { icon: <svg className="w-5 h-5" fill="none" stroke="#f87171" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>, color: '#f87171', bg: 'bg-red-500/10', label: 'Escrow Liberado' },
        'MILESTONE_PAYMENT': { icon: <svg className="w-5 h-5" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: '#34d399', bg: 'bg-emerald-500/10', label: 'Pago Recibido' },
        'WITHDRAWAL': { icon: <svg className="w-5 h-5" fill="none" stroke="#fb923c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>, color: '#fb923c', bg: 'bg-orange-500/10', label: 'Retiro' },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="group flex items-center text-gray-500 mb-8 hover:text-white transition-colors">
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver
                </button>

                {/* Balance Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#151515] to-[#0f0f0f] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Saldo Disponible</p>
                                <motion.h1
                                    key={balance}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl md:text-7xl font-black text-white tracking-tight"
                                >
                                    S/ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </motion.h1>
                                <p className="text-gray-500 text-sm mt-2">{user?.name} — Billetera Digital</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActiveTab('deposit')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'deposit' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Depositar
                                </button>
                                <button
                                    onClick={() => setActiveTab('withdraw')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'withdraw' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-black'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Retirar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Deposit / Withdraw Panels */}
                <AnimatePresence mode="wait">
                    {activeTab === 'deposit' && (
                        <motion.div
                            key="deposit"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#151515] border border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-lg"
                        >
                            <h2 className="text-2xl font-black text-white mb-6">Depositar Fondos</h2>

                            {/* Test Cards */}
                            <div className="mb-6">
                                <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">Selecciona una tarjeta de prueba</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {testCards.filter(c => c.approved).map(card => (
                                        <button
                                            key={card.number}
                                            onClick={() => setSelectedCard(card.number)}
                                            className={`p-4 rounded-2xl border transition-all text-left ${selectedCard === card.number ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-white/5 bg-[#0E0E0E] hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.brand}</span>
                                                {selectedCard === card.number && (
                                                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                )}
                                            </div>
                                            <p className="text-white font-mono text-lg tracking-wider">{card.number}</p>
                                            <p className="text-gray-600 text-xs mt-1">**** {card.last4}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Monto (S/)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={depositAmount}
                                        onChange={e => setDepositAmount(e.target.value)}
                                        placeholder="Ej: 1500.00"
                                        className="w-full bg-[#0E0E0E] border border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 px-5 py-4 rounded-xl text-white text-xl font-bold outline-none transition"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={depositLoading || !depositAmount}
                                    className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    {depositLoading ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    )}
                                    Depositar
                                </button>
                            </form>

                            {depositMsg && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl text-sm font-bold ${depositMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {depositMsg.text}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'withdraw' && (
                        <motion.div
                            key="withdraw"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#151515] border border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-lg"
                        >
                            <h2 className="text-2xl font-black text-white mb-6">Retirar Fondos</h2>

                            <form onSubmit={handleWithdraw} className="space-y-5">
                                {/* Method Selection */}
                                <div>
                                    <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">Método de retiro</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setWithdrawMethod('YAPE')}
                                            className={`p-4 rounded-2xl border text-center transition-all ${withdrawMethod === 'YAPE' ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 bg-[#0E0E0E] hover:border-white/10'}`}
                                        >

                                            <span className={`font-bold text-sm ${withdrawMethod === 'YAPE' ? 'text-purple-400' : 'text-gray-400'}`}>Yape</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWithdrawMethod('BANK')}
                                            className={`p-4 rounded-2xl border text-center transition-all ${withdrawMethod === 'BANK' ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 bg-[#0E0E0E] hover:border-white/10'}`}
                                        >
                                            <span className={`font-bold text-sm ${withdrawMethod === 'BANK' ? 'text-blue-400' : 'text-gray-400'}`}>Cuenta Bancaria</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
                                        {withdrawMethod === 'YAPE' ? 'Número de teléfono Yape' : 'Número de cuenta bancaria (CCI)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={withdrawAccount}
                                        onChange={e => setWithdrawAccount(e.target.value)}
                                        placeholder={withdrawMethod === 'YAPE' ? '987 654 321' : '00219400254000000'}
                                        className="w-full bg-[#0E0E0E] border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 px-5 py-4 rounded-xl text-white font-mono text-lg outline-none transition"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Monto (S/)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            max={balance}
                                            value={withdrawAmount}
                                            onChange={e => setWithdrawAmount(e.target.value)}
                                            placeholder="Ej: 500.00"
                                            className="w-full bg-[#0E0E0E] border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 px-5 py-4 rounded-xl text-white text-xl font-bold outline-none transition"
                                            required
                                        />
                                        <p className="text-gray-600 text-xs mt-1">Disponible: S/ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={withdrawLoading || !withdrawAmount || !withdrawAccount}
                                        className="bg-orange-500 text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end shadow-lg hover:shadow-orange-500/20 flex items-center gap-2"
                                    >
                                        {withdrawLoading ? (
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        )}
                                        Retirar
                                    </button>
                                </div>
                            </form>

                            {withdrawMsg && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl text-sm font-bold ${withdrawMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {withdrawMsg.text}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transaction History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white tracking-tight">Historial de Movimientos</h2>
                            <span className="bg-white/5 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">{transactions.length}</span>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="bg-[#151515] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No hay movimientos aún.</p>
                            <p className="text-gray-600 text-xs mt-1">Tus depósitos, pagos y retiros aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx, idx) => {
                                const cfg = txConfig[tx.type] || { icon: <span>•</span>, color: '#9ca3af', bg: 'bg-white/5', label: tx.type };
                                const isPositive = tx.amount > 0;

                                return (
                                    <motion.div
                                        key={tx._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="bg-[#151515] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group flex items-center gap-5"
                                    >
                                        <div className={`w-11 h-11 rounded-xl ${cfg.bg} border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} border border-white/5`} style={{ color: cfg.color }}>
                                                    {cfg.label}
                                                </span>
                                                {tx.relatedContract && (
                                                    <span className="text-[10px] text-gray-600 truncate max-w-[150px]">
                                                        {tx.relatedContract.title}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">{tx.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-lg font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isPositive ? '+' : ''} S/ {Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                            <time className="text-[10px] text-gray-600 font-medium">
                                                {new Date(tx.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Test Cards Reference */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 mb-8">
                    <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tarjetas de Prueba</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {testCards.map(card => (
                                <div key={card.number} className="flex items-center justify-between bg-[#0E0E0E] rounded-xl px-4 py-3 border border-white/5">
                                    <div>
                                        <p className="text-white font-mono text-sm">{card.number}</p>
                                        <p className="text-gray-600 text-[10px] uppercase font-bold tracking-wider">{card.brand}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {card.approved ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Wallet;
