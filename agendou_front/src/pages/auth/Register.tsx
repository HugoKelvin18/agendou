import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        role: "CLIENTE",
        codigoAcesso: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validação: Se for profissional, código de acesso é obrigatório
            if (form.role === "PROFISSIONAL" && !form.codigoAcesso.trim()) {
                setError("Código de acesso é obrigatório para profissionais.");
                setLoading(false);
                return;
            }

            // Prepara os dados para envio
            const dadosParaEnvio: any = {
                nome: form.nome.trim(),
                email: form.email.trim(),
                senha: form.senha,
                telefone: form.telefone.trim(),
                role: form.role
            };

            // Adiciona codigoAcesso se for profissional
            if (form.role === "PROFISSIONAL") {
                dadosParaEnvio.codigoAcesso = form.codigoAcesso.trim();
            }

            console.log("Dados sendo enviados:", dadosParaEnvio);

            const res = await api.post("/auth/register", dadosParaEnvio);
            alert(res.data.message || "Cadastro realizado com sucesso!");
            navigate("/login");
        } catch (err: any) {
            console.error("Erro completo ao cadastrar:", err);
            
            let errorMessage = "Erro ao cadastrar. Verifique os dados e tente novamente.";
            
            // Verifica se é um erro de resposta HTTP
            if (err.response) {
                // Erro do servidor com resposta
                errorMessage = err.response.data?.message 
                    || err.response.data?.error 
                    || err.response.data?.errors?.[0]?.msg
                    || err.response.data?.errors?.[0]?.message
                    || `Erro ${err.response.status}: ${err.response.statusText}`;
            } else if (err.request) {
                // Erro de rede (sem resposta do servidor)
                // Corrigido para acessar a variável de ambiente corretamente:
                // Em projetos Vite com TypeScript, pode ser necessário:
                // declare global { interface ImportMeta { env: any } } 
                // Mas para evitar erro de tipagem/durante o build, pode-se usar:
                const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";
                errorMessage = `Não foi possível conectar ao servidor em ${backendUrl}. Verifique se o backend está rodando.`;
                console.error("Detalhes do erro de conexão:", {
                    erro: err.message,
                    codigo: err.code,
                    url: backendUrl,
                    tentativas: [
                        "1. Verifique se o backend está rodando (npm run dev na pasta agendou_back)",
                        "2. Verifique se está rodando na porta correta (3001 por padrão)",
                        "3. Verifique se não há firewall bloqueando a conexão",
                        `4. Teste no navegador: ${backendUrl}`
                    ]
                });
            } else {
                // Outro tipo de erro
                errorMessage = err.message || errorMessage;
                console.error("Erro inesperado:", err);
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full max-w-md">
                <h1 className="text-2xl md:text-3xl font-semibold text-center text-blue-600 mb-6">Agendou</h1>
                <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-6">Crie sua conta</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="register-nome" className="block text-gray-700 text-sm font-semibold mb-2">Nome</label>
                        <input 
                            id="register-nome"
                            name="nome" 
                            type="text"
                            value={form.nome}
                            placeholder="Digite seu nome completo" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label htmlFor="register-email" className="block text-gray-700 text-sm font-semibold mb-2">E-mail</label>
                        <input 
                            id="register-email"
                            name="email" 
                            type="email"
                            value={form.email}
                            placeholder="Digite seu e-mail" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label htmlFor="register-telefone" className="block text-gray-700 text-xs md:text-sm font-semibold mb-2">Telefone</label>
                        <input 
                            id="register-telefone"
                            name="telefone" 
                            type="tel"
                            value={form.telefone}
                            placeholder="Ex: (31) 99999-9999" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label htmlFor="register-senha" className="block text-gray-700 text-sm font-semibold mb-2">Senha</label>
                        <div className="relative">
                            <input 
                                id="register-senha"
                                type={mostrarSenha ? "text" : "password"} 
                                name="senha" 
                                value={form.senha}
                                placeholder="Digite sua senha" 
                                onChange={handleChange} 
                                required 
                                className="w-full p-2.5 md:p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="register-role" className="block text-gray-700 text-xs md:text-sm font-semibold mb-2">Tipo de conta</label>
                        <select 
                            id="register-role"
                            name="role" 
                            onChange={handleChange} 
                            value={form.role}
                            className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        >
                            <option value="CLIENTE">Sou cliente</option>
                            <option value="PROFISSIONAL">Sou profissional</option>
                        </select>
                    </div>

                    {form.role === 'PROFISSIONAL' && (
                        <div>
                            <label htmlFor="register-codigoAcesso" className="block text-gray-700 text-sm font-semibold mb-2">Código de Acesso</label>
                            <input
                                id="register-codigoAcesso"
                                name="codigoAcesso"
                                type="text"
                                value={form.codigoAcesso}
                                placeholder="Código de Acesso do Estabelecimento"
                                onChange={handleChange}
                                required={form.role === 'PROFISSIONAL'}
                                className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-xs md:text-sm text-center bg-red-100 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 text-white py-2.5 md:py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Já tem uma conta?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}