import React from 'react';
import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, Shield, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedEmail, setFocusedEmail] = useState(false);
    const [focusedSenha, setFocusedSenha] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const {user} = await login(email, senha);
            
            if(!user) {
                setError("Erro inesperado: usuário não retornado.");
                return;
            }

            if (user.role === "CLIENTE") {
                navigate("/cliente/dashboard");
            } else if (user.role === "PROFISSIONAL") {
                navigate("/profissional/dashboard");
            } else {
                setError("Tipo de usuário inválido");
            }

        } catch (err: any) {
            console.error("Erro no login:", err);

            const errorMessage = err.response?.data?.message 
                || "Erro ao tentar logar! Verifique suas credenciais.";

            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };
    return (
        <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            {/* Blobs decorativos de fundo */}
            <div className='absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
            <div className='absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
            <div className='absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>

            <div className='relative z-10 container mx-auto px-4 py-12'>
                <div className='grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
                    {/* Hero Section - Lado Esquerdo */}
                    <div className='text-center lg:text-left space-y-6'>
                        <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-4'>
                            <Sparkles className='w-5 h-5 text-blue-600' />
                            <span className='text-sm font-medium text-gray-700'>Agendamentos Inteligentes</span>
                        </div>
                        <h1 className='text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight'>
                            Agendou
                        </h1>
                        <p className='text-xl lg:text-2xl text-gray-700 font-medium'>
                            Gerencie seus agendamentos de forma simples e eficiente
                        </p>
                        <ul className='space-y-3 text-left text-gray-600'>
                            <li className='flex items-center gap-3'>
                                <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                                <span>Agendamento rápido e intuitivo</span>
                            </li>
                            <li className='flex items-center gap-3'>
                                <div className='w-2 h-2 rounded-full bg-indigo-500'></div>
                                <span>Notificações em tempo real</span>
                            </li>
                            <li className='flex items-center gap-3'>
                                <div className='w-2 h-2 rounded-full bg-purple-500'></div>
                                <span>Gestão completa para profissionais</span>
                            </li>
                        </ul>
                    </div>

                    {/* Card de Login - Lado Direito */}
                    <div className='w-full max-w-md mx-auto'>
                        <div className='bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden'>
                            {/* Efeito de brilho sutil */}
                            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none'></div>
                            
                            <div className='relative z-10'>
                                <h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Bem-vindo de volta</h2>
                                <p className='text-center text-gray-600 mb-8'>Entre para continuar</p>

                                <form onSubmit={handleLogin} className='space-y-6'>
                                    {/* Campo Email com Label Flutuante */}
                                    <div className='relative'>
                                        <div className={`absolute left-4 z-10 transition-colors duration-200 ${(email || focusedEmail) ? 'top-4 text-blue-600' : 'top-1/2 -translate-y-1/2 text-gray-400'}`}>
                                            <Mail size={20} />
                                        </div>
                                        <input 
                                            id="login-email"
                                            name="email"
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.currentTarget.value)} 
                                            onFocus={() => setFocusedEmail(true)}
                                            onBlur={() => setFocusedEmail(false)}
                                            required 
                                            className='w-full pl-12 pr-4 pt-6 pb-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all'
                                        />
                                        <label 
                                            htmlFor="login-email" 
                                            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                                                (email || focusedEmail)
                                                    ? 'top-2 text-xs font-medium text-blue-600' 
                                                    : 'top-1/2 -translate-y-1/2 text-gray-500 text-base'
                                            }`}
                                        >
                                            Email
                                        </label>
                                    </div>

                                    {/* Campo Senha com Label Flutuante */}
                                    <div className='relative'>
                                        <div className={`absolute left-4 z-10 transition-colors duration-200 ${(senha || focusedSenha) ? 'top-4 text-blue-600' : 'top-1/2 -translate-y-1/2 text-gray-400'}`}>
                                            <Lock size={20} />
                                        </div>
                                        <input 
                                            id="login-senha"
                                            name="senha"
                                            type="password"
                                            value={senha}
                                            onChange={(e) => setSenha(e.currentTarget.value)} 
                                            onFocus={() => setFocusedSenha(true)}
                                            onBlur={() => setFocusedSenha(false)}
                                            required 
                                            className='w-full pl-12 pr-4 pt-6 pb-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all'
                                        />
                                        <label 
                                            htmlFor="login-senha" 
                                            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                                                (senha || focusedSenha)
                                                    ? 'top-2 text-xs font-medium text-blue-600' 
                                                    : 'top-1/2 -translate-y-1/2 text-gray-500 text-base'
                                            }`}
                                        >
                                            Senha
                                        </label>
                                    </div>

                                    {error && (
                                        <div className='text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-xl'>
                                            {error}
                                        </div>
                                    )}

                                    <button 
                                        type='submit' 
                                        disabled={loading}
                                        className='relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group'
                                    >
                                        <span className='relative z-10'>{loading ? "Entrando..." : "Entrar"}</span>
                                        {/* Shimmer effect */}
                                        <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></span>
                                    </button>

                                    <p className="text-center text-sm text-gray-600">
                                        Sem conta?{" "}
                                        <Link to="/register" className='text-blue-600 hover:text-blue-700 font-semibold hover:underline'>
                                            Cadastre-se em 30s
                                        </Link>
                                    </p>

                                    {/* Selo de Confiança */}
                                    <div className='flex items-center justify-center gap-2 pt-4 border-t border-gray-200'>
                                        <Shield className='w-5 h-5 text-green-600' />
                                        <span className='text-xs text-gray-600'>Seus dados estão protegidos</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS para animação dos blobs */}
            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Login;





