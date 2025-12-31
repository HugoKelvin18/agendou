import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import { servicosService } from "../../services/servicoService";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus, Clock, DollarSign, Edit2, Trash2, AlertCircle, X, ArrowLeft } from "lucide-react";

interface Servico {
    id: number;
    nome: string;
    descricao?: string;
    duracao: number | string; // Aceita número (minutos) ou string (formato legível)
    preco: number;
    imagemUrl?: string;
}

interface FormServicoProps {
    onClose: () => void;
    onCreate: (novo: Omit<Servico, "id">) => void;
    onUpdate?: (id: number, dados: Omit<Servico, "id">) => void;
    editing?: Servico;
}

// Função auxiliar para converter minutos para formato de seleção
const minutosParaFormatoSelect = (minutos: number | string): string => {
    if (typeof minutos === 'string') {
        return minutos; // Já está no formato correto
    }
    
    // Converter minutos para formato de string legível
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

function FormServico({ onClose, onCreate, onUpdate, editing }: FormServicoProps) {
    const [nome, setNome] = useState(editing?.nome || "");
    const [descricao, setDescricao] = useState(editing?.descricao || "");
    const [duracao, setDuracao] = useState(editing ? minutosParaFormatoSelect(editing.duracao) : "");
    const [preco, setPreco] = useState(editing?.preco?.toString() || "");
    const [imagemUrl, setImagemUrl] = useState(editing?.imagemUrl || "");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const novosErros: { [key: string]: string } = {};
        if (!nome.trim()) novosErros.nome = "Nome obrigatório";
        if (!duracao) novosErros.duracao = "Duração obrigatória";
        if (!preco || parseFloat(preco.replace(",", ".")) <= 0) {
            novosErros.preco = "Preço inválido";
        }

        setErrors(novosErros);

        if (Object.keys(novosErros).length > 0) {
            setSubmitting(false);
            return;
        }
        
        try {
            const precoFormatado = preco.replace(",", ".");
            const dadosServico = { 
                nome: nome.trim(), 
                descricao: descricao.trim() || undefined,
                duracao, 
                preco: parseFloat(precoFormatado),
                imagemUrl: imagemUrl.trim() || undefined
            };

            if (editing && onUpdate) {
                // Atualizar serviço existente
                await onUpdate(editing.id, dadosServico);
            } else {
                // Criar novo serviço
                await onCreate(dadosServico);
            }
            onClose();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || "Erro ao salvar serviço";
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-blue-600" size={24} />
                        {editing ? "Editar Serviço" : "Adicionar Serviço"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Nome do Serviço"
                        name="nome"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        error={errors.nome}
                        placeholder="Ex: Corte de cabelo, Manicure, etc."
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Descreva o serviço oferecido..."
                        />
                    </div>
                    
                    <Select
                        label="Duração"
                        name="duracao"
                        value={duracao}
                        onChange={e => setDuracao(e.target.value)}
                        options={[
                            { value: "15 min", label: "15 minutos" },
                            { value: "30 min", label: "30 minutos" },
                            { value: "45 min", label: "45 minutos" },
                            { value: "1h", label: "1 hora" },
                            { value: "1h30min", label: "1 hora e 30 minutos" },
                            { value: "2h", label: "2 horas" },
                            { value: "2h30min", label: "2 horas e 30 minutos" },
                            { value: "3h", label: "3 horas" }
                        ]}
                        error={errors.duracao}
                    />
                    
                    <Input
                        label="Preço"
                        name="preco"
                        type="text"
                        value={preco}
                        onChange={e => {
                            const value = e.target.value.replace(/[^0-9,.]/g, "");
                            setPreco(value);
                        }}
                        placeholder="Ex: 50.00 ou 50,00"
                        error={errors.preco}
                    />
                    
                    <Input
                        label="URL da Imagem (opcional)"
                        name="imagemUrl"
                        type="url"
                        value={imagemUrl}
                        onChange={e => setImagemUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                    {imagemUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-2">Preview:</p>
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                    src={imagemUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={submitting}
                            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Salvando..." : editing ? "Atualizar" : "Adicionar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MeusServicos() {
    const navigate = useNavigate();
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<Servico | undefined>(undefined);

    const { user } = useAuth();
    const profissionalId = user?.id;
    
    useEffect(() => {
        if (profissionalId && profissionalId !== 0) {
            carregarServicos();
        } else {
            setLoading(false);
        }
    }, [profissionalId]);

    const carregarServicos = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await servicosService.getByProfissional(profissionalId!);
            setServicos(response.data || []);
        } catch(err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Erro ao carregar serviços");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (novo: Omit<Servico, "id">) => {
        try {
            console.log("[FRONTEND] Dados sendo enviados para criar:", {
                nome: novo.nome,
                descricao: novo.descricao,
                duracao: novo.duracao,
                preco: novo.preco,
                imagemUrl: novo.imagemUrl,
                tipoDuracao: typeof novo.duracao
            });

            const response = await servicosService.create({
                nome: novo.nome,
                descricao: novo.descricao,
                duracao: novo.duracao,
                preco: novo.preco,
                imagemUrl: novo.imagemUrl
            });

            console.log("[FRONTEND] Serviço criado com sucesso:", response.data);
            // Usar response.data completo que já vem com imagemUrl do backend
            setServicos((prev) => [...prev, response.data]);
            setShowForm(false);
            setEditing(undefined);
        } catch (err: any) {
            console.error("[FRONTEND] Erro ao criar serviço:", err);
            console.error("[FRONTEND] Resposta do servidor:", err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Erro ao criar serviço";
            throw new Error(errorMessage);
        }
    };

    const handleUpdate = async (id: number, dados: Omit<Servico, "id">) => {
        try {
            console.log("[FRONTEND] Atualizando serviço:", { id, dados });

            const response = await servicosService.update(id, {
                nome: dados.nome,
                descricao: dados.descricao,
                duracao: dados.duracao,
                preco: dados.preco,
                imagemUrl: dados.imagemUrl
            });

            console.log("[FRONTEND] Serviço atualizado com sucesso:", response.data);
            
            // Atualizar o serviço na lista usando response.data completo (inclui imagemUrl)
            setServicos((prev) => prev.map(servico => 
                servico.id === id ? response.data : servico
            ));
            
            setShowForm(false);
            setEditing(undefined);
        } catch (err: any) {
            console.error("[FRONTEND] Erro ao atualizar serviço:", err);
            console.error("[FRONTEND] Resposta do servidor:", err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Erro ao atualizar serviço";
            throw new Error(errorMessage);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            // Deletar o serviço do banco de dados
            await servicosService.delete(id);
            
            // Atualizar a lista removendo o serviço deletado
            setServicos(prev => prev.filter(s => s.id !== id));
            alert("Serviço removido com sucesso!");
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.error || "Erro ao excluir serviço";
            alert(errorMessage);
        }
    };

    const formatarPreco = (preco: number | string) => {
        const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
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

    if (!profissionalId || profissionalId === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Acesso Restrito
                    </h2>
                    <p className="text-gray-600">
                        Faça login no perfil profissional para visualizar seus serviços.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Carregando serviços...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profissional/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <Package className="text-blue-600" size={32} />
                                    Meus Serviços
                                </h1>
                                <p className="text-gray-600">
                                    Gerencie os serviços que você oferece aos clientes
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditing(undefined);
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Plus size={20} />
                            <span className="font-medium">Adicionar Serviço</span>
                        </button>
                    </div>
                </div>

                {/* Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={carregarServicos}
                            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Lista de Serviços */}
                {servicos.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Nenhum serviço cadastrado
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comece adicionando os serviços que você oferece aos seus clientes
                        </p>
                        <button
                            onClick={() => {
                                setEditing(undefined);
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <Plus size={20} />
                            Adicionar Primeiro Serviço
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicos.map((servico) => (
                            <div
                                key={servico.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                {servico.nome}
                                            </h3>
                                            {servico.descricao && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {servico.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditing(servico);
                                                    setShowForm(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded"
                                                title="Editar serviço"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(servico.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                                                title="Excluir serviço"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={18} className="text-blue-600" />
                                            <span className="font-medium">
                                                {typeof servico.duracao === 'number' 
                                                    ? formatarDuracao(servico.duracao)
                                                    : servico.duracao
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <DollarSign size={18} className="text-green-600" />
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatarPreco(servico.preco)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setEditing(servico);
                                            setShowForm(true);
                                        }}
                                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                    >
                                        <Edit2 size={18} />
                                        Editar Serviço
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Formulário */}
                {showForm && (
                    <FormServico
                        onClose={() => {
                            setShowForm(false);
                            setEditing(undefined);
                        }}
                        onCreate={handleCreate}
                        onUpdate={handleUpdate}
                        editing={editing}
                    />
                )}
            </div>
        </div>
    );
}
