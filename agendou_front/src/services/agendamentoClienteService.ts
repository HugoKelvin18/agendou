import api from "./api";

export const criarAgendamentoCliente = async (dados: any) => {
    const response = await api.post("/agendamentos/cliente", dados);
    return response.data;
}

export const listarAgendamentoCliente = async (clienteId: any) => {
    const response = await api.get(`/agendamentos/cliente/${clienteId}`);
    return response.data;
}

export const cancelarAgendamentoCliente = async (agendamentoId: number) => {
    const response = await api.patch(`/agendamentos/${agendamentoId}/cancelar`);
    return response.data;
}