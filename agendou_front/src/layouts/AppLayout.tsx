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
        <>
            {/* Mobile: Estrutura completa com wrapper */}
            <div className="md:hidden min-h-screen bg-gray-50">
                {/* Overlay Mobile - aparece quando sidebar está aberta */}
                {sidebarOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 w-64">
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

                {/* Header Mobile */}
                <ModernHeader 
                    role={role}
                    actionButton={actionButton}
                    onMenuClick={toggleSidebar}
                />

                {/* Page Content Mobile */}
                <main className="p-4 pb-20">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation */}
                <MobileNav role={role} />
            </div>

            {/* Desktop: Sem wrapper, apenas elementos estruturais */}
            <div className="hidden md:block">
                {/* Sidebar Desktop */}
                <div className="fixed inset-y-0 left-0 w-64 z-20">
                    <Sidebar role={role} />
                </div>

                {/* Main Content Desktop - sem padding/margin que interfira */}
                <div className="ml-64">
                    {/* Header Desktop */}
                    <ModernHeader 
                        role={role}
                        actionButton={actionButton}
                        onMenuClick={toggleSidebar}
                    />

                    {/* Page Content Desktop - renderiza páginas diretamente */}
                    <Outlet />
                </div>
            </div>
        </>
    );
}
