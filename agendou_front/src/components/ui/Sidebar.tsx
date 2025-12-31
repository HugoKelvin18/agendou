import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { Scissors, UserCog, Calendar, Clock, LogOut, DollarSign } from "lucide-react"

interface SidebarProps {
    role: "CLIENTE" | "PROFISSIONAL";
    onClose?: () => void;
}

export default function Sidebar ({ role, onClose }: SidebarProps) {
    const { pathname } = useLocation();
    const { logout } = useAuth();

    const navCliente = [
        { name: "Agendar Serviço", path: "/cliente/agendar", icon: Calendar },
        { name: "Meus Agendamentos", path: "/cliente/agendamentos", icon: Clock },
        { name: "Meu Perfil", path: "/cliente/configuracoes", icon: UserCog }
    ];

    const navProfissional = [
        { name: "Dashboard", path: "/profissional/dashboard", icon: Calendar },
        { name: "Agendamentos", path: "/profissional/agendamentos", icon: Calendar },
        { name: "Meus Serviços", path: "/profissional/agendar", icon: Scissors },
        { name: "Disponibilidade", path: "/profissional/disponibilidades", icon: Clock },
        { name: "Faturamento", path: "/profissional/faturamento", icon: DollarSign },
        { name: "Meu Perfil", path: "/profissional/configuracoes", icon: UserCog }
    ];

    const links = role === "PROFISSIONAL" ? navProfissional : navCliente;

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <aside className="w-full h-full bg-[#0b0b0b] border-r border-[#1f1f1f] p-5 flex flex-col justify-between overflow-y-auto">
            
            <div>
                {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
                <Scissors size={28} className="text-[#d4af37" />
                <h1 className="text-x1 font-bold text-[#d4af37]">Agendou</h1>
            </div>

            {/* NAV */}
            <nav className="flex flex-col gap-3">
                {links.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.path;

                    return (
                        <Link 
                        key={item.path}
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all
                            ${active
                                ? "bg-[#151515] border-l-4 border-[#d4af37]"
                                : "hover:bg-[#111] hover:shadow-[0_0_10px_#d4af37]"}`}
                        >
                        <Icon size={20} className="text-[#d4af37]" />
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
            </div>

            {/* LOGOUT BUTTON */}
            <div className="mt-auto">
                <button
                    onClick={() => {
                        if (onClose) onClose();
                        logout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-red-500 hover:bg-[#111] hover:shadow-[0_0_10px_#d4af37]">
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Sair</span>
                </button>
            </div>
        </aside>
    )
}