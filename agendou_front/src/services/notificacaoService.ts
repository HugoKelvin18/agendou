import api from "./api";

export interface Notification {
    id: string;
    type: 'message' | 'appointment' | 'cancellation' | 'update' | 'payment_overdue' | 'support_request';
    title: string;
    message: string;
    time: string;
    timestamp?: number;
    read: boolean;
    actionUrl?: string;
    businessId?: number;
    diasAtraso?: number;
    solicitacaoId?: number;
}

export const notificacaoService = {
    listarCliente: async (): Promise<Notification[]> => {
        const response = await api.get("/notificacoes/cliente");
        return response.data;
    },

    listarProfissional: async (): Promise<Notification[]> => {
        const response = await api.get("/notificacoes/profissional");
        return response.data;
    },

    listarAdmin: async (): Promise<Notification[]> => {
        const response = await api.get("/notificacoes/admin");
        return response.data;
    },

    marcarComoLida: async (notificacaoId: number | string): Promise<void> => {
        await api.post("/notificacoes/marcar-lida", { notificacaoId });
    }
};
