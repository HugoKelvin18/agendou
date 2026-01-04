import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Building2, Phone, Calendar, Save, X } from 'lucide-react';
import ModernHeader from '../../components/ui/ModernHeader';
import api from '../../services/api';

interface BusinessPendente {
    id: number;
    nome: string;
    slug: string;
    dominio: string | null;
    whatsapp: string | null;
    plano: string | null;
    statusPagamento: string;
    createdAt: string;
    updatedAt: string;
}

export default function SolicitacoesPendentes() {
    const navigate = useNavigate();
    const [solicitacoes, setSolicitacoes] = useState<BusinessPendente[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        codigoAcesso: '',
        dominio: ''
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const carregarSolicitacoes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/leads/pendentes');
            setSolicitacoes(response.data);
        } catch (err: any) {
            console.error('Erro ao carregar solicitações:', err);
            setError(err.response?.data?.message || 'Erro ao carregar solicitações');
        } finally {
            setLoading(false);
        }
    };

    const handleAtivar = (id: number) => {
        setSelectedId(id);
        setShowForm(true);
        setFormData({ codigoAcesso: '', dominio: '' });
        setError('');
    };

    const handleSubmitAtivacao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;

        if (!formData.codigoAcesso.trim()) {
            setError('Código de acesso é obrigatório');
            return;
        }

        try {
            setActionLoading(true);
            setError('');
            await api.post(`/admin/leads/${selectedId}/ativar`, {
                codigoAcesso: formData.codigoAcesso.trim(),
                dominio: formData.dominio.trim() || null
            });
            
            alert('Business ativado com sucesso!');
            setShowForm(false);
            setSelectedId(null);
            await carregarSolicitacoes();
        } catch (err: any) {
            console.error('Erro ao ativar business:', err);
            setError(err.response?.data?.message || 'Erro ao ativar business');
        } finally {
            setActionLoading(false);
        }
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader role="ADMIN" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </button>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Solicitações Pendentes</h1>
                    <p className="text-gray-600 mt-2">Gerencie as solicitações de novos businesses</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando solicitações...</p>
                    </div>
                ) : solicitacoes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Nenhuma solicitação pendente</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {solicitacoes.map((solicitacao) => (
                            <div key={solicitacao.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                            <h3 className="text-xl font-bold text-gray-900">{solicitacao.nome}</h3>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                                PENDENTE
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">
                                                    <span className="font-medium">WhatsApp:</span> {solicitacao.whatsapp || 'Não informado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="text-sm">
                                                    <span className="font-medium">Plano:</span> {solicitacao.plano || 'Não definido'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="text-sm">
                                                    <span className="font-medium">Slug:</span> {solicitacao.slug}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    <span className="font-medium">Data:</span> {formatarData(solicitacao.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleAtivar(solicitacao.id)}
                                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Ativar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Ativação */}
                {showForm && selectedId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Ativar Business</h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setSelectedId(null);
                                        setError('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmitAtivacao} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código de Acesso *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigoAcesso}
                                        onChange={(e) => setFormData({ ...formData, codigoAcesso: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ex: SALAO2026"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Este código será enviado ao cliente via WhatsApp
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Domínio (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.dominio}
                                        onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ex: meusalao.com.br"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Link de direcionamento para o site do cliente
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setSelectedId(null);
                                            setError('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Ativando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Ativar Business
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
