import { Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../layouts/AppLayout";

interface PrivateRouteProps {
    children: React.ReactNode;
    role?: "CLIENTE" | "PROFISSIONAL";
    actionButton?: {
        text: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    useLayout?: boolean;
}

export function PrivateRoute({ children, role, actionButton, useLayout = true }: PrivateRouteProps) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/login" replace />;
    }

    // Se não usar layout, retorna apenas o children (para páginas que já têm seu próprio layout)
    if (!useLayout) {
        return <>{children}</>;
    }

    // Usa AppLayout por padrão
    return (
        <AppLayout role={user.role as "CLIENTE" | "PROFISSIONAL"} actionButton={actionButton}>
            {children}
        </AppLayout>
    );
}