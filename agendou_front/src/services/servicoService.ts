import api from "./api";

export const servicosService = {
    list: () =>
        api.get(`/servicos`),

    getByProfissional: (id: number) =>
        api.get(`/servicos/profissional/${id}`),

    create: (data: any) =>
        api.post(`/servicos`, data),

    update: (id: number, data: any) =>
        api.put(`/servicos/${id}`, data),

    delete: (id: number) =>
        api.delete(`/servicos/${id}`)
}