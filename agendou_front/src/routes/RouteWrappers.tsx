import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoutes';
import { Plus } from 'lucide-react';

// Wrapper para Dashboard Cliente
export function DashboardClienteRoute({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    return (
        <PrivateRoute
            role="CLIENTE"
            actionButton={{
                text: "Novo agendamento",
                onClick: () => navigate("/cliente/agendar"),
                icon: <Plus size={18} />
            }}
        >
            {children}
        </PrivateRoute>
    );
}

// Wrapper para Dashboard Profissional
export function DashboardProfissionalRoute({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    return (
        <PrivateRoute
            role="PROFISSIONAL"
            actionButton={{
                text: "Adicionar serviço",
                onClick: () => navigate("/profissional/agendar"),
                icon: <Plus size={18} />
            }}
        >
            {children}
        </PrivateRoute>
    );
}
