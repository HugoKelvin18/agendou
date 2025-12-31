import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAgendamentoCliente, cancelarAgendamentoCliente } from "../../services/agendamentoClienteService";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Clock, User, Package, AlertCircle, Info, ArrowLeft, X } from "lucide-react";

interface Agendamento {
    id: number;
    cliente: { nome: string };
    servico: { 
        nome: string;
        descricao?: string;
        preco?: number;
        duracao?: string;
    };
    profissional: { nome: string };
    data: Date | string;
    hora: string;
    status: "pendente" | "andamento" | "concluido" | "cancelado" | "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
}

export default function AgendamentosCliente() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);

    const carregar = async () => {
        try {
            if (user?.id) {
                const res = await listarAgendamentoCliente(user.id);
                setAgendamentos(res || []);
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao carregar agendamentos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregar();
    }, [user]);

    const formatarStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            "PENDENTE": "Pendente",
            "EM_ANDAMENTO": "Em Andamento",
            "CONCLUIDO": "Concluído",
            "CANCELADO": "Cancelado",
            "pendente": "Pendente",
            "andamento": "Em Andamento",
            "concluido": "Concluído",
            "cancelado": "Cancelado"
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === "CONCLUIDO" || statusUpper === "concluido") {
            return "bg-green-100 text-green-800";
        } else if (statusUpper === "EM_ANDAMENTO" || statusUpper === "andamento") {
            return "bg-yellow-100 text-yellow-800";
        } else if (statusUpper === "CANCELADO" || statusUpper === "cancelado") {
            return "bg-red-100 text-red-800";
        }
        return "bg-gray-100 text-gray-800";
    };

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

    // Função para verificar se pode cancelar (>= 2h antes)
    const podeCancelar = (agendamento: Agendamento): boolean => {
        const statusUpper = agendamento.status.toUpperCase();
        if (statusUpper === "CANCELADO" || statusUpper === "CONCLUIDO") {
            return false;
        }

        const dataHoraAgendamento = combinarDataHora(agendamento);
        const agora = new Date();
        const diffMs = dataHoraAgendamento.getTime() - agora.getTime();
        const HOURS_2_MS = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

        return diffMs >= HOURS_2_MS;
    };

    // Função para calcular mensagem quando não pode cancelar
    const mensagemNaoPodeCancelar = (agendamento: Agendamento): string => {
        const dataHoraAgendamento = combinarDataHora(agendamento);
        const agora = new Date();
        const diffMs = dataHoraAgendamento.getTime() - agora.getTime();
        const HOURS_2_MS = 2 * 60 * 60 * 1000;

        // Se o agendamento já passou ou falta menos de 2h
        if (diffMs < HOURS_2_MS) {
            if (diffMs <= 0) {
                return "Não é possível cancelar agendamentos passados";
            }
            // Falta menos de 2h para o agendamento
            const horas = Math.floor(diffMs / (60 * 60 * 1000));
            const minutos = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
            
            if (horas > 0) {
                return `Cancelamento permitido apenas até 2h antes (restam ${horas}h ${minutos}m)`;
            }
            return `Cancelamento permitido apenas até 2h antes (restam ${minutos} minutos)`;
        }

        return "";
    };

    // Função para cancelar agendamento
    const handleCancelar = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
            return;
        }

        try {
            await cancelarAgendamentoCliente(id);
            alert("Agendamento cancelado com sucesso!");
            carregar(); // Recarregar lista
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Erro ao cancelar agendamento";
            alert(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Carregando agendamentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={() => navigate('/cliente/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                <Calendar className="text-blue-600" size={32} />
                                Meus Agendamentos
                            </h1>
                            <p className="text-gray-600">
                                Visualize e acompanhe todos os seus agendamentos
                            </p>
                        </div>
                    </div>
                </div>

                {agendamentos.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Nenhum agendamento encontrado
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Você ainda não possui agendamentos. Agende seu primeiro serviço!
                        </p>
                        <button
                            onClick={() => window.location.href = "/cliente/agendar"}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Agendar Serviço
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {agendamentos.map((a) => {
                            const dataFormatada = typeof a.data === 'string' 
                                ? new Date(a.data).toLocaleDateString("pt-BR")
                                : new Date(a.data).toLocaleDateString("pt-BR");
                            
                            return (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Package className="text-blue-600" size={24} />
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {a.servico?.nome}
                                                    </h3>
                                                </div>
                                                {a.servico?.descricao && (
                                                    <div className="ml-9 mb-3">
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            {a.servico.descricao}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(a.status)}`}>
                                                {formatarStatus(a.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <User size={18} className="text-blue-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Profissional</p>
                                                    <p className="font-semibold">{a.profissional?.nome}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar size={18} className="text-purple-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Data</p>
                                                    <p className="font-semibold">{dataFormatada}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Clock size={18} className="text-green-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Horário</p>
                                                    <p className="font-semibold">{a.hora}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {a.servico?.preco && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <span className="text-sm text-gray-500">Valor do serviço:</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(a.servico.preco)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botão Cancelar */}
                                        {a.status.toUpperCase() !== "CANCELADO" && a.status.toUpperCase() !== "CONCLUIDO" && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    {!podeCancelar(a) && (
                                                        <div className="flex items-center gap-2 text-sm text-amber-600">
                                                            <AlertCircle size={16} />
                                                            <span>{mensagemNaoPodeCancelar(a)}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleCancelar(a.id)}
                                                        disabled={!podeCancelar(a)}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                                            podeCancelar(a)
                                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        } ${!podeCancelar(a) ? "sm:ml-auto" : ""}`}
                                                    >
                                                        <X size={16} />
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}