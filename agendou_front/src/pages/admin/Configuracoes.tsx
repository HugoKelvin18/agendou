import React, { useState } from 'react';
import { Settings, Key, Save, Plus, X } from "lucide-react";
import { adminService } from "../../services/adminService";
import ModernHeader from "../../components/ui/ModernHeader";

interface CodigoAcesso {
    id: number;
    codigo: string;
    descricao?: string;
    expiraEm?: string;
    ativo: boolean;
    createdAt: string;
}

export default function ConfiguracoesAdmin() {
    const [codigos, setCodigos] = useState<CodigoAcesso[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        codigo: '',
        descricao: '',
        expiraEm: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminService.criarCodigoAcesso(
                formData.codigo,
                formData.descricao || undefined,
                formData.expiraEm || undefined
            );
            alert('Código de acesso criado com sucesso!');
            setFormData({ codigo: '', descricao: '', expiraEm: '' });
            setShowForm(false);
            // Recarregar lista de códigos se necessário
        } catch (err: any) {
            console.error("Erro ao criar código:", err);
            alert(err.response?.data?.message || "Erro ao criar código de acesso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ModernHeader role="ADMIN" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-8 h-8" />
                        Configurações do Administrador
                    </h1>
                    <p className="mt-2 text-gray-600">Gerencie códigos de acesso e configurações do sistema</p>
                </div>

                {/* Seção: Códigos de Acesso Admin */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Códigos de Acesso Admin
                        </h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showForm ? 'Cancelar' : 'Novo Código'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: ADMIN2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Descrição do código"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Expiração (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiraEm}
                                        onChange={(e) => setFormData({ ...formData, expiraEm: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Criando...' : 'Criar Código'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="p-6">
                        <p className="text-gray-600 text-sm">
                            Os códigos de acesso admin permitem criar novos administradores do sistema.
                            Use códigos seguros e mantenha controle sobre quem pode se tornar administrador.
                        </p>
                    </div>
                </div>

                {/* Seção: Informações do Sistema */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Informações do Sistema</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Versão do Sistema</p>
                                <p className="text-sm text-gray-600">1.0.0</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Ambiente</p>
                                <p className="text-sm text-gray-600">{import.meta.env.MODE || 'production'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
