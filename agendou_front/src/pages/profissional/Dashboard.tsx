import React, { useState, useEffect } from 'react';
import { Calendar, Scissors, Clock, User, DollarSign, Edit2, Plus, Package, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { servicosService } from "../../services/servicoService";
import { agendamentosApi } from "../../services/agendamentoProfissionalService";
import ModernHeader from "../../components/ui/ModernHeader";

interface Servico {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
    profissionalId: number;
}

export default function DashboardProfissional() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [agendamentos, setAgendamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            carregarServicos();
            carregarAgendamentos();
        }
    }, [user]);

    // Calcular agendamentos de hoje
    const agendamentosHoje = agendamentos.filter(ag => {
        if (!ag.data) return false;
        const dataAg = new Date(ag.data);
        const hoje = new Date();
        return dataAg.toDateString() === hoje.toDateString() && ag.status !== 'CANCELADO';
    }).length;

    const agendamentosPendentes = agendamentos.filter(ag => ag.status === 'PENDENTE').length;

    const carregarServicos = async () => {
        try {
            setLoading(true);
            const response = await servicosService.getByProfissional(user!.id);
            setServicos(response.data || []);
        } catch (err) {
            console.error("Erro ao carregar serviços:", err);
        } finally {
            setLoading(false);
        }
    };

    const carregarAgendamentos = async () => {
        try {
            const response = await agendamentosApi.listarPorProfissional();
            setAgendamentos(response || []);
        } catch (err) {
            console.error("Erro ao carregar agendamentos:", err);
        }
    };

    const formatarPreco = (preco: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const formatarDuracao = (minutos: number): string => {
        if (minutos < 60) {
            return `${minutos} min`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        if (mins === 0) {
            return `${horas}h`;
        }
        return `${horas}h${mins}min`;
    };

    // Pegar primeiros 4 serviços para exibição rápida
    const servicosRapidos = servicos.slice(0, 4);
    const servicosAtivos = servicos.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader
                actionButton={{
                    text: "Adicionar serviço",
                    onClick: () => navigate("/profissional/agendar"),
                    icon: <Plus size={18} />
                }}
                role="PROFISSIONAL"
            />
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Cards Principais */}
                <div className='grid md:grid-cols-2 lg:grid-cols-5 gap-6'>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/profissional/agendamentos")}
                    >
                        <Calendar size={48} className='text-blue-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Agenda</h2>
                        <p className="text-gray-600 mt-2">Visualize seus agendamentos</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/profissional/agendar")}
                    >
                        <Scissors size={48} className='text-orange-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Meus Serviços</h2>
                        <p className="text-gray-600 mt-2">Gerencie seus serviços oferecidos</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/profissional/disponibilidades")}
                    >
                        <Clock size={48} className='text-green-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Disponibilidade</h2>
                        <p className="text-gray-600 mt-2">Configure seus horários disponíveis</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        onClick={() => navigate("/profissional/faturamento")}
                    >
                        <DollarSign size={48} className='text-green-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Faturamento</h2>
                        <p className="text-gray-600 mt-2">Análise de receitas e métricas</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/profissional/configuracoes")}
                    >
                        <User size={48} className='text-purple-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Meu Perfil</h2>
                        <p className="text-gray-600 mt-2">Gerencie suas informações</p>
                    </div>
                </div>

                {/* Seção: Meus Serviços (Edição Rápida) */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Package className="text-orange-500" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800">Meus Serviços</h2>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {servicosAtivos} {servicosAtivos === 1 ? 'ativo' : 'ativos'}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate("/profissional/agendar")}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Carregando serviços...</p>
                        </div>
                    ) : servicos.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-dashed border-orange-300">
                            <Package size={64} className="mx-auto mb-4 text-orange-400" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Crie seu primeiro serviço</h3>
                            <p className="text-gray-600 mb-6">Comece oferecendo seus serviços aos clientes</p>
                            <button
                                onClick={() => navigate("/profissional/agendar")}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                            >
                                <Plus size={20} />
                                Criar Primeiro Serviço
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={() => navigate("/profissional/agendar")}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <Plus size={18} />
                                    Novo Serviço
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {servicosRapidos.map((servico) => (
                                    <div
                                        key={servico.id}
                                        className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200 hover:shadow-lg transition-all"
                                    >
                                        {/* Cabeçalho */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 text-lg mb-1">{servico.nome}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatarDuracao(servico.duracao)}
                                                    </span>
                                                    <span className="font-bold text-orange-600">
                                                        {formatarPreco(servico.preco)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        {servico.descricao && (
                                            <p className="text-xs text-gray-600 mb-4 line-clamp-2">{servico.descricao}</p>
                                        )}

                                        {/* Botões de Ação */}
                                        <div className="flex gap-2 pt-3 border-t border-orange-200">
                                            <button
                                                onClick={() => navigate(`/profissional/agendar?editar=${servico.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                            >
                                                <Edit2 size={16} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => navigate("/profissional/agendar")}
                                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                title="Ativar/Desativar (em breve)"
                                            >
                                                •••
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {servicos.length > 4 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => navigate("/profissional/agendar")}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                    >
                                        Ver todos os {servicos.length} serviços
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
