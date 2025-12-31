import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/ui/Sidebar';
import ModernHeader from '../components/ui/ModernHeader';
import MobileNav from '../components/ui/MobileNav';
import { X } from 'lucide-react';

interface AppLayoutProps {
    role: 'CLIENTE' | 'PROFISSIONAL';
    actionButton?: {
        text: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
}

export default function AppLayout({ role, actionButton }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Fechar sidebar ao mudar de rota no mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Prevenir scroll do body quando sidebar estiver aberta
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar Desktop - sempre visível em telas grandes */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:z-20">
                <Sidebar role={role} />
            </div>

            {/* Overlay Mobile - aparece quando sidebar está aberta */}
            {sidebarOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
                        <Sidebar role={role} onClose={() => setSidebarOpen(false)} />
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                            aria-label="Fechar menu"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <div className="md:pl-64">
                {/* Header com botão hamburger para mobile */}
                <ModernHeader 
                    role={role}
                    actionButton={actionButton}
                    onMenuClick={toggleSidebar}
                />

                {/* Page Content */}
                <main className="p-4 sm:p-6 pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav role={role} />
        </div>
    );
}
