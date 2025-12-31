import api from "./api";

// Crie o objeto agendamentosApi contendo as funções necessárias
export const agendamentosApi = {
    // Criar um novo agendamento para o cliente
    criar: async (dados: any) => {
        const response = await api.post("/agendamentos/cliente", dados);
        return response.data;
    },

    // Listar agendamentos pelo ID do profissional
    listarPorProfissional: async (profissionalId?: any, filtros?: { clienteNome?: string; data?: string }) => {
        // Caso profissionalId não seja informado, pega do backend pelo usuário logado
        const url = profissionalId
            ? `/agendamentos/profissional/${profissionalId}`
            : `/agendamentos/profissional`;
        
        // Adicionar query parameters se existirem filtros
        const params = new URLSearchParams();
        if (filtros?.clienteNome) {
            params.append('clienteNome', filtros.clienteNome);
        }
        if (filtros?.data) {
            params.append('data', filtros.data);
        }
        
        const urlCompleta = params.toString() ? `${url}?${params.toString()}` : url;
        const response = await api.get(urlCompleta);
        return response.data;
    },

    // Atualizar o status do agendamento
    atualizarStatus: async (id: number, status: string) => {
        const response = await api.patch(`/agendamentos/${id}/status`, { status });
        return response.data;
    },

    // Buscar dados de faturamento
    faturamento: async (periodo?: 'dia' | 'mes' | 'ano' | 'tudo') => {
        const url = periodo ? `/agendamentos/profissional/faturamento?periodo=${periodo}` : '/agendamentos/profissional/faturamento';
        const response = await api.get(url);
        return response.data;
    },
};


    


