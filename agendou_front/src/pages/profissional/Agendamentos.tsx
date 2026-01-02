import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agendamentosApi } from "../../services/agendamentoProfissionalService";
import { useAuth } from "../../hooks/useAuth";
import { ArrowLeft } from "lucide-react";

interface Agendamento {
    id: number;
    cliente: { nome: string; email?: string; telefone?: string };
    servico: { nome: string; preco?: number; duracao?: string };
    data: string | Date;
    hora: string;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
}

// Função para converter status do backend para exibição
const statusParaExibicao = (status: string): string => {
    const mapa: { [key: string]: string } = {
        "PENDENTE": "Pendente",
        "EM_ANDAMENTO": "Em Andamento",
        "CONCLUIDO": "Concluído",
        "CANCELADO": "Cancelado"
    };
    return mapa[status] || status;
};

// Função para obter cor do badge de status
const getStatusColor = (status: string): string => {
    const cores: { [key: string]: string } = {
        "PENDENTE": "bg-yellow-100 text-yellow-800",
        "EM_ANDAMENTO": "bg-blue-100 text-blue-800",
        "CONCLUIDO": "bg-green-100 text-green-800",
        "CANCELADO": "bg-red-100 text-red-800"
    };
    return cores[status] || "bg-gray-100 text-gray-800";
};

export default function AgendamentosProfissional() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true); // Loading inicial
    const [loadingFiltro, setLoadingFiltro] = useState(false); // Loading ao filtrar (não troca a tela)
    const [error, setError] = useState("");
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroData, setFiltroData] = useState("");

    // Função auxiliar para combinar data e hora do agendamento
    const combinarDataHora = (agendamento: Agendamento): Date => {
        const dataAgendamento = new Date(agendamento.data);
        // Pegar apenas a parte da data (ano, mês, dia) sem hora
        const ano = dataAgendamento.getFullYear();
        const mes = dataAgendamento.getMonth();
        const dia = dataAgendamento.getDate();
        
        // Parsear a hora (formato "HH:MM")
        const horaParts = agendamento.hora.split(':');
        if (horaParts.length === 2) {
            const horas = parseInt(horaParts[0], 10);
            const minutos = parseInt(horaParts[1], 10);
            return new Date(ano, mes, dia, horas, minutos, 0, 0);
        }
        
        // Fallback: usar a data/hora original
        return dataAgendamento;
    };

    //Carregar agendamentos do profissional
    const carregar = async (ehFiltro = false) => {
        try {
            if (ehFiltro) {
                setLoadingFiltro(true);
            } else {
                setLoading(true);
            }
            setError("");
            const res = await agendamentosApi.listarPorProfissional(undefined, { 
                clienteNome: filtroNome.trim() || undefined, 
                data: filtroData || undefined 
            });
            const agendamentosCarregados = res || [];
            
            // Ordenar por data+hora descendente (mais recentes primeiro)
            const agendamentosOrdenados = [...agendamentosCarregados].sort((a, b) => {
                const dataHoraA = combinarDataHora(a);
                const dataHoraB = combinarDataHora(b);
                return dataHoraB.getTime() - dataHoraA.getTime();
            });
            
            setAgendamentos(agendamentosOrdenados);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Erro ao carregar agendamentos";
            setError(errorMsg);
        } finally {
            if (ehFiltro) {
                setLoadingFiltro(false);
            } else {
                setLoading(false);
            }
        }
    };

    // Handler para aplicar filtros (botão ou Enter)
    const handleFiltrar = () => {
        carregar(true);
    };

    // Handler para Enter nos inputs
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFiltrar();
        }
    };

    const atualizarStatus = async (id: number, novoStatus: string) => {
        try {
            // Converter status para o formato do backend (MAIÚSCULAS e trim)
            const statusBackend = novoStatus.toUpperCase().trim();
            
            console.log(`[FRONTEND] Atualizando status do agendamento ${id} para: ${statusBackend}`);
            
            const resposta = await agendamentosApi.atualizarStatus(id, statusBackend);
            
            console.log(`[FRONTEND] Resposta do backend:`, resposta);
            
            // Mostrar mensagem de sucesso específica para CONCLUIDO
            if (statusBackend === "CONCLUIDO") {
                alert("✓ Serviço marcado como concluído!\n\nEste serviço agora aparecerá na página de Faturamento.");
            }
            
            // Atualizar estado local com os dados retornados ou apenas o status
            if (resposta?.agendamento) {
                const statusAtualizado = resposta.agendamento.status?.toUpperCase() || statusBackend;
                setAgendamentos(prev =>
                    prev.map(a =>
                        a.id === id ? {
                            ...a,
                            status: statusAtualizado as any,
                            cliente: resposta.agendamento.cliente || a.cliente,
                            servico: resposta.agendamento.servico || a.servico
                        } : a
                    )
                );
                console.log(`[FRONTEND] Status atualizado localmente para: ${statusAtualizado}`);
            } else {
                // Fallback: atualizar apenas o status se a resposta não vier completa
                setAgendamentos(prev =>
                    prev.map(a =>
                        a.id === id ? { ...a, status: statusBackend as any } : a
                    )
                );
                console.log(`[FRONTEND] Status atualizado localmente (fallback) para: ${statusBackend}`);
            }
            
        } catch (err: any) {
            console.error("[FRONTEND] Erro ao atualizar status:", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Não foi possível atualizar o status";
            alert(`Erro: ${errorMsg}`);
            // Recarregar para garantir sincronização
            carregar();
        }
    };

    useEffect(() => {
        carregar(); // Carregamento inicial apenas
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-base md:text-lg">Carregando agendamentos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={() => carregar(false)}
                    className="mt-4 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs md:text-sm"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    {/* Header com título, filtros e botões */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Título */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/profissional/dashboard')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={24} className="text-gray-600" />
                                </button>
                                <h2 className="text-3xl font-bold text-gray-800">Meus Agendamentos</h2>
                            </div>

                            {/* Filtros compactos */}
                            <div className="flex flex-wrap items-end gap-3 flex-1 lg:justify-center">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        id="filtroNome"
                                        type="text"
                                        value={filtroNome}
                                        onChange={(e) => setFiltroNome(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nome do cliente..."
                                        className="w-full px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="min-w-[150px]">
                                    <input
                                        id="filtroData"
                                        type="date"
                                        value={filtroData}
                                        onChange={(e) => setFiltroData(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleFiltrar}
                                    disabled={loadingFiltro}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                >
                                    {loadingFiltro ? "Filtrando..." : "Filtrar"}
                                </button>
                            </div>

                            {/* Botão Atualizar */}
                            <div className="flex items-center gap-2">
                                {loadingFiltro && (
                                    <div className="text-xs md:text-sm text-blue-600 flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="hidden sm:inline">Carregando...</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => carregar(false)}
                                    className="px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 hover:text-amber-800 transition-colors whitespace-nowrap font-medium"
                                >
                                    Atualizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {agendamentos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
                        <p className="text-gray-600 text-base md:text-lg">Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Serviço
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status Atual
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Alterar Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {agendamentos.map(a => {
                                        const dataFormatada = typeof a.data === 'string' 
                                            ? new Date(a.data).toLocaleDateString("pt-BR")
                                            : new Date(a.data).toLocaleDateString("pt-BR");
                                        
                                        return (
                                            <tr key={a.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {a.cliente?.nome || "N/A"}
                                                    </div>
                                                    {a.cliente?.email && (
                                                        <div className="text-xs md:text-sm text-gray-500">
                                                            {a.cliente.email}
                                                        </div>
                                                    )}
                                                    {a.cliente?.telefone && (
                                                        <div className="text-xs md:text-sm text-gray-500">
                                                            {a.cliente.telefone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {a.servico?.nome || "N/A"}
                                                    </div>
                                                    {a.servico?.preco && (
                                                        <div className="text-xs md:text-sm text-gray-500">
                                                            R$ {a.servico.preco.toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {dataFormatada}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {a.hora}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(a.status)}`}>
                                                        {statusParaExibicao(a.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <select
                                                        value={a.status}
                                                        onChange={(e) => atualizarStatus(a.id, e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="PENDENTE">Pendente</option>
                                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                                        <option value="CONCLUIDO">Concluído</option>
                                                        <option value="CANCELADO">Cancelado</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}