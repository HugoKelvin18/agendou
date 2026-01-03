import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, DollarSign, Users, Package, Calendar, AlertTriangle } from "lucide-react";
import { adminService, BusinessAdmin } from "../../services/adminService";
import ModernHeader from "../../components/ui/ModernHeader";

export default function BusinessDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<BusinessAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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
        } catch (err) {
            console.error("Erro ao liberar:", err);
            alert("Erro ao liberar business");
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
            <ModernHeader />
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Usuários</p>
                                <p className="text-2xl font-bold">{business.metricas.totalUsuarios}</p>
                                {business.limiteUsuarios && (
                                    <p className="text-xs text-gray-500">Limite: {business.limiteUsuarios}</p>
                                )}
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Profissionais</p>
                                <p className="text-2xl font-bold">{business.metricas.totalProfissionais}</p>
                                {business.limiteProfissionais && (
                                    <p className="text-xs text-gray-500">Limite: {business.limiteProfissionais}</p>
                                )}
                            </div>
                            <Users className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Serviços</p>
                                <p className="text-2xl font-bold">{business.metricas.totalServicos}</p>
                                {business.limiteServicos && (
                                    <p className="text-xs text-gray-500">Limite: {business.limiteServicos}</p>
                                )}
                            </div>
                            <Package className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Agendamentos (Mês)</p>
                                <p className="text-2xl font-bold">{business.metricas.agendamentosMes}</p>
                                {business.limiteAgendamentos && (
                                    <p className="text-xs text-gray-500">Limite: {business.limiteAgendamentos}</p>
                                )}
                            </div>
                            <Calendar className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Ações</h2>
                    <div className="flex gap-4">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
