import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { agendamentosApi } from "../../services/agendamentoProfissionalService";
import { 
    DollarSign, 
    TrendingUp, 
    Calendar, 
    Package, 
    Filter, 
    AlertCircle, 
    ArrowLeft 
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#14B8A6'];

export default function FaturamentoGraficos() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const periodoFromUrl = searchParams.get('periodo') || 'mes';
    
    const [data, setData] = useState<FaturamentoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [periodo, setPeriodo] = useState<'dia' | 'mes' | 'ano' | 'tudo'>(periodoFromUrl as any);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const carregarFaturamento = useCallback(async (periodoAtual: 'dia' | 'mes' | 'ano' | 'tudo') => {
        try {
            setLoading(true);
            setError("");
            const faturamento = await agendamentosApi.faturamento(periodoAtual);
            
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        // Formatar como moeda se for receita
                        const isReceita = entry.name === "Receita (R$)" || entry.dataKey === "receita";
                        const formattedValue = entry.value !== undefined 
                            ? (typeof entry.value === 'number' && isReceita
                                ? formatarMoeda(entry.value)
                                : entry.value)
                            : '';
                        
                        return (
                            <p key={index} style={{ color: entry.color }} className="text-sm">
                                {entry.name}: {formattedValue}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-base md:text-lg text-gray-700">Carregando gráficos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-md">
                    <div className="flex items-center gap-2 text-red-600 mb-4">
                        <AlertCircle size={24} />
                        <p className="font-semibold">Erro</p>
                    </div>
                    <p className="text-red-600 text-center mb-4">{error}</p>
                    <button
                        onClick={() => carregarFaturamento(periodo)}
                        className="w-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
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
                    <p className="text-base md:text-lg text-gray-700 mb-4">Nenhum dado disponível</p>
                    <button
                        onClick={() => navigate('/profissional/faturamento')}
                        className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                        Voltar para Faturamento
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

    const temDados = resumo.totalServicos > 0;

    // Preparar dados para os gráficos
    const dadosGraficoLinha = porData.map(item => ({
        data: formatarData(item.data),
        receita: item.receita,
        quantidade: item.quantidade
    }));

    const dadosGraficoPizza = porServico.map(servico => ({
        name: servico.nome,
        value: servico.receita
    }));

    const dadosGraficoBarrasServico = porServico.map(servico => ({
        nome: servico.nome.length > 15 ? servico.nome.substring(0, 15) + '...' : servico.nome,
        quantidade: servico.quantidade,
        receita: servico.receita
    }));

    const dadosGraficoBarrasMes = porMes.map(mes => ({
        mes: mes.mes,
        quantidade: mes.quantidade,
        receita: mes.receita
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profissional/faturamento')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                    Gráficos e Análises
                                </h1>
                                <p className="text-sm md:text-base text-gray-600">
                                    Visualização detalhada dos serviços concluídos
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 w-full sm:w-auto">
                                <Filter size={20} className="text-gray-600" />
                                <select
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value as any)}
                                    className="bg-transparent border-none outline-none text-xs md:text-sm text-gray-700 font-medium cursor-pointer w-full sm:w-auto"
                                >
                                    <option value="dia">Hoje</option>
                                    <option value="mes">Este Mês</option>
                                    <option value="ano">Este Ano</option>
                                    <option value="tudo">Todo Período</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign size={24} className="w-6 h-6 md:w-8 md:h-8" />
                                <span className="text-xl md:text-2xl font-bold">
                                    {formatarMoeda(resumo.totalReceita)}
                                </span>
                            </div>
                            <p className="text-blue-100 text-xs md:text-sm">Receita Total</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <Package size={24} className="w-6 h-6 md:w-8 md:h-8" />
                                <span className="text-xl md:text-2xl font-bold">
                                    {resumo.totalServicos}
                                </span>
                            </div>
                            <p className="text-green-100 text-xs md:text-sm">Serviços Concluídos</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp size={24} className="w-6 h-6 md:w-8 md:h-8" />
                                <span className="text-xl md:text-2xl font-bold">
                                    {resumo.totalServicos > 0
                                        ? formatarMoeda(resumo.totalReceita / resumo.totalServicos)
                                        : formatarMoeda(0)}
                                </span>
                            </div>
                            <p className="text-purple-100 text-xs md:text-sm">Ticket Médio</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar size={24} className="w-6 h-6 md:w-8 md:h-8" />
                                <span className="text-xl md:text-2xl font-bold">
                                    {porServico.length}
                                </span>
                            </div>
                            <p className="text-orange-100 text-xs md:text-sm">Tipos de Serviços</p>
                        </div>
                    </div>
                </div>

                {/* Mensagem quando não há dados */}
                {!temDados && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-6 text-center">
                        <AlertCircle size={48} className="mx-auto text-yellow-600 mb-4" />
                        <p className="text-yellow-800 text-base md:text-lg font-semibold mb-2">
                            Nenhum serviço concluído encontrado
                        </p>
                        <p className="text-yellow-600 text-xs md:text-sm mb-4">
                            Os gráficos aparecerão quando houver serviços concluídos no período selecionado.
                        </p>
                        <button
                            onClick={() => navigate('/profissional/faturamento')}
                            className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                            Voltar para Faturamento
                        </button>
                    </div>
                )}

                {/* Gráficos */}
                {temDados && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Receita ao Longo do Tempo */}
                        {dadosGraficoLinha.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 md:pl-8">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                                    Receita ao Longo do Tempo
                                </h2>
                                <div className="h-64 md:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                        data={dadosGraficoLinha}
                                        margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="data" 
                                            angle={isMobile ? 0 : -45}
                                            textAnchor={isMobile ? "middle" : "end"}
                                            height={isMobile ? 60 : 80}
                                            interval={0}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => formatarMoeda(value)}
                                            width={100}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="receita" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            name="Receita (R$)"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="quantidade" 
                                            stroke="#10B981" 
                                            strokeWidth={2}
                                            name="Quantidade"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Gráfico de Pizza - Receita por Serviço */}
                        {dadosGraficoPizza.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                                    Distribuição de Receita por Tipo de Serviço
                                </h2>
                                <div className="h-64 md:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dadosGraficoPizza}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {dadosGraficoPizza.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Gráfico de Barras - Quantidade por Serviço */}
                        {dadosGraficoBarrasServico.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 md:pl-8">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                                    Quantidade de Serviços por Tipo
                                </h2>
                                <div className="h-64 md:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={dadosGraficoBarrasServico}
                                        margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="nome"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => formatarMoeda(value)}
                                            width={100}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="quantidade" fill="#10B981" name="Quantidade" />
                                        <Bar dataKey="receita" fill="#3B82F6" name="Receita (R$)" />
                                    </BarChart>
                                </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Gráfico de Barras - Receita Mensal */}
                        {dadosGraficoBarrasMes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 md:pl-8">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                                    Receita e Quantidade Mensal
                                </h2>
                                <div className="h-64 md:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={dadosGraficoBarrasMes}
                                        margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="mes"
                                            angle={isMobile ? 0 : -45}
                                            textAnchor={isMobile ? "middle" : "end"}
                                            height={isMobile ? 60 : 100}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => formatarMoeda(value)}
                                            width={100}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="quantidade" fill="#10B981" name="Quantidade" />
                                        <Bar dataKey="receita" fill="#8B5CF6" name="Receita (R$)" />
                                    </BarChart>
                                </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

