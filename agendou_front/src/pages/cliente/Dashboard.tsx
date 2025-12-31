import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Sparkles, Star, ChevronRight, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { servicosService } from "../../services/servicoService";
import { listarAgendamentoCliente } from "../../services/agendamentoClienteService";
import api from "../../services/api";
import ModernHeader from "../../components/ui/ModernHeader";

interface Servico {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
    imagemUrl?: string;
    profissionalId: number;
    profissional: {
        id: number;
        nome: string;
    };
}

interface Profissional {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
}

export default function DashboardCliente() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [agendamentos, setAgendamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroPreco, setFiltroPreco] = useState<string | null>(null);
    const [filtroDuracao, setFiltroDuracao] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    // Calcular agendamentos de hoje
    const agendamentosHoje = agendamentos.filter(ag => {
        if (!ag.data) return false;
        const dataAg = new Date(ag.data);
        const hoje = new Date();
        return dataAg.toDateString() === hoje.toDateString() && ag.status !== 'CANCELADO';
    }).length;

    const carregarDados = async () => {
        try {
            setLoading(true);
            // Carregar todos os serviços
            const servicosRes = await servicosService.list();
            setServicos(servicosRes.data || []);
            
            // Carregar profissionais
            const profissionaisRes = await api.get("/usuarios/profissionais");
            setProfissionais(profissionaisRes.data || []);
            
            // Carregar agendamentos do cliente
            if (user?.id) {
                try {
                    const agendamentosRes = await listarAgendamentoCliente(user.id);
                    setAgendamentos(agendamentosRes || []);
                } catch (err) {
                    console.error("Erro ao carregar agendamentos:", err);
                }
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
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

    // Filtrar serviços
    const servicosFiltrados = servicos.filter(servico => {
        if (filtroPreco === "ate50" && servico.preco > 50) return false;
        if (filtroPreco === "50a100" && (servico.preco <= 50 || servico.preco > 100)) return false;
        if (filtroPreco === "acima100" && servico.preco <= 100) return false;
        
        if (filtroDuracao === "ate30" && servico.duracao > 30) return false;
        if (filtroDuracao === "30a60" && (servico.duracao <= 30 || servico.duracao > 60)) return false;
        if (filtroDuracao === "acima60" && servico.duracao <= 60) return false;
        
        return true;
    });

    // Pegar primeiros 4 serviços para sugestões
    const sugestoesDoDia = servicosFiltrados.slice(0, 4);
    // Pegar primeiros 4 profissionais para top
    const topProfissionais = profissionais.slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader
                actionButton={{
                    text: "Novo agendamento",
                    onClick: () => navigate("/cliente/agendar"),
                    icon: <Plus size={18} />
                }}
                role="CLIENTE"
            />
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Cards Principais */}
                <div className='grid md:grid-cols-3 gap-6'>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/cliente/agendar")}
                    >
                        <Calendar size={48} className='text-blue-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Agendar Serviço</h2>
                        <p className="text-gray-600 mt-2">Agende um novo serviço com um profissional</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/cliente/agendamentos")}
                    >
                        <Clock size={48} className='text-green-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Meus Agendamentos</h2>
                        <p className="text-gray-600 mt-2">Visualize e gerencie seus agendamentos</p>
                    </div>
                    <div 
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate("/cliente/configuracoes")}
                    >
                        <User size={48} className='text-purple-600 mb-4' />
                        <h2 className='text-xl font-semibold text-gray-800'>Meu Perfil</h2>
                        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
                    </div>
                </div>

                {/* Seção: Sugestões do Dia */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-yellow-500" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800">Sugestões do Dia</h2>
                        </div>
                        <button
                            onClick={() => navigate("/cliente/agendar")}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Filtros Rápidos */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-sm font-medium text-gray-700">Filtros:</span>
                        <button
                            onClick={() => setFiltroPreco(filtroPreco === "ate50" ? null : "ate50")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroPreco === "ate50"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Até R$ 50
                        </button>
                        <button
                            onClick={() => setFiltroPreco(filtroPreco === "50a100" ? null : "50a100")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroPreco === "50a100"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            R$ 50 - R$ 100
                        </button>
                        <button
                            onClick={() => setFiltroPreco(filtroPreco === "acima100" ? null : "acima100")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroPreco === "acima100"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Acima de R$ 100
                        </button>
                        <button
                            onClick={() => setFiltroDuracao(filtroDuracao === "ate30" ? null : "ate30")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroDuracao === "ate30"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Até 30min
                        </button>
                        <button
                            onClick={() => setFiltroDuracao(filtroDuracao === "30a60" ? null : "30a60")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroDuracao === "30a60"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            30min - 1h
                        </button>
                        <button
                            onClick={() => setFiltroDuracao(filtroDuracao === "acima60" ? null : "acima60")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtroDuracao === "acima60"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Acima de 1h
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Carregando sugestões...</p>
                        </div>
                    ) : sugestoesDoDia.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>Nenhum serviço encontrado com os filtros selecionados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sugestoesDoDia.map((servico) => (
                                <div
                                    key={servico.id}
                                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all overflow-hidden flex flex-col h-[400px]"
                                >
                                    {/* Banner de Imagem no Topo - Altura Fixa */}
                                    <div className="relative h-40 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                                        {servico.imagemUrl ? (
                                            <img 
                                                src={servico.imagemUrl} 
                                                alt={servico.nome}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Se a imagem falhar ao carregar, mostra placeholder
                                                    const target = e.target as HTMLImageElement;
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <Package className="text-gray-400" size={48} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Conteúdo do Card */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{servico.nome}</h3>
                                                <p className="text-sm text-gray-600">{servico.profissional.nome}</p>
                                            </div>
                                        </div>
                                        
                                        {servico.descricao && (
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">{servico.descricao}</p>
                                        )}
                                        
                                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                                            <Clock size={14} />
                                            <span>{formatarDuracao(servico.duracao)}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                                            <span className="text-xl font-bold text-blue-600">
                                                {formatarPreco(servico.preco)}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/cliente/agendar?profissional=${servico.profissionalId}&servico=${servico.id}`)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Agendar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 text-sm text-gray-600 text-center">
                        {servicosFiltrados.length > 0 && (
                            <p>{servicosFiltrados.length} {servicosFiltrados.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}</p>
                        )}
                    </div>
                </div>

                {/* Seção: Top Profissionais */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="text-yellow-500" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800">Top Profissionais</h2>
                        </div>
                        <button
                            onClick={() => navigate("/cliente/agendar")}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Carregando profissionais...</p>
                        </div>
                    ) : topProfissionais.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <User size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>Nenhum profissional disponível no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {topProfissionais.map((profissional) => {
                                const servicosDoProfissional = servicos.filter(s => s.profissionalId === profissional.id);
                                return (
                                    <div
                                        key={profissional.id}
                                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {profissional.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800">{profissional.nome}</h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star size={14} className="text-yellow-500 fill-current" />
                                                    <span className="text-sm text-gray-600">4.8</span>
                                                    <span className="text-xs text-gray-500">({servicosDoProfissional.length} serviços)</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 mb-3">
                                            {servicosDoProfissional.length > 0 
                                                ? `${servicosDoProfissional[0].nome} e mais`
                                                : 'Sem serviços cadastrados'
                                            }
                                        </p>
                                        
                                        <button
                                            onClick={() => navigate(`/cliente/agendar?profissional=${profissional.id}`)}
                                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                        >
                                            Ver Serviços
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
