import api from "./api";

export interface Disponibilidade {
    id?: number;
    profissionalId: number;
    data: string;
    horaInicio: number; // minutos
    horaFim: number; // minutos
    intervaloMin?: number;
    disponivel: boolean;
}

// Função auxiliar: converter hora string (HH:mm) para minutos
export const horaStringParaMinutos = (hora: string): number => {
    if (!hora) return 0;
    const [hh, mm] = hora.split(":").map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
    return hh * 60 + mm;
};

// Função auxiliar: converter minutos para hora string (HH:mm)
export const minutosParaHoraString = (minutos: number): string => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export const disponibilidadeService = {
    // Listar todas as disponibilidades (público)
    listar: async (profissionalId?: number, data?: string) => {
        const params = new URLSearchParams();
        if (profissionalId) params.append('profissionalId', profissionalId.toString());
        if (data) params.append('data', data);
        
        const url = `/disponibilidades${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Listar disponibilidades do profissional logado
    listarPorProfissional: async () => {
        const response = await api.get("/disponibilidades/profissional");
        return response.data;
    },

    // Criar disponibilidade
    criar: async (data: Omit<Disponibilidade, 'id'>) => {
        const response = await api.post("/disponibilidades", data);
        return response.data;
    },

    // Deletar disponibilidade
    deletar: async (id: number) => {
        const response = await api.delete(`/disponibilidades/${id}`);
        return response.data;
    },

    // Buscar horários disponíveis (considera duração do serviço)
    horariosDisponiveis: async (profissionalId: number, data: string, servicoId: number) => {
        const params = new URLSearchParams();
        params.append('profissionalId', profissionalId.toString());
        params.append('data', data);
        params.append('servicoId', servicoId.toString());
        
        const response = await api.get(`/disponibilidades/horarios-disponiveis?${params.toString()}`);
        return response.data;
    }
};

