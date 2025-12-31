import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { agendamentosApi } from "../../services/agendamentoProfissionalService";
import { DollarSign, TrendingUp, Calendar, Package, Filter, AlertCircle, BarChart3, RefreshCw, ArrowLeft } from "lucide-react";

interface FaturamentoData {
    resumo: {
        totalReceita: number;
        totalServicos: number;
        periodo: string;
    };
    porServico: Array<{
        nome: string;
        quantidade: number;
        receita: number;
    }>;
    porData: Array<{
        data: string;
        quantidade: number;
        receita: number;
    }>;
    porMes: Array<{
        mes: string;
        quantidade: number;
        receita: number;
    }>;
    agendamentos: Array<{
        id: number;
        servico: string;
        cliente: string;
        data: string;
        hora: string;
        preco: number;
        duracao: string;
    }>;
}

export default function Faturamento() {
    const navigate = useNavigate();
    const [data, setData] = useState<FaturamentoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [periodo, setPeriodo] = useState<'dia' | 'mes' | 'ano' | 'tudo'>('tudo');

    const carregarFaturamento = useCallback(async (periodoAtual: 'dia' | 'mes' | 'ano' | 'tudo') => {
        try {
            setLoading(true);
            setError("");
            console.log('[FRONTEND] Carregando faturamento para período:', periodoAtual);
            const faturamento = await agendamentosApi.faturamento(periodoAtual);
            console.log('[FRONTEND] Resposta do backend:', faturamento);
            
            // Validar estrutura de dados antes de definir
            if (faturamento && typeof faturamento === 'object') {
                // Garantir estrutura válida
                const dadosValidados = {
                    resumo: faturamento.resumo || {
                        totalReceita: 0,
                        totalServicos: 0,
                        periodo: periodoAtual
                    },
                    porServico: Array.isArray(faturamento.porServico) ? faturamento.porServico : [],
                    porData: Array.isArray(faturamento.porData) ? faturamento.porData : [],
                    porMes: Array.isArray(faturamento.porMes) ? faturamento.porMes : [],
                    agendamentos: Array.isArray(faturamento.agendamentos) ? faturamento.agendamentos : []
                };
                setData(dadosValidados);
            } else {
                // Se os dados não vieram no formato esperado, criar estrutura vazia
                setData({
                    resumo: {
                        totalReceita: 0,
                        totalServicos: 0,
                        periodo: periodoAtual
                    },
                    porServico: [],
                    porData: [],
                    porMes: [],
                    agendamentos: []
                });
            }
        } catch (err: any) {
            console.error("Erro ao carregar faturamento:", err);
            setError(err.response?.data?.error || err.message || "Erro ao carregar dados de faturamento");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarFaturamento(periodo);
    }, [periodo, carregarFaturamento]);

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Carregando dados de faturamento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="flex items-center gap-2 text-red-600 mb-4">
                        <AlertCircle size={24} />
                        <p className="font-semibold">Erro</p>
                    </div>
                    <p className="text-red-600 text-center mb-4">{error}</p>
                    <button
                        onClick={() => carregarFaturamento(periodo)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !data.resumo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <p className="text-lg text-gray-700">Nenhum dado disponível</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Recarregar página
                    </button>
                </div>
            </div>
        );
    }

    // Valores padrão para evitar erros
    const resumo = data.resumo || {
        totalReceita: 0,
        totalServicos: 0,
        periodo: periodo
    };
    const porServico = data.porServico || [];
    const porData = data.porData || [];
    const porMes = data.porMes || [];
    const agendamentos = data.agendamentos || [];

    // Verificar se há dados (agendamentos ou estatísticas)
    const temDados = resumo.totalServicos > 0 || agendamentos.length > 0 || porServico.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profissional/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    Faturamento
                                </h1>
                                <p className="text-gray-600">
                                    Análise detalhada dos seus serviços concluídos
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                <Filter size={20} className="text-gray-600" />
                                <select
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value as any)}
                                    className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
                                >
                                    <option value="dia">Hoje</option>
                                    <option value="mes">Este Mês</option>
                                    <option value="ano">Este Ano</option>
                                    <option value="tudo">Todo Período</option>
                                </select>
                            </div>
                            <button
                                onClick={() => carregarFaturamento(periodo)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Atualizar dados"
                            >
                                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                                <span className="font-medium hidden sm:inline">Atualizar</span>
                            </button>
                            <button
                                onClick={() => navigate(`/profissional/faturamento/graficos?periodo=${periodo}`)}
                                disabled={!temDados}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg ${
                                    temDados 
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-50"
                                }`}
                                title={temDados ? "Ver gráficos detalhados" : "Nenhum dado disponível para gráficos"}
                            >
                                <BarChart3 size={20} />
                                <span className="font-medium">Ver Gráficos</span>
                            </button>
                        </div>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign size={32} />
                                <span className="text-2xl font-bold">
                                    {formatarMoeda(resumo.totalReceita)}
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm">Receita Total</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <Package size={32} />
                                <span className="text-2xl font-bold">
                                    {resumo.totalServicos}
                                </span>
                            </div>
                            <p className="text-green-100 text-sm">Serviços Concluídos</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp size={32} />
                                <span className="text-2xl font-bold">
                                    {resumo.totalServicos > 0
                                        ? formatarMoeda(resumo.totalReceita / resumo.totalServicos)
                                        : formatarMoeda(0)}
                                </span>
                            </div>
                            <p className="text-purple-100 text-sm">Ticket Médio</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar size={32} />
                                <span className="text-2xl font-bold">
                                    {porServico.length}
                                </span>
                            </div>
                            <p className="text-orange-100 text-sm">Tipos de Serviços</p>
                        </div>
                    </div>
                </div>

                {/* Mensagem quando não há dados */}
                {!temDados && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <AlertCircle size={48} className="mx-auto text-yellow-600 mb-4" />
                        <p className="text-yellow-800 text-lg font-semibold mb-2">
                            Nenhum serviço concluído encontrado
                        </p>
                        <p className="text-yellow-600 text-sm mb-4">
                            Os dados aparecerão quando houver serviços concluídos no período selecionado.
                        </p>
                        <p className="text-yellow-700 text-sm font-medium">
                            💡 Dica: Marque os agendamentos como "Concluído" na página de Agendamentos para que apareçam aqui.
                        </p>
                        <button
                            onClick={() => carregarFaturamento(periodo)}
                            disabled={loading}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all mx-auto disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            <span>Atualizar Dados</span>
                        </button>
                    </div>
                )}

                {/* Resumo Rápido */}
                {temDados && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Resumo Executivo
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-blue-600 font-medium mb-1">Tipos de Serviços</p>
                                <p className="text-2xl font-bold text-blue-800">{porServico.length}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-sm text-green-600 font-medium mb-1">Período Analisado</p>
                                <p className="text-lg font-bold text-green-800 capitalize">{resumo.periodo}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p className="text-sm text-purple-600 font-medium mb-1">Ticket Médio</p>
                                <p className="text-lg font-bold text-purple-800">
                                    {resumo.totalServicos > 0
                                        ? formatarMoeda(resumo.totalReceita / resumo.totalServicos)
                                        : formatarMoeda(0)}
                                </p>
                            </div>
                        </div>
                        {temDados && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">
                                    Para visualizar gráficos detalhados e análises avançadas, clique no botão "Ver Gráficos" acima.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tabela de Agendamentos */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Detalhamento dos Serviços ({agendamentos.length})
                    </h2>
                    
                    {/* Versão Desktop - Tabela */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Serviço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duração
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {agendamentos.map((ag) => (
                                    <tr key={ag.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{formatarData(ag.data)}</div>
                                            <div className="text-gray-500 text-xs">{ag.hora}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ag.cliente}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ag.servico}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ag.duracao}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            {formatarMoeda(ag.preco)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {agendamentos.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum serviço concluído no período selecionado
                            </div>
                        )}
                    </div>

                    {/* Versão Mobile - Cards */}
                    <div className="md:hidden space-y-4">
                        {agendamentos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum serviço concluído no período selecionado
                            </div>
                        ) : (
                            agendamentos.map((ag) => (
                                <div key={ag.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{ag.servico}</h3>
                                                <p className="text-sm text-gray-500">{ag.cliente}</p>
                                            </div>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatarMoeda(ag.preco)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                                            <span>{formatarData(ag.data)}</span>
                                            <span>{ag.hora}</span>
                                            <span>{ag.duracao}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
