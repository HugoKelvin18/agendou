import React, { useState } from 'react';
import { X, Clock, Calendar, User, MessageSquare, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    type: 'message' | 'appointment' | 'cancellation' | 'update';
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
}

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN';
    notifications: Notification[];
    onMarkAsRead: (id: number | string) => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
    isOpen,
    onClose,
    role,
    notifications,
    onMarkAsRead
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'appointments' | 'cancellations'>('all');

    const tabs = role === 'CLIENTE'
        ? [
              { id: 'all', label: 'Todas' },
              { id: 'messages', label: 'Mensagens' },
              { id: 'appointments', label: 'Agendamentos' }
          ]
        : role === 'PROFISSIONAL'
        ? [
              { id: 'all', label: 'Todas' },
              { id: 'appointments', label: 'Novos' },
              { id: 'cancellations', label: 'Cancelamentos' }
          ]
        : [
              { id: 'all', label: 'Todas' },
              { id: 'payment_overdue', label: 'Pagamentos' },
              { id: 'support_request', label: 'Suporte' }
          ];

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'all') return true;
        if (activeTab === 'messages') return notif.type === 'message';
        if (activeTab === 'appointments') return notif.type === 'appointment' || notif.type === 'update';
        if (activeTab === 'cancellations') return notif.type === 'cancellation';
        if (activeTab === 'payment_overdue') return notif.type === 'payment_overdue';
        if (activeTab === 'support_request') return notif.type === 'support_request';
        return true;
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return <MessageSquare size={18} className="text-blue-500" />;
            case 'appointment':
                return <Calendar size={18} className="text-green-500" />;
            case 'cancellation':
                return <XCircle size={18} className="text-red-500" />;
            case 'update':
                return <AlertCircle size={18} className="text-yellow-500" />;
            case 'payment_overdue':
                return <AlertCircle size={18} className="text-red-500" />;
            case 'support_request':
                return <MessageSquare size={18} className="text-orange-500" />;
            default:
                return <Clock size={18} className="text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="flex items-center justify-between p-4">
                        <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 px-4 pb-3 border-b border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100vh-140px)]">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Clock size={48} className="mb-4" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                        !notification.read ? 'bg-blue-50/30' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">
                                                            {notification.time}
                                                        </span>
                                                        {notification.actionUrl && (
                                                            <span className="text-xs text-blue-600 font-medium">
                                                                Ver detalhes →
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDrawer;
