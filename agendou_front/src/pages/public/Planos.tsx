import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap, Building2, Rocket, Crown } from 'lucide-react';
import api from '../../services/api';

interface Plano {
    id: string;
    nome: string;
    preco: string;
    descricao: string;
    features: string[];
    popular?: boolean;
    icon: React.ReactNode;
}

const planos: Plano[] = [
    {
        id: 'FREE',
        nome: 'Free',
        preco: 'Grátis',
        descricao: 'Perfeito para começar',
        features: [
            'Até 1 profissional',
            'Até 5 serviços',
            'Agendamentos ilimitados',
            'Suporte por email'
        ],
        icon: <Zap className="w-8 h-8" />
    },
    {
        id: 'BASIC',
        nome: 'Basic',
        preco: 'R$ 49/mês',
        descricao: 'Ideal para pequenos negócios',
        features: [
            'Até 5 profissionais',
            'Até 20 serviços',
            'Agendamentos ilimitados',
            'Suporte prioritário',
            'Relatórios básicos'
        ],
        popular: true,
        icon: <Building2 className="w-8 h-8" />
    },
    {
        id: 'PRO',
        nome: 'Pro',
        preco: 'R$ 149/mês',
        descricao: 'Para negócios em crescimento',
        features: [
            'Até 20 profissionais',
            'Serviços ilimitados',
            'Agendamentos ilimitados',
            'Suporte prioritário 24/7',
            'Relatórios avançados',
            'Integrações'
        ],
        icon: <Rocket className="w-8 h-8" />
    },
    {
        id: 'ENTERPRISE',
        nome: 'Enterprise',
        preco: 'Sob consulta',
        descricao: 'Solução completa para grandes empresas',
        features: [
            'Profissionais ilimitados',
            'Serviços ilimitados',
            'Agendamentos ilimitados',
            'Suporte dedicado',
            'Relatórios personalizados',
            'Integrações avançadas',
            'Treinamento da equipe'
        ],
        icon: <Crown className="w-8 h-8" />
    }
];

export default function Planos() {
    const navigate = useNavigate();
    const [planoSelecionado, setPlanoSelecionado] = useState<string>('');
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        aceiteTermos: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.nome.trim()) {
            setError('Nome do negócio é obrigatório');
            return;
        }

        if (!formData.whatsapp.trim()) {
            setError('WhatsApp é obrigatório');
            return;
        }

        if (!planoSelecionado) {
            setError('Selecione um plano');
            return;
        }

        if (!formData.aceiteTermos) {
            setError('Você precisa aceitar os termos de uso');
            return;
        }

        try {
            setLoading(true);
            // Timeout maior para cold start do Render
            const response = await api.post('/public/business/lead', {
                nome: formData.nome.trim(),
                whatsapp: formData.whatsapp.trim(),
                plano: planoSelecionado,
                aceiteTermos: formData.aceiteTermos
            }, {
                timeout: 30000 // 30 segundos para aguardar cold start
            });

            // Redirecionar para tela de espera
            navigate('/aguardando-confirmacao', {
                state: {
                    businessId: response.data.businessId,
                    nome: formData.nome,
                    plano: planoSelecionado
                }
            });
        } catch (err: any) {
            console.error('Erro ao enviar solicitação:', err);
            setError(err.response?.data?.message || 'Erro ao processar solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Agendou</h1>
                            <p className="text-gray-600 mt-1">Sistema de agendamento profissional</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Já tem conta? Entrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Escolha o plano ideal para seu negócio
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Gerencie seus agendamentos de forma profissional e eficiente
                    </p>
                </div>

                {/* Planos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {planos.map((plano) => (
                        <div
                            key={plano.id}
                            className={`bg-white rounded-xl shadow-lg p-6 relative cursor-pointer transition-all ${
                                planoSelecionado === plano.id
                                    ? 'ring-4 ring-blue-500 scale-105'
                                    : 'hover:shadow-xl'
                            } ${plano.popular ? 'border-2 border-blue-500' : ''}`}
                            onClick={() => setPlanoSelecionado(plano.id)}
                        >
                            {plano.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        Mais Popular
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-center mb-4 text-blue-600">
                                {plano.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
                            <p className="text-3xl font-bold text-blue-600 mb-2">{plano.preco}</p>
                            <p className="text-gray-600 text-sm mb-6">{plano.descricao}</p>
                            <ul className="space-y-3">
                                {plano.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Formulário */}
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Preencha seus dados</h3>
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Negócio *
                            </label>
                            <input
                                type="text"
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ex: Salão Beleza & Estilo"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp *
                            </label>
                            <input
                                type="tel"
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="(00) 00000-0000"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Enviaremos o código de acesso e link de direcionamento neste número
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="aceiteTermos"
                                checked={formData.aceiteTermos}
                                onChange={(e) => setFormData({ ...formData, aceiteTermos: e.target.checked })}
                                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                required
                            />
                            <label htmlFor="aceiteTermos" className="text-sm text-gray-700">
                                Aceito os termos de uso e política de privacidade *
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !planoSelecionado}
                            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    Enviar Solicitação
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
