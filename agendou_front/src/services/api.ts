import axios from "axios";

const BACKEND_PORT = (import.meta as any).env?.VITE_BACKEND_PORT || 3333;
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

//Cria a instância principal da API
export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000, // Timeout de 10 segundos
});

//Intercepta requisições para adicionar o token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("@agendou:token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Intercepta respostas para tratar erros globais
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            //Token expirado ou inválido
            console.warn("Sessão expirada. Faça login novamente.");
            localStorage.removeItem("@agendou:token");
            localStorage.removeItem("@agendou:user");
            window.location.href = "/login"; //Redireciona automaticamente
        }
        return Promise.reject(error);
    }
)

export default api

