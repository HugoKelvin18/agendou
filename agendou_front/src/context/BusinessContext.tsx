import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";

export interface Business {
    id: number;
    nome: string;
    slug: string;
    dominio?: string;
    ativo: boolean;
}

interface BusinessContextType {
    business: Business | null;
    businessId: number | null;
    loading: boolean;
    error: string | null;
    resolverBusiness: (slug?: string, dominio?: string) => Promise<void>;
    clearBusiness: () => void;
}

export const BusinessContext = createContext<BusinessContextType>({} as BusinessContextType);

export function BusinessProvider({ children }: { children: ReactNode }) {
    const [business, setBusiness] = useState<Business | null>(null);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar business do localStorage ao inicializar
    useEffect(() => {
        const storedBusiness = localStorage.getItem("@agendou:business");
        const storedBusinessId = localStorage.getItem("@agendou:businessId");

        if (storedBusiness && storedBusinessId) {
            try {
                const parsedBusiness = JSON.parse(storedBusiness);
                setBusiness(parsedBusiness);
                setBusinessId(parseInt(storedBusinessId));
            } catch (err) {
                console.error("Erro ao fazer parse do business salvo", err);
                localStorage.removeItem("@agendou:business");
                localStorage.removeItem("@agendou:businessId");
            }
        }

        // Tentar resolver business automaticamente se não estiver salvo
        if (!storedBusiness) {
            // Tentar por domínio primeiro
            const dominio = window.location.hostname;
            if (dominio && dominio !== "localhost" && dominio !== "127.0.0.1" && !dominio.includes("vercel.app") && !dominio.includes("netlify.app")) {
                // Domínio customizado - tentar resolver
                resolverBusiness(undefined, dominio).catch(() => {
                    setLoading(false);
                });
            } else {
                // Em desenvolvimento ou domínios genéricos, não tentar resolver automaticamente
                // O business deve ser resolvido manualmente ou via URL
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const resolverBusiness = async (slug?: string, dominio?: string) => {
        try {
            setLoading(true);
            setError(null);

            if (!slug && !dominio) {
                throw new Error("Slug ou domínio é obrigatório");
            }

            const params = new URLSearchParams();
            if (slug) params.append("slug", slug);
            if (dominio) params.append("dominio", dominio);

            const response = await api.get(`/public/business?${params.toString()}`);
            const businessData: Business = response.data;

            // Salvar no localStorage
            localStorage.setItem("@agendou:business", JSON.stringify(businessData));
            localStorage.setItem("@agendou:businessId", businessData.id.toString());

            // Atualizar estado
            setBusiness(businessData);
            setBusinessId(businessData.id);
            setLoading(false);
        } catch (err: any) {
            console.error("Erro ao resolver business:", err);
            setError(err.response?.data?.message || "Erro ao resolver business");
            setLoading(false);
            throw err;
        }
    };

    const clearBusiness = () => {
        localStorage.removeItem("@agendou:business");
        localStorage.removeItem("@agendou:businessId");
        setBusiness(null);
        setBusinessId(null);
    };

    return (
        <BusinessContext.Provider
            value={{
                business,
                businessId,
                loading,
                error,
                resolverBusiness,
                clearBusiness,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export const useBusiness = () => {
    return useContext(BusinessContext);
};
