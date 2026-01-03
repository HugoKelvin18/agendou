import api from "./api";

export interface SolicitacaoSuporte {
    id: number;
    businessId: number;
    usuarioId: number;
    assunto: string;
    descricao: string;
    status: "PENDENTE" | "EM_ATENDIMENTO" | "RESOLVIDO" | "CANCELADO";
    resposta?: string;
    criadoEm: string;
    atualizadoEm: string;
    respondidoEm?: string;
    business?: {
        id: number;
        nome: string;
        slug: string;
    };
    usuario?: {
        id: number;
        nome: string;
        email: string;
    };
}

export const suporteService = {
    // Criar solicitação de suporte
    criarSolicitacao: async (assunto: string, descricao: string): Promise<SolicitacaoSuporte> => {
        const response = await api.post("/usuarios/suporte", { assunto, descricao });
        return response.data;
    },

    // Listar minhas solicitações
    listarMinhas: async (): Promise<SolicitacaoSuporte[]> => {
        const response = await api.get("/usuarios/suporte");
        return response.data;
    },

    // Listar todas (admin)
    listarTodas: async (status?: string, businessId?: number): Promise<SolicitacaoSuporte[]> => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (businessId) params.append("businessId", businessId.toString());
        const response = await api.get(`/admin/suporte?${params.toString()}`);
        return response.data;
    },

    // Responder solicitação (admin)
    responder: async (id: number, resposta: string, status?: string): Promise<SolicitacaoSuporte> => {
        const response = await api.post(`/admin/suporte/${id}/responder`, { resposta, status });
        return response.data;
    }
};
