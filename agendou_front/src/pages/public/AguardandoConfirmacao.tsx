import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';

export default function AguardandoConfirmacao() {
    const location = useLocation();
    const navigate = useNavigate();
    const { businessId, nome, plano } = location.state || {};

    if (!businessId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Dados não encontrados</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                        Voltar para início
                    </button>
                </div>
            </div>
        );
    }

    const nomePlano = plano === 'FREE' ? 'Free' : 
                      plano === 'BASIC' ? 'Basic' :
                      plano === 'PRO' ? 'Pro' : 'Enterprise';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                        <Clock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Solicitação Recebida!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Recebemos seu pedido. Aguarde até 2 horas para confirmação no WhatsApp.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">Negócio</p>
                            <p className="font-semibold text-gray-900">{nome}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">Plano Escolhido</p>
                            <p className="font-semibold text-gray-900">{nomePlano}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold text-yellow-600">Aguardando Confirmação</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">O que acontece agora?</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• Nossa equipe analisará sua solicitação</li>
                                <li>• Em até 2 horas, você receberá uma mensagem no WhatsApp</li>
                                <li>• A mensagem conterá seu código de acesso e link de direcionamento</li>
                                <li>• Após receber, você poderá fazer login e começar a usar o sistema</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Ir para Login
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
