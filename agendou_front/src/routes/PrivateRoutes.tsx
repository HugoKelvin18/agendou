import { Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
    children: React.ReactNode;
    role?: "CLIENTE" | "PROFISSIONAL" | "ADMIN";
}

export function PrivateRoute({ children, role }: PrivateRouteProps) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg">Carregando...</p>
        </div>;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}