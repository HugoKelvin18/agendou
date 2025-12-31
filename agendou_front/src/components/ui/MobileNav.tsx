import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, UserCog, Scissors, DollarSign, Home } from 'lucide-react';

interface MobileNavProps {
    role: 'CLIENTE' | 'PROFISSIONAL';
}

export default function MobileNav({ role }: MobileNavProps) {
    const { pathname } = useLocation();

    const navCliente = [
        { name: 'Home', path: '/cliente/dashboard', icon: Home },
        { name: 'Agendar', path: '/cliente/agendar', icon: Calendar },
        { name: 'Agendamentos', path: '/cliente/agendamentos', icon: Clock },
        { name: 'Perfil', path: '/cliente/configuracoes', icon: UserCog }
    ];

    const navProfissional = [
        { name: 'Home', path: '/profissional/dashboard', icon: Home },
        { name: 'Agendamentos', path: '/profissional/agendamentos', icon: Calendar },
        { name: 'Serviços', path: '/profissional/agendar', icon: Scissors },
        { name: 'Faturamento', path: '/profissional/faturamento', icon: DollarSign },
        { name: 'Perfil', path: '/profissional/configuracoes', icon: UserCog }
    ];

    const navItems = role === 'CLIENTE' ? navCliente : navProfissional;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
