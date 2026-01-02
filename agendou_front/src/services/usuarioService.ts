import api from "./api";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    mensagemPublica?: string;
    role: "CLIENTE" | "PROFISSIONAL";
    cidade?: string;
    bairro?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    uf?: string;
    cep?: string;
    whatsapp?: string;
    emailPublico?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    site?: string;
    linkedin?: string;
    createdAt?: string;
}

export interface UpdatePerfilData {
    nome: string;
    telefone?: string;
    mensagemPublica?: string;
    cidade?: string;
    bairro?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    uf?: string;
    cep?: string;
    whatsapp?: string;
    emailPublico?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    site?: string;
    linkedin?: string;
}

export interface AlterarSenhaData {
    senhaAtual: string;
    novaSenha: string;
}

export const usuarioService = {
    // Buscar perfil do usuário logado
    getPerfil: async (): Promise<Usuario> => {
        const response = await api.get("/usuarios/perfil/me");
        return response.data;
    },

    // Atualizar perfil do usuário logado
    updatePerfil: async (data: UpdatePerfilData) => {
        const response = await api.put("/usuarios/perfil/me", data);
        return response.data;
    },

    // Alterar senha do usuário logado
    alterarSenha: async (data: AlterarSenhaData) => {
        const response = await api.put("/usuarios/senha", data);
        return response.data;
    }
};

