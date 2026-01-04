import React, { useState, useEffect } from 'react';
import { Building2, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, Settings, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminService, BusinessAdmin } from "../../services/adminService";
import ModernHeader from "../../components/ui/ModernHeader";

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [businesses, setBusinesses] = useState<BusinessAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        carregarBusinesses();
    }, []);

    // Recarregar quando voltar de outra página
    useEffect(() => {
        if (location.pathname === "/admin/dashboard") {
            carregarBusinesses();
        }
    }, [location.pathname]);

    // Atualizar quando a janela recebe foco (usuário volta para a aba)
    useEffect(() => {
        const handleFocus = () => {
            carregarBusinesses();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const carregarBusinesses = async () => {
        try {
            setLoading(true);
            // Forçar busca sem cache adicionando timestamp
            const dados = await adminService.listarBusinesses();
            console.log("Businesses carregados:", dados.length);
            setBusinesses(dados);
        } catch (err) {
            console.error("Erro ao carregar businesses:", err);
            setError("Erro ao carregar businesses. Tente novamente.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await carregarBusinesses();
    };

    // Calcular estatísticas (garantir que businesses seja array)
    const businessesArray = Array.isArray(businesses) ? businesses : [];
    const totalBusinesses = businessesArray.length;
    const businessesAtivos = businessesArray.filter(b => b.statusPagamento === "ATIVO").length;
    const businessesBloqueados = businessesArray.filter(b => b.statusPagamento === "BLOQUEADO").length;
    const businessesInadimplentes = businessesArray.filter(b => b.statusPagamento === "INADIMPLENTE").length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ATIVO": return "text-green-600 bg-green-50";
            case "INADIMPLENTE": return "text-yellow-600 bg-yellow-50";
            case "BLOQUEADO": return "text-red-600 bg-red-50";
            case "CANCELADO": return "text-gray-600 bg-gray-50";
            default: return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ATIVO": return <CheckCircle className="w-4 h-4" />;
            case "INADIMPLENTE": return <Clock className="w-4 h-4" />;
            case "BLOQUEADO": return <XCircle className="w-4 h-4" />;
            case "CANCELADO": return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // Renderização segura mesmo com erros
    if (loading && businessesArray.length === 0 && !error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ModernHeader role="ADMIN" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader role="ADMIN" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                        <p className="mt-2 text-gray-600">Gerencie businesses, planos e cobranças</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                        <button
                            onClick={() => navigate("/admin/solicitacoes-pendentes")}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            Solicitações Pendentes
                        </button>
                        <button
                            onClick={() => navigate("/admin/configuracoes")}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Configurações
                        </button>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total de Businesses</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalBusinesses}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Businesses Ativos</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{businessesAtivos}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bloqueados</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{businessesBloqueados}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Lista de Businesses */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Businesses</h2>
                    </div>
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Carregando...</div>
                    ) : businesses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Nenhum business encontrado</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plano
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vencimento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {businesses.map((business) => (
                                        <tr key={business.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {business.codigoAcesso || business.nome || "Sem nome"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{business.slug}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{business.plano || "FREE"}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(business.statusPagamento)}`}>
                                                    {getStatusIcon(business.statusPagamento)}
                                                    {business.statusPagamento}
                                                </span>
                                                {business.metricas?.diasAtraso !== null && business.metricas?.diasAtraso !== undefined && business.metricas.diasAtraso > 0 && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {business.metricas.diasAtraso} dias em atraso
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {business.vencimento 
                                                    ? new Date(business.vencimento).toLocaleDateString("pt-BR")
                                                    : "-"
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {business.metricas?.totalProfissionais || 0} profissionais
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/admin/businesses/${business.id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Ver detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
