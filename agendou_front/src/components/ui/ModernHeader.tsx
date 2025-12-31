import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationDrawer from './NotificationDrawer';

interface Notification {
    id: number;
    type: 'message' | 'appointment' | 'cancellation' | 'update';
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
}

interface ModernHeaderProps {
    actionButton?: {
        text: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    role?: 'CLIENTE' | 'PROFISSIONAL';
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ 
    actionButton,
    agendamentosHoje = 0,
    role = 'CLIENTE'
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Carregar notificações do backend
    const carregarNotificacoes = async () => {
        try {
            const { notificacaoService } = await import('../../services/notificacaoService');
            const notifs = role === 'CLIENTE'
                ? await notificacaoService.listarCliente()
                : await notificacaoService.listarProfissional();
            setNotifications(notifs);
        } catch (err) {
            console.error("Erro ao carregar notificações:", err);
            setNotifications([]);
        }
    };

    useEffect(() => {
        carregarNotificacoes();
        
        // Polling: atualizar notificações a cada 45 segundos
        const interval = setInterval(() => {
            carregarNotificacoes();
        }, 45000);

        return () => clearInterval(interval);
    }, [role]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: number | string) => {
        try {
            const { notificacaoService } = await import('../../services/notificacaoService');
            await notificacaoService.marcarComoLida(id);
            // Atualizar estado local
            setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Erro ao marcar notificação como lida:", err);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <header className="sticky top-0 z-30 w-full backdrop-blur-sm bg-white/90 border-b border-gray-200/60 shadow-sm">
                <div className="px-4 md:px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        {/* Esquerda - Saudação */}
                        <div className="flex items-center min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                {getGreeting()}, {user?.nome?.split(' ')[0] || 'Usuário'}
                            </h1>
                        </div>

                        {/* Centro - Busca (opcional, pode ser removido) */}
                        <div className="hidden lg:flex items-center flex-1 max-w-md">
                            {/* Campo de busca pode ser adicionado aqui no futuro */}
                        </div>

                        {/* Direita - Notificações + Avatar + Botão */}
                        <div className="flex items-center gap-2">
                            {/* Notificações */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 rounded-lg hover:bg-gray-100/60 transition-colors"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1.5 bg-blue-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Avatar */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100/60 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                        {getInitials(user?.nome)}
                                    </div>
                                    <ChevronDown 
                                        size={14} 
                                        className={`text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} 
                                    />
                                </button>

                                {/* Menu Dropdown */}
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800">{user?.nome}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => {
                                                navigate(role === 'CLIENTE' ? '/cliente/configuracoes' : '/profissional/configuracoes');
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings size={16} />
                                            <span>Configurações</span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            <span>Sair</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Botão de Ação Principal */}
                            {actionButton && (
                                <button
                                    onClick={actionButton.onClick}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-sm font-medium"
                                >
                                    {actionButton.icon || <Plus size={16} />}
                                    <span>{actionButton.text}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Drawer de Notificações */}
            <NotificationDrawer
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                role={role}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
            />
        </>
    );
};

export default ModernHeader;
