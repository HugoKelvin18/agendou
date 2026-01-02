import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { usuarioService, Usuario, UpdatePerfilData, AlterarSenhaData } from "../../services/usuarioService";
import Input from "../../components/forms/Input";
import { User, Lock, LogOut, Edit2, Save, X, Eye, EyeOff, AlertCircle, ArrowLeft, MessageSquare, MapPin, Phone, Mail, Instagram, Facebook, Globe, Linkedin } from "lucide-react";

export default function ConfiguracoesProfissional() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Estados para edição de perfil
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [editandoMensagem, setEditandoMensagem] = useState(false);
    const [editandoContato, setEditandoContato] = useState(false);
    const [formPerfil, setFormPerfil] = useState({
        nome: "",
        telefone: "",
        mensagemPublica: "",
        cidade: "",
        bairro: "",
        endereco: "",
        numero: "",
        complemento: "",
        uf: "",
        cep: "",
        whatsapp: "",
        emailPublico: "",
        instagram: "",
        facebook: "",
        tiktok: "",
        site: "",
        linkedin: ""
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
                telefone: data.telefone || "",
                mensagemPublica: data.mensagemPublica || "",
                cidade: data.cidade || "",
                bairro: data.bairro || "",
                endereco: data.endereco || "",
                numero: data.numero || "",
                complemento: data.complemento || "",
                uf: data.uf || "",
                cep: data.cep || "",
                whatsapp: data.whatsapp || "",
                emailPublico: data.emailPublico || "",
                instagram: data.instagram || "",
                facebook: data.facebook || "",
                tiktok: data.tiktok || "",
                site: data.site || "",
                linkedin: data.linkedin || ""
            });
        } catch (err: any) {
            console.error("Erro ao carregar perfil:", err);
            setError(err.response?.data?.error || "Erro ao carregar dados do perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleAtualizarPerfil = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");
        setSuccess("");

        // Normalizar nome e telefone removendo espaços no início e fim
        const nomeNormalizado = formPerfil.nome.trim();
        const telefoneNormalizado = formPerfil.telefone.trim();

        if (!nomeNormalizado && !editandoMensagem && !editandoContato) {
            setError("Nome é obrigatório");
            return;
        }

        try {
            const data: UpdatePerfilData = {
                nome: nomeNormalizado || perfil?.nome || "",
                telefone: telefoneNormalizado || perfil?.telefone || undefined,
                mensagemPublica: formPerfil.mensagemPublica?.trim() || undefined,
                cidade: formPerfil.cidade?.trim() || undefined,
                bairro: formPerfil.bairro?.trim() || undefined,
                endereco: formPerfil.endereco?.trim() || undefined,
                numero: formPerfil.numero?.trim() || undefined,
                complemento: formPerfil.complemento?.trim() || undefined,
                uf: formPerfil.uf?.trim() || undefined,
                cep: formPerfil.cep?.trim() || undefined,
                whatsapp: formPerfil.whatsapp?.trim() || undefined,
                emailPublico: formPerfil.emailPublico?.trim() || undefined,
                instagram: formPerfil.instagram?.trim() || undefined,
                facebook: formPerfil.facebook?.trim() || undefined,
                tiktok: formPerfil.tiktok?.trim() || undefined,
                site: formPerfil.site?.trim() || undefined,
                linkedin: formPerfil.linkedin?.trim() || undefined
            };
            
            const response = await usuarioService.updatePerfil(data);
            setPerfil(response);
            setEditandoPerfil(false);
            setEditandoMensagem(false);
            setEditandoContato(false);
            setSuccess("Perfil atualizado com sucesso!");
            
            // Atualizar usuário no contexto
            updateUser({
                nome: response.nome,
                telefone: response.telefone
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profissional/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <User className="text-blue-600" size={32} />
                                    Configurações
                                </h1>
                                <p className="text-sm md:text-base text-gray-600">Gerencie suas informações pessoais e segurança</p>
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
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="text-blue-600" size={24} />
                            Dados Pessoais
                        </h2>
                        {!editandoPerfil && (
                            <button
                                onClick={() => setEditandoPerfil(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                                onChange={() => {}}
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
                                        setFormPerfil(prev => ({
                                            ...prev,
                                            nome: perfil?.nome || "",
                                            telefone: perfil?.telefone || "",
                                            mensagemPublica: perfil?.mensagemPublica || ""
                                        }));
                                        setError("");
                                    }}
                                    className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

                {/* Mensagem para Clientes */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={24} />
                            Mensagem para Clientes
                        </h2>
                        {!editandoMensagem && (
                            <button
                                onClick={() => {
                                    setEditandoMensagem(true);
                                    setFormPerfil(prev => ({
                                        ...prev,
                                        mensagemPublica: perfil?.mensagemPublica || ""
                                    }));
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <Edit2 size={18} />
                                {perfil?.mensagemPublica ? "Editar mensagem" : "Adicionar mensagem"}
                            </button>
                        )}
                    </div>

                    {editandoMensagem ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mensagemPublica" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensagem para Clientes
                                </label>
                                <textarea
                                    id="mensagemPublica"
                                    name="mensagemPublica"
                                    value={formPerfil.mensagemPublica}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, mensagemPublica: e.target.value })}
                                    placeholder="Ex: Estou disponível de segunda a sexta das 9h às 18h. Entre em contato!"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Esta mensagem será exibida como notificação para clientes que têm agendamentos com você.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditandoMensagem(false);
                                        setFormPerfil(prev => ({
                                            ...prev,
                                            mensagemPublica: perfil?.mensagemPublica || ""
                                        }));
                                        setError("");
                                    }}
                                    className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAtualizarPerfil()}
                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-base text-gray-800">
                                {perfil?.mensagemPublica || "Nenhuma mensagem configurada. Clique em 'Adicionar mensagem' para criar uma mensagem que será exibida para seus clientes."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Contato e Localização do Profissional */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-green-600" size={24} />
                            Contato e Localização
                        </h2>
                        {!editandoContato && (
                            <button
                                onClick={() => {
                                    setEditandoContato(true);
                                    setFormPerfil(prev => ({
                                        ...prev,
                                        cidade: perfil?.cidade || "",
                                        bairro: perfil?.bairro || "",
                                        endereco: perfil?.endereco || "",
                                        numero: perfil?.numero || "",
                                        complemento: perfil?.complemento || "",
                                        uf: perfil?.uf || "",
                                        cep: perfil?.cep || "",
                                        whatsapp: perfil?.whatsapp || "",
                                        emailPublico: perfil?.emailPublico || "",
                                        instagram: perfil?.instagram || "",
                                        facebook: perfil?.facebook || "",
                                        tiktok: perfil?.tiktok || "",
                                        site: perfil?.site || "",
                                        linkedin: perfil?.linkedin || ""
                                    }));
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Edit2 size={18} />
                                Editar
                            </button>
                        )}
                    </div>

                    {editandoContato ? (
                        <form onSubmit={handleAtualizarPerfil} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Cidade"
                                    name="cidade"
                                    value={formPerfil.cidade}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, cidade: e.target.value })}
                                    placeholder="Ex: São Paulo"
                                />
                                <Input
                                    label="Bairro"
                                    name="bairro"
                                    value={formPerfil.bairro}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, bairro: e.target.value })}
                                    placeholder="Ex: Centro"
                                />
                                <Input
                                    label="Endereço"
                                    name="endereco"
                                    value={formPerfil.endereco}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, endereco: e.target.value })}
                                    placeholder="Ex: Rua das Flores"
                                />
                                <Input
                                    label="Número"
                                    name="numero"
                                    value={formPerfil.numero}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, numero: e.target.value })}
                                    placeholder="Ex: 123"
                                />
                                <Input
                                    label="Complemento"
                                    name="complemento"
                                    value={formPerfil.complemento}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, complemento: e.target.value })}
                                    placeholder="Ex: Apto 45"
                                />
                                <Input
                                    label="UF"
                                    name="uf"
                                    value={formPerfil.uf}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, uf: e.target.value.toUpperCase() })}
                                    placeholder="Ex: SP"
                                    maxLength={2}
                                />
                                <Input
                                    label="CEP"
                                    name="cep"
                                    value={formPerfil.cep}
                                    onChange={(e) => setFormPerfil({ ...formPerfil, cep: e.target.value })}
                                    placeholder="Ex: 01234-567"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Phone className="text-blue-600" size={20} />
                                    Contatos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="WhatsApp"
                                        name="whatsapp"
                                        value={formPerfil.whatsapp}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, whatsapp: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                    <Input
                                        label="Email Público"
                                        name="emailPublico"
                                        type="email"
                                        value={formPerfil.emailPublico}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, emailPublico: e.target.value })}
                                        placeholder="contato@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Globe className="text-purple-600" size={20} />
                                    Redes Sociais
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Instagram"
                                        name="instagram"
                                        value={formPerfil.instagram}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, instagram: e.target.value })}
                                        placeholder="@seuinstagram"
                                    />
                                    <Input
                                        label="Facebook"
                                        name="facebook"
                                        value={formPerfil.facebook}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, facebook: e.target.value })}
                                        placeholder="facebook.com/seuperfil"
                                    />
                                    <Input
                                        label="TikTok"
                                        name="tiktok"
                                        value={formPerfil.tiktok}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, tiktok: e.target.value })}
                                        placeholder="@seutiktok"
                                    />
                                    <Input
                                        label="Site"
                                        name="site"
                                        type="url"
                                        value={formPerfil.site}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, site: e.target.value })}
                                        placeholder="https://seusite.com"
                                    />
                                    <Input
                                        label="LinkedIn"
                                        name="linkedin"
                                        value={formPerfil.linkedin}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, linkedin: e.target.value })}
                                        placeholder="linkedin.com/in/seuperfil"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditandoContato(false);
                                        setFormPerfil(prev => ({
                                            ...prev,
                                            cidade: perfil?.cidade || "",
                                            bairro: perfil?.bairro || "",
                                            endereco: perfil?.endereco || "",
                                            numero: perfil?.numero || "",
                                            complemento: perfil?.complemento || "",
                                            uf: perfil?.uf || "",
                                            cep: perfil?.cep || "",
                                            whatsapp: perfil?.whatsapp || "",
                                            emailPublico: perfil?.emailPublico || "",
                                            instagram: perfil?.instagram || "",
                                            facebook: perfil?.facebook || "",
                                            tiktok: perfil?.tiktok || "",
                                            site: perfil?.site || "",
                                            linkedin: perfil?.linkedin || ""
                                        }));
                                        setError("");
                                    }}
                                    className="px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <MapPin className="text-green-600" size={20} />
                                    Localização
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {perfil?.cidade && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500">Cidade</p>
                                            <p className="text-sm font-medium text-gray-800">{perfil.cidade}</p>
                                        </div>
                                    )}
                                    {perfil?.bairro && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500">Bairro</p>
                                            <p className="text-sm font-medium text-gray-800">{perfil.bairro}</p>
                                        </div>
                                    )}
                                    {(perfil?.endereco || perfil?.numero) && (
                                        <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                                            <p className="text-xs text-gray-500">Endereço</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {[perfil.endereco, perfil.numero, perfil.complemento].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                    )}
                                    {(perfil?.uf || perfil?.cep) && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500">UF / CEP</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {[perfil.uf, perfil.cep].filter(Boolean).join(" - ")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(perfil?.whatsapp || perfil?.emailPublico) && (
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Phone className="text-blue-600" size={20} />
                                        Contatos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {perfil?.whatsapp && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500">WhatsApp</p>
                                                <p className="text-sm font-medium text-gray-800">{perfil.whatsapp}</p>
                                            </div>
                                        )}
                                        {perfil?.emailPublico && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500">Email Público</p>
                                                <p className="text-sm font-medium text-gray-800">{perfil.emailPublico}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(perfil?.instagram || perfil?.facebook || perfil?.tiktok || perfil?.site || perfil?.linkedin) && (
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Globe className="text-purple-600" size={20} />
                                        Redes Sociais
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {perfil?.instagram && (
                                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <Instagram className="text-pink-600" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500">Instagram</p>
                                                    <p className="text-sm font-medium text-gray-800">{perfil.instagram}</p>
                                                </div>
                                            </div>
                                        )}
                                        {perfil?.facebook && (
                                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <Facebook className="text-blue-600" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500">Facebook</p>
                                                    <p className="text-sm font-medium text-gray-800">{perfil.facebook}</p>
                                                </div>
                                            </div>
                                        )}
                                        {perfil?.tiktok && (
                                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <div className="w-[18px] h-[18px] bg-black rounded-sm flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">T</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">TikTok</p>
                                                    <p className="text-sm font-medium text-gray-800">{perfil.tiktok}</p>
                                                </div>
                                            </div>
                                        )}
                                        {perfil?.site && (
                                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <Globe className="text-blue-600" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500">Site</p>
                                                    <a href={perfil.site.startsWith("http") ? perfil.site : `https://${perfil.site}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                                        {perfil.site}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {perfil?.linkedin && (
                                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <Linkedin className="text-blue-700" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500">LinkedIn</p>
                                                    <p className="text-sm font-medium text-gray-800">{perfil.linkedin}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!perfil?.cidade && !perfil?.whatsapp && !perfil?.instagram && (
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">
                                        Nenhuma informação de contato ou localização cadastrada. Clique em "Editar" para adicionar.
                                    </p>
                                </div>
                            )}
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
                                className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                    <Input
                                        name="confirmarSenha"
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
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
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
