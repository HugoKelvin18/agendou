import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import { criarAgendamentoCliente } from "../../services/agendamentoClienteService";
import { disponibilidadeService } from "../../services/disponibilidadeService";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Clock, User, DollarSign, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface Servico {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    duracao: number; // minutos
    imagemUrl?: string;
    profissionalId: number;
    profissional: {
        id: number;
        nome: string;
    };
}

interface Disponibilidade {
    id: number;
    data: string;
    horaInicio: number;
    horaFim: number;
}

export default function AgendarServico() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [profissionais, setProfissionais] = useState<any[]>([]);
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false);
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        servicoId: searchParams.get("servico") || "",
        profissionalId: searchParams.get("profissional") || "",
        data: "",
        hora: ""
    });

    useEffect(() => {
        carregarDados();
    }, []);

    // Carregar horários disponíveis do endpoint
    const carregarHorariosDisponiveis = async () => {
        if (!form.profissionalId || !form.data || !form.servicoId) {
            setHorariosDisponiveis([]);
            return;
        }

        try {
            setLoadingHorarios(true);
            const horarios = await disponibilidadeService.horariosDisponiveis(
                Number(form.profissionalId),
                form.data,
                Number(form.servicoId)
            );
            setHorariosDisponiveis(horarios || []);
        } catch (err) {
            console.error("Erro ao carregar horários disponíveis:", err);
            setHorariosDisponiveis([]);
        } finally {
            setLoadingHorarios(false);
        }
    };

    useEffect(() => {
        if (form.profissionalId) {
            // Carregar serviços do profissional selecionado (sempre atualizado)
            carregarServicosDoProfissional(form.profissionalId);
            // Carregar disponibilidades
            carregarDisponibilidades();
        } else {
            setDisponibilidades([]);
            setServicos([]);
            setForm(prev => ({ ...prev, servicoId: "", data: "", hora: "" }));
        }
    }, [form.profissionalId]);

    useEffect(() => {
        // Quando mudar data ou serviço, carregar horários disponíveis
        if (form.data && form.profissionalId && form.servicoId) {
            setForm(prev => ({ ...prev, hora: "" }));
            carregarHorariosDisponiveis();
        } else {
            setHorariosDisponiveis([]);
        }
    }, [form.data, form.profissionalId, form.servicoId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            setError("");
            // Buscar apenas profissionais, não serviços ainda
            const profissionaisRes = await api.get("/usuarios/profissionais");
            const profissionaisData = profissionaisRes.data || [];
            setProfissionais(profissionaisData);
            setServicos([]); // Limpar serviços ao carregar
            
            // Pre-selecionar profissional se vier via query params
            const profissionalId = searchParams.get("profissional");
            if (profissionalId && profissionaisData.length > 0) {
                const profissionalExiste = profissionaisData.some((p: any) => p.id.toString() === profissionalId);
                if (profissionalExiste) {
                    setForm(prev => ({ ...prev, profissionalId }));
                }
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            setError("Erro ao carregar dados. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Carregar serviços quando um profissional for selecionado
    const carregarServicosDoProfissional = async (profissionalId: string) => {
        if (!profissionalId) {
            setServicos([]);
            return;
        }

        try {
            // Buscar apenas serviços do profissional selecionado (sempre atualizado do banco)
            // Não usa setLoading para não bloquear a interface enquanto carrega disponibilidades também
            const servicosRes = await api.get(`/servicos/profissional/${profissionalId}`);
            const servicosAtualizados = servicosRes.data || [];
            setServicos(servicosAtualizados);
            console.log(`[CLIENTE] Serviços carregados para profissional ${profissionalId}: ${servicosAtualizados.length} serviços encontrados`);
            
            // Pre-selecionar serviço se vier via query params
            const servicoIdFromParams = searchParams.get("servico");
            const servicoIdAtual = form.servicoId || servicoIdFromParams;
            
            if (servicoIdAtual) {
                const servicoExiste = servicosAtualizados.some((s: Servico) => s.id === Number(servicoIdAtual));
                if (servicoExiste) {
                    setForm(prev => ({ ...prev, servicoId: servicoIdAtual }));
                } else {
                    // Se o serviço selecionado foi deletado ou não existe, limpar a seleção
                    setForm(prev => ({ ...prev, servicoId: "", data: "", hora: "" }));
                    if (servicoIdFromParams) {
                        setError("O serviço selecionado não está disponível. Por favor, selecione outro serviço.");
                    }
                }
            }
        } catch (err: any) {
            console.error("Erro ao carregar serviços do profissional:", err);
            setServicos([]);
            const errorMsg = err.response?.data?.error || "Erro ao carregar serviços do profissional.";
            setError(errorMsg);
        }
    };

    const carregarDisponibilidades = async () => {
        try {
            if (!form.profissionalId) return;
            
            setLoadingDisponibilidades(true);
            // Buscar TODAS as disponibilidades do profissional (sem filtrar por data)
            const disp = await disponibilidadeService.listar(
                Number(form.profissionalId)
            );
            
            // Filtrar apenas disponibilidades futuras e disponíveis
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const disponibilidadesFuturas = (disp || []).filter(d => {
                const dataDisp = new Date(d.data);
                dataDisp.setHours(0, 0, 0, 0);
                return dataDisp >= hoje && d.disponivel;
            });
            
            setDisponibilidades(disponibilidadesFuturas);
        } catch (err) {
            console.error("Erro ao carregar disponibilidades:", err);
            setDisponibilidades([]);
        } finally {
            setLoadingDisponibilidades(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Se mudou o profissional, limpar serviço selecionado também
        if (name === 'profissionalId') {
            setForm({ 
                ...form, 
                [name]: value,
                servicoId: "",
                data: "",
                hora: ""
            });
        } else if (name === 'servicoId') {
            setForm({ 
                ...form, 
                [name]: value,
                data: "",
                hora: ""
            });
        } else {
            setForm({ 
                ...form, 
                [name]: value,
                // Limpar hora quando mudar data ou serviço
                ...(name === 'data' ? { hora: "" } : {})
            });
        }
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.servicoId || !form.profissionalId || !form.data || !form.hora) {
            setError("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            await criarAgendamentoCliente({
                servicoId: Number(form.servicoId),
                profissionalId: Number(form.profissionalId),
                data: form.data,
                hora: form.hora
            });
            
            alert("Agendamento criado com sucesso!");
            
            // Redirecionar para o dashboard do cliente
            navigate("/cliente/dashboard");
        } catch (err: any) {
            console.error("Erro ao criar agendamento:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Erro ao criar agendamento. Tente novamente.";
            setError(errorMessage);
        }
    };

    const servicosFiltrados = form.profissionalId 
        ? servicos.filter(s => s.profissionalId === Number(form.profissionalId))
        : [];

    const servicoSelecionado = servicos.find(s => s.id === Number(form.servicoId));

    // Agrupar disponibilidades por data
    const disponibilidadesPorData = disponibilidades.reduce((acc: { [key: string]: Disponibilidade[] }, disp) => {
        const dataKey = new Date(disp.data).toISOString().split('T')[0];
        if (!acc[dataKey]) {
            acc[dataKey] = [];
        }
        acc[dataKey].push(disp);
        return acc;
    }, {});

    // Ordenar datas (mais próximas primeiro)
    const datasDisponiveis = Object.keys(disponibilidadesPorData).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
    );

    // Formatar duração em minutos para string legível
    const formatarDuracao = (minutos: number): string => {
        if (minutos < 60) {
            return `${minutos}min`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        if (mins === 0) {
            return `${horas}h`;
        }
        return `${horas}h${mins}min`;
    };

    // Formatar data para exibição
    const formatarData = (dataISO: string) => {
        const data = new Date(dataISO + 'T00:00:00'); // Adicionar hora para evitar problemas de timezone
        const hoje = new Date();
        
        hoje.setHours(0, 0, 0, 0);
        data.setHours(0, 0, 0, 0);
        
        // Formatar data como DD/MM
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dataFormatada = `${dia}/${mes}`;
        
        if (data.getTime() === hoje.getTime()) {
            // Se for hoje: "Hoje - 30/12"
            return `Hoje - ${dataFormatada}`;
        } else {
            // Para os demais dias: "terça-feira - 31/12"
            const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
            // Capitalizar primeira letra do dia da semana
            const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
            return `${diaSemanaCapitalizado} - ${dataFormatada}`;
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Carregando profissionais e serviços...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={() => navigate('/cliente/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Agendar Serviço</h1>
                            <p className="text-gray-600 mb-6">Preencha os dados para agendar seu atendimento</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Seleção de Profissional */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                                <User size={18} />
                                Profissional
                            </label>
                            <Select
                                name="profissionalId"
                                value={form.profissionalId}
                                onChange={handleChange}
                                options={profissionais.map((p) => ({
                                    value: p.id,
                                    label: p.nome
                                }))}
                                required
                            />
                        </div>

                        {/* Seleção de Serviço */}
                        {form.profissionalId && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <label className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-2">
                                    <CheckCircle size={18} />
                                    Serviço
                                </label>
                                {servicosFiltrados.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        Este profissional ainda não possui serviços cadastrados.
                                    </div>
                                ) : (
                                    <>
                                        <Select
                                            name="servicoId"
                                            value={form.servicoId}
                                            onChange={handleChange}
                                            options={servicosFiltrados.map((s) => ({
                                                value: s.id,
                                                label: `${s.nome} - ${new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(s.preco)} (${formatarDuracao(s.duracao)})`
                                            }))}
                                            required
                                        />
                                        {servicoSelecionado && (
                                            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm">
                                                <div className="space-y-3">
                                                    {servicoSelecionado.descricao && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                                                                <CheckCircle size={16} className="text-green-600" />
                                                                Sobre este serviço
                                                            </h4>
                                                            <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border border-green-100">
                                                                {servicoSelecionado.descricao}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-6 pt-2 border-t border-green-200">
                                                        <span className="flex items-center gap-2 text-gray-700">
                                                            <DollarSign size={18} className="text-green-600" />
                                                            <span className="text-lg font-bold text-green-700">
                                                                {new Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(servicoSelecionado.preco)}
                                                            </span>
                                                        </span>
                                                        <span className="flex items-center gap-2 text-gray-700">
                                                            <Clock size={18} className="text-blue-600" />
                                                            <span className="font-semibold">{formatarDuracao(servicoSelecionado.duracao)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Seleção de Data */}
                        {form.profissionalId && form.servicoId && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-3">
                                    <Calendar size={18} />
                                    Selecione um Dia Disponível
                                </label>
                                {loadingDisponibilidades ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-600">Carregando dias disponíveis...</p>
                                    </div>
                                ) : datasDisponiveis.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        Este profissional ainda não possui horários disponíveis. Entre em contato com o profissional.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 mb-3">
                                            {datasDisponiveis.length} {datasDisponiveis.length === 1 ? 'dia disponível' : 'dias disponíveis'}
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {datasDisponiveis.map((dataISO) => {
                                                const dataSelecionada = form.data === dataISO;
                                                
                                                return (
                                                    <button
                                                        key={dataISO}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, data: dataISO, hora: "" })}
                                                        className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                                            dataSelecionada
                                                                ? "bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105"
                                                                : "bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                                                        }`}
                                                    >
                                                        <div className="font-semibold text-sm">
                                                            {formatarData(dataISO)}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Seleção de Horário */}
                        {form.data && form.profissionalId && form.servicoId && (
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <label className="flex items-center gap-2 text-sm font-semibold text-orange-900 mb-3">
                                    <Clock size={18} />
                                    Horários Disponíveis para {formatarData(form.data)}
                                </label>
                                {!loadingHorarios && horariosDisponiveis.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        Não há horários disponíveis para esta data. Selecione outra data.
                                    </div>
                                ) : (
                                    <>
                                        {loadingHorarios ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-600">Carregando horários disponíveis...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {horariosDisponiveis.length} {horariosDisponiveis.length === 1 ? 'horário disponível' : 'horários disponíveis'}
                                                </p>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {horariosDisponiveis.map((hora) => (
                                                        <button
                                                            key={hora}
                                                            type="button"
                                                            onClick={() => setForm({ ...form, hora })}
                                                            className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                                                                form.hora === hora
                                                                    ? "bg-orange-600 text-white border-orange-600 shadow-lg transform scale-105"
                                                                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                                                            }`}
                                                        >
                                                            {hora}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 justify-end pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => navigate("/cliente/dashboard")}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!form.servicoId || !form.profissionalId || !form.data || !form.hora}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                Confirmar Agendamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
