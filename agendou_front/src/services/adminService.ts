import api from "./api";

export interface BusinessMetricas {
    totalUsuarios: number;
    totalProfissionais: number;
    totalServicos: number;
    agendamentosMes: number;
    diasAtraso: number | null;
}

export interface BusinessAdmin extends BusinessMetricas {
    id: number;
    nome: string;
    slug: string;
    dominio?: string;
    ativo: boolean;
    plano?: string;
    statusPagamento: "ATIVO" | "INADIMPLENTE" | "BLOQUEADO" | "CANCELADO";
    vencimento?: string;
    ultimoPagamento?: string;
    dataBloqueio?: string;
    toleranciaDias: number;
    limiteUsuarios?: number;
    limiteProfissionais?: number;
    limiteServicos?: number;
    limiteAgendamentos?: number;
    createdAt: string;
    updatedAt: string;
    metricas: BusinessMetricas;
}

export const adminService = {
    // Listar todos os businesses
    listarBusinesses: async (): Promise<BusinessAdmin[]> => {
        const response = await api.get("/admin/businesses");
        return response.data;
    },

    // Obter detalhes de um business
    obterBusiness: async (id: number): Promise<BusinessAdmin> => {
        const response = await api.get(`/admin/businesses/${id}`);
        return response.data;
    },

    // Atualizar status de pagamento
    atualizarStatusPagamento: async (id: number, statusPagamento: string) => {
        const response = await api.patch(`/admin/businesses/${id}/status`, { statusPagamento });
        return response.data;
    },

    // Atualizar plano
    atualizarPlano: async (id: number, plano: string, limites?: {
        limiteUsuarios?: number;
        limiteProfissionais?: number;
        limiteServicos?: number;
        limiteAgendamentos?: number;
    }) => {
        const response = await api.patch(`/admin/businesses/${id}/plano`, {
            plano,
            ...limites
        });
        return response.data;
    },

    // Registrar pagamento
    registrarPagamento: async (id: number, ultimoPagamento: string, proximoVencimento?: string) => {
        const response = await api.post(`/admin/businesses/${id}/pagamento`, {
            ultimoPagamento,
            proximoVencimento
        });
        return response.data;
    },

    // Bloquear business
    bloquearBusiness: async (id: number) => {
        const response = await api.post(`/admin/businesses/${id}/bloquear`);
        return response.data;
    },

    // Liberar business
    liberarBusiness: async (id: number) => {
        const response = await api.post(`/admin/businesses/${id}/liberar`);
        return response.data;
    },

    // Criar código de acesso admin
    criarCodigoAcesso: async (codigo: string, descricao?: string, expiraEm?: string) => {
        const response = await api.post("/admin/codigos-acesso", {
            codigo,
            descricao,
            expiraEm
        });
        return response.data;
    }
};
