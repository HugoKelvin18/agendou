import axios from "axios";

const BACKEND_PORT = (import.meta as any).env?.VITE_BACKEND_PORT || 3001;
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

//Cria a instância principal da API
export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 30000, // Timeout de 30 segundos (aumentado para cold start do Render)
});

//Intercepta requisições para adicionar o token e businessId automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("@agendou:token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Adicionar x-business-id se disponível
        const businessId = localStorage.getItem("@agendou:businessId");
        if (businessId) {
            config.headers["x-business-id"] = businessId;
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

