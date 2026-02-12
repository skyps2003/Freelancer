import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import io from 'socket.io-client';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [chatProduct, setChatProduct] = useState(null);
    const socket = useRef();
    const listEndRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const initialReceiverId = queryParams.get('receiverId');

    useEffect(() => {
        let socketUrl;
        if (import.meta.env.VITE_API_URL) {
            socketUrl = import.meta.env.VITE_API_URL;
        } else {
            socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`;
        }
        socket.current = io(socketUrl);

        socket.current.on('connect', () => {
            if (user) {
                socket.current.emit('join_room', user._id);
            }
        });

        socket.current.on('receive_message', (data) => {
            if (currentChat && (data.sender === currentChat._id || data.receiver === currentChat._id)) {
                setMessages((prev) => [...prev, data]);
                setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            } else {
                fetchConversations(false);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user, currentChat]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (conversations.length > 0 && initialReceiverId) {
            const target = conversations.find(c => c._id === initialReceiverId);
            if (target && (!currentChat || currentChat._id !== target._id)) {
                loadChat(target, false); // Don't navigate again if loaded from URL
            }
        }
    }, [conversations, initialReceiverId]);


    const fetchConversations = async (showLoading = true) => {
        if (showLoading) setLoadingConversations(true);
        try {
            const res = await api.get('/messages/conversations/list');
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoading) setLoadingConversations(false);
        }
    };

    const loadChat = async (partner, updateUrl = true) => {
        if (currentChat?._id === partner._id) return;

        if (updateUrl) {
            navigate(`/chat?receiverId=${partner._id}`, { replace: true });
        }

        setCurrentChat(partner);
        setLoadingMessages(true);
        setMessages([]);
        setChatProduct(null);
        try {
            const res = await api.get(`/messages/${partner._id}`);
            const msgs = res.data;
            setMessages(msgs);

            const productMsg = msgs.slice().reverse().find(m => m.product);
            if (productMsg && productMsg.product) {
                setChatProduct(productMsg.product);
            }

            setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        const tempId = Date.now();
        const messagePayload = {
            sender: user._id,
            receiver: currentChat._id,
            content: newMessage,
            createdAt: new Date().toISOString(),
            _id: tempId,
            product: chatProduct
        };

        setMessages((prev) => [...prev, messagePayload]);
        setNewMessage('');
        setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        try {
            const res = await api.post('/messages', {
                receiver: currentChat._id,
                content: messagePayload.content,
                product: chatProduct ? chatProduct._id : null
            });

            socket.current.emit('send_message', {
                sender: user._id,
                receiverId: currentChat._id,
                content: messagePayload.content,
                _id: res.data._id,
                product: chatProduct
            });
        } catch (err) {
            console.error("Failed to send message", err);
            // Ideally handle rollback here
        }
    };

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Skeleton Components
    const ConversationSkeleton = () => (
        <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse bg-white/5">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-2 bg-white/5 rounded w-3/4" />
            </div>
        </div>
    );

    const MessageSkeleton = () => (
        <div className="space-y-4 p-6">
            <div className="flex justify-start"><div className="w-1/2 h-10 bg-white/10 rounded-2xl rounded-tl-none animate-pulse" /></div>
            <div className="flex justify-end"><div className="w-1/3 h-14 bg-primary/20 rounded-2xl rounded-tr-none animate-pulse" /></div>
            <div className="flex justify-start"><div className="w-2/3 h-12 bg-white/10 rounded-2xl rounded-tl-none animate-pulse" /></div>
            <div className="flex justify-start"><div className="w-1/4 h-8 bg-white/10 rounded-2xl rounded-tl-none animate-pulse" /></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white pt-24 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-[#0f0f0f]/80 backdrop-blur-md hidden md:flex">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 z-10 bg-[#0f0f0f]/95">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-primary">●</span> Mensajes
                    </h2>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
                        title="Regresar al Inicio"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loadingConversations ? (
                        <>
                            <ConversationSkeleton /><ConversationSkeleton /><ConversationSkeleton />
                        </>
                    ) : conversations.length > 0 ? (
                        conversations.map(chat => (
                            <div
                                key={chat._id}
                                onClick={() => loadChat(chat)}
                                className={`p-4 rounded-xl cursor-pointer flex items-center gap-4 transition-all hover:bg-white/5 border border-transparent group ${currentChat?._id === chat._id ? 'bg-primary/10 border-primary/20' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-white/10 group-hover:border-primary/50 transition">
                                        {chat.avatar ? <img src={chat.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{chat.name[0]}</div>}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f]"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold truncate text-sm ${currentChat?._id === chat._id ? 'text-primary' : 'text-gray-200'}`}>{chat.name}</h3>
                                        <span className="text-[10px] text-gray-500">{new Date(chat.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition">{chat.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-50">
                            <p>No tienes conversaciones aún.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 via-gray-900 to-black">
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-black/80 backdrop-blur-md z-20 shadow-lg sticky top-0 border-b border-white/5">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                            {currentChat.avatar ? <img src={currentChat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{currentChat.name[0]}</div>}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{currentChat.name}</h3>
                                        {chatProduct ? (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>Sobre: <span className="text-primary font-bold">{chatProduct.title}</span></span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                <span className="text-xs text-gray-400">En línea</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {chatProduct && (
                                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                            {chatProduct.image && <img src={chatProduct.image} className="w-6 h-6 rounded object-cover" />}
                                            <button className="text-xs text-primary hover:underline">Ver Producto</button>
                                        </div>
                                    )}
                                    <button onClick={() => window.location.href = '/'} className="md:hidden text-gray-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[url('/img/pattern.svg')] bg-opacity-5">
                            {loadingMessages ? (
                                <MessageSkeleton />
                            ) : (
                                <>
                                    {messages.map((msg, idx) => {
                                        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                                        const isMe = senderId === user?._id;

                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`max-w-[75%] relative`}>
                                                    <div className={`px-4 py-2 rounded-xl text-sm leading-relaxed shadow-sm ${isMe
                                                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                                                        : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                                                        }`}>
                                                        {msg.content}
                                                        <div className={`text-[10px] text-right mt-1 opacity-70 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isMe && <span className="ml-1 text-blue-300">✓✓</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={listEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-[#202c33] border-t border-white/5 z-20">
                            <form onSubmit={sendMessage} className="flex gap-2 items-center max-w-5xl mx-auto">
                                <button type="button" className="text-gray-400 hover:text-white p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                                <button type="button" className="text-gray-400 hover:text-white p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>
                                <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="text-gray-400 hover:text-primary p-2 transition disabled:opacity-50"
                                >
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#222e35] border-b border-[#202c33]">
                        {/* Placeholder */}
                        <div className="w-full h-full flex items-center justify-center bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-10"></div>
                        <div className="absolute text-center">
                            <h3 className="text-3xl text-gray-300 font-light mb-4">Lumina Web</h3>
                            <p className="text-sm text-gray-400">Envía y recibe mensajes sin necesidad de tener tu teléfono conectado.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
