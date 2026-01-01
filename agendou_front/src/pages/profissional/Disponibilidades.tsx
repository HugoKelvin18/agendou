import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { disponibilidadeService, Disponibilidade, horaStringParaMinutos, minutosParaHoraString } from "../../services/disponibilidadeService";
import Input from "../../components/forms/Input";
import { Calendar, Clock, Trash2, Plus, AlertCircle, ArrowLeft } from "lucide-react";

export default function Disponibilidades() {
    const navigate = useNavigate();
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        data: "",
        horaInicio: "",
        horaFim: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        carregarDisponibilidades();
    }, []);

    const carregarDisponibilidades = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await disponibilidadeService.listarPorProfissional();
            setDisponibilidades(data || []);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Erro ao carregar disponibilidades");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            // Converter horas string para minutos
            const horaInicioMin = horaStringParaMinutos(form.horaInicio);
            const horaFimMin = horaStringParaMinutos(form.horaFim);

            if (horaInicioMin >= horaFimMin) {
                setError("Hora de início deve ser anterior à hora de fim");
                setSubmitting(false);
                return;
            }

            await disponibilidadeService.criar({
                profissionalId: 0, // Será preenchido no backend
                data: form.data,
                horaInicio: horaInicioMin,
                horaFim: horaFimMin,
                disponivel: true
            });

            // Limpar formulário e recarregar
            setForm({ data: "", horaInicio: "", horaFim: "" });
            setShowForm(false);
            carregarDisponibilidades();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Erro ao criar disponibilidade");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover esta disponibilidade?")) {
            return;
        }

        try {
            await disponibilidadeService.deletar(id);
            carregarDisponibilidades();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || "Erro ao deletar disponibilidade");
        }
    };

    // Agrupar disponibilidades por data
    const disponibilidadesPorData = disponibilidades.reduce((acc: { [key: string]: Disponibilidade[] }, disp) => {
        const dataKey = new Date(disp.data).toLocaleDateString("pt-BR");
        if (!acc[dataKey]) {
            acc[dataKey] = [];
        }
        acc[dataKey].push(disp);
        return acc;
    }, {});

    // Ordenar datas
    const datasOrdenadas = Object.keys(disponibilidadesPorData).sort((a, b) => {
        return new Date(a.split('/').reverse().join('-')).getTime() - 
               new Date(b.split('/').reverse().join('-')).getTime();
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Carregando disponibilidades...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profissional/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                    Minhas Disponibilidades
                                </h1>
                                <p className="text-sm md:text-base text-gray-600">
                                    Gerencie seus horários disponíveis para atendimento
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs md:px-6 md:py-3 md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
                        >
                            <Plus size={18} className="md:w-5 md:h-5" />
                            Nova Disponibilidade
                        </button>
                    </div>
                </div>

                {/* Formulário */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="text-blue-600" size={24} />
                            Adicionar Nova Disponibilidade
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Data"
                                    name="data"
                                    type="date"
                                    value={form.data}
                                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <Input
                                    label="Hora Início"
                                    name="horaInicio"
                                    type="time"
                                    value={form.horaInicio}
                                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Hora Fim"
                                    name="horaFim"
                                    type="time"
                                    value={form.horaFim}
                                    onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                                    required
                                />
                            </div>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setForm({ data: "", horaInicio: "", horaFim: "" });
                                        setError("");
                                    }}
                                    className="px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    disabled={submitting}
                                >
                                    {submitting ? "Salvando..." : "Adicionar"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de Disponibilidades */}
                {disponibilidades.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Nenhuma disponibilidade cadastrada
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comece adicionando seus horários disponíveis para atendimento
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Adicionar Primeira Disponibilidade
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {datasOrdenadas.map((dataKey) => (
                            <div key={dataKey} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4">
                                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <Calendar size={24} />
                                        {dataKey}
                                    </h3>
                                </div>
                                <div className="p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {disponibilidadesPorData[dataKey]
                                            .sort((a, b) => a.horaInicio - b.horaInicio)
                                            .map((disp) => (
                                                <div
                                                    key={disp.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Clock size={18} />
                                                            <span className="font-semibold">
                                                                {minutosParaHoraString(disp.horaInicio)} - {minutosParaHoraString(disp.horaFim)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(disp.id!)}
                                                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                                                            title="Remover disponibilidade"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            disp.disponivel
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {disp.disponivel ? "Disponível" : "Indisponível"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
