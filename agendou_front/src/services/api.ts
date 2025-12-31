import axios from "axios";

// Obter URL do backend das variáveis de ambiente
// IMPORTANTE: Em produção (Vercel), defina VITE_BACKEND_URL apontando para a URL pública do backend (ex: Render)
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL;

// Determinar se está em desenvolvimento local
const isLocalhost = typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1');

// Definir URL final
let finalBackendUrl;

if (BACKEND_URL) {
    // Se VITE_BACKEND_URL está definida, usar ela (produção ou desenvolvimento)
    finalBackendUrl = BACKEND_URL;
} else if (isLocalhost) {
    // Fallback apenas para desenvolvimento local (localhost)
    // NOTA: Isso NÃO funciona em outros aparelhos da rede local
    const BACKEND_PORT = (import.meta as any).env?.VITE_BACKEND_PORT || 3001;
    finalBackendUrl = `http://localhost:${BACKEND_PORT}`;
    console.warn(
        `⚠️ VITE_BACKEND_URL não definida. Usando fallback local: ${finalBackendUrl}\n` +
        `   ⚠️ NOTA: Isso só funciona neste computador. Para outros aparelhos ou produção,\n` +
        `   defina VITE_BACKEND_URL apontando para a URL pública do backend.`
    );
} else {
    // Em produção ou outros ambientes sem VITE_BACKEND_URL
    // Mostrar erro claro mas não quebrar o build (para permitir teste local em rede)
    const BACKEND_PORT = (import.meta as any).env?.VITE_BACKEND_PORT || 3001;
    finalBackendUrl = `http://localhost:${BACKEND_PORT}`;
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'SSR';
    const errorMsg = 
        `\n❌ ============================================\n` +
        `   ERRO: VITE_BACKEND_URL não está definida!\n` +
        `   ============================================\n` +
        `   Hostname atual: ${hostname}\n` +
        `   \n` +
        `   Para resolver:\n` +
        `   1. Em produção (Vercel): Defina VITE_BACKEND_URL nas variáveis de ambiente\n` +
        `      apontando para a URL pública do backend (ex: https://seu-backend.onrender.com)\n` +
        `   \n` +
        `   2. Em desenvolvimento em outros aparelhos:\n` +
        `      - Use o IP do seu computador: http://192.168.x.x:3001\n` +
        `      - Ou defina VITE_BACKEND_URL apontando para o backend público\n` +
        `   \n` +
        `   Usando fallback temporário: ${finalBackendUrl} (pode não funcionar)\n` +
        `   ============================================\n`;
    console.error(errorMsg);
}

// Log da URL do backend (apenas em desenvolvimento)
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
    console.log(`🔗 Backend URL configurada: ${finalBackendUrl}`);
}

//Cria a instância principal da API
export const api = axios.create({
    baseURL: finalBackendUrl,
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

