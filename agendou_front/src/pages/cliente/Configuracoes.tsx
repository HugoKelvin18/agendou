import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { usuarioService, Usuario, UpdatePerfilData, AlterarSenhaData } from "../../services/usuarioService";
import Input from "../../components/forms/Input";
import { User, Lock, LogOut, Edit2, Save, X, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";

export default function ConfiguracoesCliente() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Estados para edição de perfil
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [formPerfil, setFormPerfil] = useState({
        nome: "",
        telefone: ""
    });
    
    // Estados para alteração de senha
    const [editandoSenha, setEditandoSenha] = useState(false);
    const [formSenha, setFormSenha] = useState({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: ""
    });
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    useEffect(() => {
        carregarPerfil();
    }, []);

    const carregarPerfil = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await usuarioService.getPerfil();
            setPerfil(data);
            setFormPerfil({
                nome: data.nome,
                telefone: data.telefone || ""
            });
        } catch (err: any) {
            console.error("Erro ao carregar perfil:", err);
            setError(err.response?.data?.error || "Erro ao carregar dados do perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleAtualizarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Normalizar nome e telefone removendo espaços no início e fim
        const nomeNormalizado = formPerfil.nome.trim();
        const telefoneNormalizado = formPerfil.telefone.trim();

        if (!nomeNormalizado) {
            setError("Nome é obrigatório");
            return;
        }

        try {
            const data: UpdatePerfilData = {
                nome: nomeNormalizado,
                telefone: telefoneNormalizado || undefined
            };
            
            const response = await usuarioService.updatePerfil(data);
            setPerfil(response.usuario);
            setEditandoPerfil(false);
            setSuccess("Perfil atualizado com sucesso!");
            
            // Atualizar usuário no contexto
            updateUser({
                nome: response.usuario.nome,
                telefone: response.usuario.telefone
            });
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao atualizar perfil:", err);
            setError(err.response?.data?.error || "Erro ao atualizar perfil");
        }
    };

    const handleAlterarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Normalizar senhas removendo espaços no início e fim
        const senhaAtualNormalizada = formSenha.senhaAtual.trim();
        const novaSenhaNormalizada = formSenha.novaSenha.trim();
        const confirmarSenhaNormalizada = formSenha.confirmarSenha.trim();

        if (!senhaAtualNormalizada || !novaSenhaNormalizada || !confirmarSenhaNormalizada) {
            setError("Preencha todos os campos de senha");
            return;
        }

        if (novaSenhaNormalizada.length < 6) {
            setError("A nova senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (novaSenhaNormalizada !== confirmarSenhaNormalizada) {
            setError("As senhas não coincidem");
            return;
        }

        try {
            const data: AlterarSenhaData = {
                senhaAtual: senhaAtualNormalizada,
                novaSenha: novaSenhaNormalizada
            };
            
            await usuarioService.alterarSenha(data);
            setEditandoSenha(false);
            setFormSenha({
                senhaAtual: "",
                novaSenha: "",
                confirmarSenha: ""
            });
            setSuccess("Senha alterada com sucesso!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao alterar senha:", err);
            setError(err.response?.data?.error || "Erro ao alterar senha");
        }
    };

    const handleLogout = () => {
        if (confirm("Tem certeza que deseja sair?")) {
            logout();
            navigate("/login");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/cliente/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <User className="text-blue-600" size={32} />
                                    Configurações
                                </h1>
                                <p className="text-gray-600">Gerencie suas informações pessoais e segurança</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensagens */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-green-600" size={20} />
                        <p className="text-green-700">{success}</p>
                        <button
                            onClick={() => setSuccess("")}
                            className="ml-auto text-green-600 hover:text-green-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Dados Pessoais */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="text-blue-600" size={24} />
                            Dados Pessoais
                        </h2>
                        {!editandoPerfil && (
                            <button
                                onClick={() => setEditandoPerfil(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit2 size={18} />
                                Editar
                            </button>
                        )}
                    </div>

                    {editandoPerfil ? (
                        <form onSubmit={handleAtualizarPerfil} className="space-y-4">
                            <Input
                                label="Nome Completo"
                                name="nome"
                                value={formPerfil.nome}
                                onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={perfil?.email || ""}
                                disabled
                                className="bg-gray-100 cursor-not-allowed"
                            />
                            <Input
                                label="Telefone"
                                name="telefone"
                                value={formPerfil.telefone}
                                onChange={(e) => setFormPerfil({ ...formPerfil, telefone: e.target.value })}
                                placeholder="(00) 00000-0000"
                            />
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditandoPerfil(false);
                                        setFormPerfil({
                                            nome: perfil?.nome || "",
                                            telefone: perfil?.telefone || ""
                                        });
                                        setError("");
                                    }}
                                    className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label htmlFor="perfil-nome-view" className="text-sm font-medium text-gray-500">Nome Completo</label>
                                <p id="perfil-nome-view" className="text-lg text-gray-800 mt-1">{perfil?.nome}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label htmlFor="perfil-email-view" className="text-sm font-medium text-gray-500">Email</label>
                                <p id="perfil-email-view" className="text-lg text-gray-800 mt-1">{perfil?.email}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label htmlFor="perfil-telefone-view" className="text-sm font-medium text-gray-500">Telefone</label>
                                <p id="perfil-telefone-view" className="text-lg text-gray-800 mt-1">{perfil?.telefone || "Não informado"}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Alteração de Senha */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Lock className="text-purple-600" size={24} />
                            Segurança
                        </h2>
                        {!editandoSenha && (
                            <button
                                onClick={() => setEditandoSenha(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Edit2 size={18} />
                                Alterar Senha
                            </button>
                        )}
                    </div>

                    {editandoSenha ? (
                        <form onSubmit={handleAlterarSenha} className="space-y-4">
                            <div>
                                <label htmlFor="senha-atual" className="block text-sm font-medium text-gray-700 mb-2">
                                    Senha Atual
                                </label>
                                <div className="relative">
                                    <Input
                                        name="senhaAtual"
                                        id="senha-atual"
                                        type={mostrarSenhaAtual ? "text" : "password"}
                                        value={formSenha.senhaAtual}
                                        onChange={(e) => setFormSenha({ ...formSenha, senhaAtual: e.target.value })}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            setFormSenha({ ...formSenha, senhaAtual: target.value });
                                        }}
                                        autoComplete="current-password"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {mostrarSenhaAtual ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="nova-senha" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nova Senha
                                </label>
                                <div className="relative">
                                    <Input
                                        name="novaSenha"
                                        id="nova-senha"
                                        type={mostrarNovaSenha ? "text" : "password"}
                                        value={formSenha.novaSenha}
                                        onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            setFormSenha({ ...formSenha, novaSenha: target.value });
                                        }}
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {mostrarNovaSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmar-senha" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                    <Input
                                        name="confirmarSenha"
                                        id="confirmar-senha"
                                        type={mostrarConfirmarSenha ? "text" : "password"}
                                        value={formSenha.confirmarSenha}
                                        onChange={(e) => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            setFormSenha({ ...formSenha, confirmarSenha: target.value });
                                        }}
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditandoSenha(false);
                                        setFormSenha({
                                            senhaAtual: "",
                                            novaSenha: "",
                                            confirmarSenha: ""
                                        });
                                        setError("");
                                    }}
                                    className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Sua senha está protegida. Clique em "Alterar Senha" para modificá-la.</p>
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                                <LogOut className="text-red-600" size={24} />
                                Sair da Conta
                            </h2>
                            <p className="text-gray-600">Encerre sua sessão atual no sistema</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
