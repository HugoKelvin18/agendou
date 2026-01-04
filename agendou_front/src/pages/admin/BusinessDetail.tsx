import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, DollarSign, AlertTriangle, MessageSquare, Settings, X, Save } from "lucide-react";
import { adminService, BusinessAdmin } from "../../services/adminService";
import { suporteService, SolicitacaoSuporte } from "../../services/suporteService";
import ModernHeader from "../../components/ui/ModernHeader";

export default function BusinessDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<BusinessAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showMensagem, setShowMensagem] = useState(false);
    const [showPlano, setShowPlano] = useState(false);
    const [mensagemForm, setMensagemForm] = useState({ mensagem: "" });
    const [planoForm, setPlanoForm] = useState({ plano: "", limiteProfissionais: "" });

    useEffect(() => {
        if (id) {
            carregarBusiness();
        }
    }, [id]);

    const carregarBusiness = async () => {
        try {
            setLoading(true);
            const dados = await adminService.obterBusiness(parseInt(id!));
            setBusiness(dados);
        } catch (err) {
            console.error("Erro ao carregar business:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBloquear = async () => {
        if (!confirm("Tem certeza que deseja bloquear este business?")) return;
        try {
            setActionLoading(true);
            await adminService.bloquearBusiness(parseInt(id!));
            await carregarBusiness();
            // Voltar para o dashboard após atualizar
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Erro ao bloquear:", err);
            alert("Erro ao bloquear business");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLiberar = async () => {
        if (!confirm("Tem certeza que deseja liberar este business?")) return;
        try {
            setActionLoading(true);
            await adminService.liberarBusiness(parseInt(id!));
            await carregarBusiness();
            // Voltar para o dashboard após atualizar
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Erro ao liberar:", err);
            alert("Erro ao liberar business");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnviarMensagem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mensagemForm.mensagem.trim()) {
            alert("Digite uma mensagem");
            return;
        }
        try {
            setActionLoading(true);
            await adminService.enviarMensagem(parseInt(id!), mensagemForm.mensagem);
            alert("Mensagem enviada com sucesso!");
            setMensagemForm({ mensagem: "" });
            setShowMensagem(false);
            await carregarBusiness(); // Recarregar dados
        } catch (err: any) {
            console.error("Erro ao enviar mensagem:", err);
            alert(err.response?.data?.message || "Erro ao enviar mensagem");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAlterarPlano = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await adminService.atualizarPlano(
                parseInt(id!),
                planoForm.plano,
                {
                    limiteProfissionais: planoForm.limiteProfissionais ? parseInt(planoForm.limiteProfissionais) : undefined
                }
            );
            alert("Plano atualizado com sucesso!");
            setPlanoForm({ plano: "", limiteProfissionais: "" });
            setShowPlano(false);
            await carregarBusiness(); // Recarregar dados
        } catch (err: any) {
            console.error("Erro ao alterar plano:", err);
            alert(err.response?.data?.message || "Erro ao alterar plano");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ModernHeader />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">Carregando...</div>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ModernHeader />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">Business não encontrado</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader role="ADMIN" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </button>

                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">{business.nome}</h1>
                        <p className="text-gray-600">{business.slug}</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações Básicas</h3>
                                <div className="space-y-2">
                                    <div><span className="font-medium">Plano:</span> {business.plano || "FREE"}</div>
                                    <div><span className="font-medium">Status:</span> {business.statusPagamento}</div>
                                    <div><span className="font-medium">Ativo:</span> {business.ativo ? "Sim" : "Não"}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Financeiro</h3>
                                <div className="space-y-2">
                                    <div><span className="font-medium">Vencimento:</span> {business.vencimento ? new Date(business.vencimento).toLocaleDateString("pt-BR") : "-"}</div>
                                    <div><span className="font-medium">Último Pagamento:</span> {business.ultimoPagamento ? new Date(business.ultimoPagamento).toLocaleDateString("pt-BR") : "-"}</div>
                                    {business.metricas.diasAtraso !== null && business.metricas.diasAtraso > 0 && (
                                        <div className="text-red-600">
                                            <span className="font-medium">Dias em atraso:</span> {business.metricas.diasAtraso}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Solicitações de Suporte */}
                {business.solicitacoesSuporte && business.solicitacoesSuporte.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Solicitações de Suporte</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {business.solicitacoesSuporte.map((solicitacao: any) => (
                                    <div key={solicitacao.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="mb-2">
                                            <h3 className="font-semibold text-gray-900">{solicitacao.assunto}</h3>
                                            <p className="text-sm text-gray-600">
                                                Por: {solicitacao.usuario?.nome} • {new Date(solicitacao.criadoEm).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <p className="text-gray-700 mb-2">{solicitacao.descricao}</p>
                                        {solicitacao.resposta && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Resposta:</p>
                                                <p className="text-gray-800">{solicitacao.resposta}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Ações</h2>
                    <div className="flex flex-wrap gap-4">
                        {business.statusPagamento === "BLOQUEADO" ? (
                            <button
                                onClick={handleLiberar}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Liberar Business
                            </button>
                        ) : (
                            <button
                                onClick={handleBloquear}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                Bloquear Business
                            </button>
                        )}
                        <button
                            onClick={() => setShowMensagem(!showMensagem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Enviar Mensagem
                        </button>
                        <button
                            onClick={() => {
                                setShowPlano(!showPlano);
                                setPlanoForm({ plano: business.plano || "", limiteProfissionais: business.limiteProfissionais?.toString() || "" });
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Alterar Plano
                        </button>
                    </div>

                    {showMensagem && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Enviar Mensagem</h3>
                                <button onClick={() => setShowMensagem(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleEnviarMensagem}>
                                <textarea
                                    value={mensagemForm.mensagem}
                                    onChange={(e) => setMensagemForm({ mensagem: e.target.value })}
                                    placeholder="Digite sua mensagem para o business..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                                    required
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Enviar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMensagem(false);
                                            setMensagemForm({ mensagem: "" });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showPlano && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Alterar Plano</h3>
                                <button onClick={() => setShowPlano(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAlterarPlano}>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                                        <select
                                            value={planoForm.plano}
                                            onChange={(e) => setPlanoForm({ ...planoForm, plano: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="FREE">FREE</option>
                                            <option value="BASIC">BASIC</option>
                                            <option value="PRO">PRO</option>
                                            <option value="ENTERPRISE">ENTERPRISE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Profissionais</label>
                                        <input
                                            type="number"
                                            value={planoForm.limiteProfissionais}
                                            onChange={(e) => setPlanoForm({ ...planoForm, limiteProfissionais: e.target.value })}
                                            placeholder="Deixe vazio para ilimitado"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Salvar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPlano(false)}
                                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
