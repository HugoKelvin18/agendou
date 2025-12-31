import api from "./api";

export const agendamentosService = {
    criar: (data: any) => api.post("/agendamentos", data),
    cancelarCliente: (id: number) => api.patch(`/agendamentos/${id}/status`, { status }),
    atualizarStatus: (id: number, status: string) => api.patch(``)
}