import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

// Função auxiliar para formatar tempo relativo
function formatarTempoRelativo(data: Date): string {
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHora = Math.floor(diffMin / 60);
    const diffDia = Math.floor(diffHora / 24);

    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHora < 24) return `${diffHora}h atrás`;
    if (diffDia === 1) return "ontem";
    return `${diffDia} dias atrás`;
}

export const listarCliente = async (req: AuthRequest, res: Response) => {
    try {
        const clienteId = req.userId!;
        const businessId = req.businessId!; // Garantido pelo middleware validateBusiness

        // 1. Buscar agendamentos pendentes recentes (últimos 30 dias)
        const dataLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const agendamentosRecentes = await prisma.agendamento.findMany({
            where: {
                clienteId,
                businessId: businessId, // Filtrar por businessId
                status: "PENDENTE",
                criadoEm: { gte: dataLimite }
            },
            include: {
                servico: true,
                profissional: { select: { nome: true } }
            },
            orderBy: { criadoEm: "desc" },
            take: 10
        });

        // 2. Buscar cancelamentos recentes (últimos 7 dias)
        const cancelamentos = await prisma.agendamento.findMany({
            where: {
                clienteId,
                businessId: businessId, // Filtrar por businessId
                status: "CANCELADO",
                atualizadoEm: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                profissional: { select: { nome: true } },
                servico: true
            },
            orderBy: { atualizadoEm: "desc" },
            take: 10
        });

        // 3. Buscar mensagens públicas de profissionais do mesmo business (últimos 30 dias)
        const dataLimiteMensagens = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const profissionaisComMensagem = await prisma.usuario.findMany({
            where: {
                role: "PROFISSIONAL",
                businessId: businessId, // Filtrar por businessId do cliente
                mensagemPublica: { not: null },
                updatedAt: {
                    gte: dataLimiteMensagens
                }
            },
            select: {
                id: true,
                nome: true,
                mensagemPublica: true,
                updatedAt: true
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // 4. Buscar IDs de notificações já lidas
        const notificacoesLidas = await prisma.notificacaoLida.findMany({
            where: { usuarioId: clienteId },
            select: { notificacaoId: true }
        });
        const idsLidas = new Set(notificacoesLidas.map(n => n.notificacaoId));

        const notificacoes: any[] = [];

        // Notificações de agendamentos
        for (const ag of agendamentosRecentes) {
            const notifId = `app-${ag.id}`;
            notificacoes.push({
                id: notifId,
                type: "appointment",
                title: `Agendamento: ${ag.servico.nome}`,
                message: `Agendado com ${ag.profissional.nome} para ${new Date(ag.data).toLocaleDateString("pt-BR")} às ${ag.hora}`,
                time: formatarTempoRelativo(ag.criadoEm),
                timestamp: ag.criadoEm.getTime(),
                read: idsLidas.has(notifId),
                actionUrl: `/cliente/agendamentos`
            });
        }

        // Notificações de cancelamentos
        for (const ag of cancelamentos) {
            const cancelId = `cancel-${ag.id}`;
            notificacoes.push({
                id: cancelId,
                type: "cancellation",
                title: `Agendamento cancelado`,
                message: `Profissional: ${ag.profissional.nome} • ${new Date(ag.data).toLocaleDateString("pt-BR")} às ${ag.hora}`,
                time: formatarTempoRelativo(ag.atualizadoEm),
                timestamp: ag.atualizadoEm.getTime(),
                read: idsLidas.has(cancelId),
                actionUrl: `/cliente/agendamentos`
            });
        }

        // Adicionar notificações de mensagens (uma por profissional)
        const profissionaisProcessados = new Set<number>();
        
        for (const prof of profissionaisComMensagem) {
            if (!profissionaisProcessados.has(prof.id)) {
                profissionaisProcessados.add(prof.id);
                
                // ID inclui timestamp para que mensagens editadas apareçam como novas
                const msgId = `msg-${prof.id}-${new Date(prof.updatedAt!).getTime()}`;
                
                notificacoes.push({
                    id: msgId,
                    type: "message",
                    title: `Mensagem de ${prof.nome}`,
                    message: prof.mensagemPublica,
                    time: formatarTempoRelativo(prof.updatedAt!),
                    timestamp: new Date(prof.updatedAt!).getTime(),
                    read: idsLidas.has(msgId),
                    actionUrl: `/cliente/agendar?profissional=${prof.id}`
                });
            }
        }

        // Ordenar por timestamp (mais recentes primeiro)
        notificacoes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        res.json(notificacoes.slice(0, 20));
    } catch (err: any) {
        console.error("Erro ao listar notificações do cliente:", err);
        res.status(500).json({ message: "Erro ao buscar notificações" });
    }
};

export const listarProfissional = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const businessId = req.businessId!; // Garantido pelo middleware validateBusiness

        // Buscar agendamentos novos (últimos 30 dias)
        const dataLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const agendamentosNovos = await prisma.agendamento.findMany({
            where: {
                profissionalId,
                businessId: businessId, // Filtrar por businessId
                status: "PENDENTE",
                criadoEm: { gte: dataLimite }
            },
            include: {
                cliente: true,
                servico: true
            },
            orderBy: { criadoEm: "desc" },
            take: 10
        });

        // Buscar cancelamentos recentes
        const cancelamentos = await prisma.agendamento.findMany({
            where: {
                profissionalId,
                businessId: businessId, // Filtrar por businessId
                status: "CANCELADO",
                atualizadoEm: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                cliente: true,
                servico: true
            },
            orderBy: { atualizadoEm: "desc" },
            take: 10
        });

        // Buscar IDs de notificações já lidas
        const notificacoesLidas = await prisma.notificacaoLida.findMany({
            where: { usuarioId: profissionalId },
            select: { notificacaoId: true }
        });
        const idsLidas = new Set(notificacoesLidas.map(n => n.notificacaoId));

        const notificacoes: any[] = [];

        // Notificações de novos agendamentos
        for (const ag of agendamentosNovos) {
            const notifId = `app-${ag.id}`;
            const dataAgendamento = new Date(ag.data);
            notificacoes.push({
                id: notifId,
                type: "appointment",
                title: `Novo agendamento: ${ag.servico.nome}`,
                message: `${ag.cliente.nome} agendou para ${dataAgendamento.toLocaleDateString("pt-BR")} às ${ag.hora}`,
                time: formatarTempoRelativo(ag.criadoEm),
                timestamp: ag.criadoEm.getTime(),
                read: idsLidas.has(notifId),
                actionUrl: `/profissional/agendamentos`
            });
        }

        // Notificações de cancelamentos
        for (const ag of cancelamentos) {
            const dataAgendamento = new Date(ag.data);
            const horaParts = ag.hora.split(":");
            dataAgendamento.setHours(parseInt(horaParts[0]), parseInt(horaParts[1]), 0, 0);
            const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

            const cancelId = `cancel-${ag.id}`;
            notificacoes.push({
                id: cancelId,
                type: "cancellation",
                title: `Agendamento cancelado`,
                message: `Cliente: ${ag.cliente.nome} • ${dataFormatada} às ${ag.hora}`,
                time: formatarTempoRelativo(ag.atualizadoEm),
                timestamp: ag.atualizadoEm.getTime(),
                read: idsLidas.has(cancelId),
                actionUrl: `/profissional/agendamentos`
            });
        }

        // Ordenar por timestamp (mais recentes primeiro)
        notificacoes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        res.json(notificacoes.slice(0, 20));
    } catch (err: any) {
        console.error("Erro ao listar notificações do profissional:", err);
        res.status(500).json({ message: "Erro ao buscar notificações" });
    }
};

export const marcarComoLida = async (req: AuthRequest, res: Response) => {
    try {
        const { notificacaoId } = req.body;
        const usuarioId = req.userId!;

        // Verificar se já existe
        const existente = await prisma.notificacaoLida.findFirst({
            where: {
                usuarioId,
                notificacaoId: String(notificacaoId)
            }
        });

        if (!existente) {
            await prisma.notificacaoLida.create({
                data: {
                    usuarioId,
                    notificacaoId: String(notificacaoId)
                }
            });
        }

        res.json({ message: "Notificação marcada como lida" });
    } catch (err: any) {
        console.error("Erro ao marcar notificação como lida:", err);
        res.status(500).json({ message: "Erro ao marcar notificação" });
    }
};
