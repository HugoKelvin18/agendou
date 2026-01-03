import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

// Listar todos os businesses com métricas
export const listarBusinesses = async (req: AuthRequest, res: Response) => {
    try {
        const businesses = await prisma.business.findMany({
            select: {
                id: true,
                nome: true,
                slug: true,
                dominio: true,
                ativo: true,
                plano: true,
                statusPagamento: true,
                vencimento: true,
                ultimoPagamento: true,
                dataBloqueio: true,
                toleranciaDias: true,
                limiteUsuarios: true,
                limiteProfissionais: true,
                limiteServicos: true,
                limiteAgendamentos: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Calcular métricas de uso para cada business
        const businessesComMetricas = await Promise.all(
            businesses.map(async (business) => {
                const [totalUsuarios, totalProfissionais, totalServicos, agendamentosMes] = await Promise.all([
                    prisma.usuario.count({
                        where: { businessId: business.id }
                    }),
                    prisma.usuario.count({
                        where: { businessId: business.id, role: "PROFISSIONAL" }
                    }),
                    prisma.servico.count({
                        where: { businessId: business.id, ativo: true }
                    }),
                    prisma.agendamento.count({
                        where: {
                            businessId: business.id,
                            criadoEm: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                            }
                        }
                    })
                ]);

                // Calcular dias em atraso se aplicável
                let diasAtraso = null;
                if (business.vencimento && business.statusPagamento !== "ATIVO") {
                    const hoje = new Date();
                    const vencimento = new Date(business.vencimento);
                    diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
                }

                return {
                    ...business,
                    metricas: {
                        totalUsuarios,
                        totalProfissionais,
                        totalServicos,
                        agendamentosMes,
                        diasAtraso
                    }
                };
            })
        );

        res.json(businessesComMetricas);
    } catch (err: any) {
        console.error("Erro ao listar businesses:", err);
        res.status(500).json({ message: "Erro ao listar businesses" });
    }
};

// Obter detalhes completos de um business
export const obterBusiness = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const business = await prisma.business.findUnique({
            where: { id: parseInt(id) },
            include: {
                usuarios: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                },
                servicos: {
                    where: { ativo: true },
                    select: {
                        id: true,
                        nome: true,
                        preco: true,
                        createdAt: true
                    }
                },
                agendamentos: {
                    take: 10,
                    orderBy: { criadoEm: "desc" },
                    select: {
                        id: true,
                        data: true,
                        hora: true,
                        status: true,
                        criadoEm: true
                    }
                }
            }
        });

        if (!business) {
            return res.status(404).json({ message: "Business não encontrado" });
        }

        // Calcular métricas
        const [totalUsuarios, totalProfissionais, totalServicos, agendamentosMes] = await Promise.all([
            prisma.usuario.count({
                where: { businessId: business.id }
            }),
            prisma.usuario.count({
                where: { businessId: business.id, role: "PROFISSIONAL" }
            }),
            prisma.servico.count({
                where: { businessId: business.id, ativo: true }
            }),
            prisma.agendamento.count({
                where: {
                    businessId: business.id,
                    criadoEm: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            })
        ]);

        let diasAtraso = null;
        if (business.vencimento && business.statusPagamento !== "ATIVO") {
            const hoje = new Date();
            const vencimento = new Date(business.vencimento);
            diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        }

        res.json({
            ...business,
            metricas: {
                totalUsuarios,
                totalProfissionais,
                totalServicos,
                agendamentosMes,
                diasAtraso
            }
        });
    } catch (err: any) {
        console.error("Erro ao obter business:", err);
        res.status(500).json({ message: "Erro ao obter business" });
    }
};

// Atualizar status de pagamento
export const atualizarStatusPagamento = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { statusPagamento } = req.body;

        if (!statusPagamento || !["ATIVO", "INADIMPLENTE", "BLOQUEADO", "CANCELADO"].includes(statusPagamento)) {
            return res.status(400).json({ message: "Status de pagamento inválido" });
        }

        const dadosUpdate: any = {
            statusPagamento
        };

        // Se estiver ativando, limpar dataBloqueio
        if (statusPagamento === "ATIVO") {
            dadosUpdate.dataBloqueio = null;
        } else if (statusPagamento === "BLOQUEADO") {
            dadosUpdate.dataBloqueio = new Date();
        }

        const business = await prisma.business.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
            select: {
                id: true,
                nome: true,
                statusPagamento: true,
                dataBloqueio: true,
                updatedAt: true
            }
        });

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao atualizar status de pagamento:", err);
        res.status(500).json({ message: "Erro ao atualizar status de pagamento" });
    }
};

// Atualizar plano
export const atualizarPlano = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { plano, limiteUsuarios, limiteProfissionais, limiteServicos, limiteAgendamentos } = req.body;

        const dadosUpdate: any = {};
        if (plano !== undefined) dadosUpdate.plano = plano;
        if (limiteUsuarios !== undefined) dadosUpdate.limiteUsuarios = limiteUsuarios;
        if (limiteProfissionais !== undefined) dadosUpdate.limiteProfissionais = limiteProfissionais;
        if (limiteServicos !== undefined) dadosUpdate.limiteServicos = limiteServicos;
        if (limiteAgendamentos !== undefined) dadosUpdate.limiteAgendamentos = limiteAgendamentos;

        const business = await prisma.business.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
            select: {
                id: true,
                nome: true,
                plano: true,
                limiteUsuarios: true,
                limiteProfissionais: true,
                limiteServicos: true,
                limiteAgendamentos: true,
                updatedAt: true
            }
        });

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao atualizar plano:", err);
        res.status(500).json({ message: "Erro ao atualizar plano" });
    }
};

// Registrar pagamento
export const registrarPagamento = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { ultimoPagamento, proximoVencimento } = req.body;

        if (!ultimoPagamento) {
            return res.status(400).json({ message: "Data do último pagamento é obrigatória" });
        }

        const dadosUpdate: any = {
            ultimoPagamento: new Date(ultimoPagamento),
            statusPagamento: "ATIVO",
            dataBloqueio: null // Limpar bloqueio ao registrar pagamento
        };

        if (proximoVencimento) {
            dadosUpdate.vencimento = new Date(proximoVencimento);
        }

        const business = await prisma.business.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
            select: {
                id: true,
                nome: true,
                statusPagamento: true,
                ultimoPagamento: true,
                vencimento: true,
                dataBloqueio: true,
                updatedAt: true
            }
        });

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao registrar pagamento:", err);
        res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
};

// Bloquear business
export const bloquearBusiness = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const business = await prisma.business.update({
            where: { id: parseInt(id) },
            data: {
                statusPagamento: "BLOQUEADO",
                dataBloqueio: new Date()
            },
            select: {
                id: true,
                nome: true,
                statusPagamento: true,
                dataBloqueio: true,
                updatedAt: true
            }
        });

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao bloquear business:", err);
        res.status(500).json({ message: "Erro ao bloquear business" });
    }
};

// Liberar business
export const liberarBusiness = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const business = await prisma.business.update({
            where: { id: parseInt(id) },
            data: {
                statusPagamento: "ATIVO",
                dataBloqueio: null
            },
            select: {
                id: true,
                nome: true,
                statusPagamento: true,
                dataBloqueio: true,
                updatedAt: true
            }
        });

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao liberar business:", err);
        res.status(500).json({ message: "Erro ao liberar business" });
    }
};

// Criar código de acesso admin (para criar novos admins)
export const criarCodigoAcessoAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { codigo, descricao, expiraEm } = req.body;

        if (!codigo) {
            return res.status(400).json({ message: "Código é obrigatório" });
        }

        // Buscar ou criar business especial para códigos admin (businessId 1 ou criar)
        let adminBusiness = await prisma.business.findFirst({
            where: { slug: "admin-system" }
        });

        if (!adminBusiness) {
            adminBusiness = await prisma.business.create({
                data: {
                    nome: "Sistema Admin",
                    slug: "admin-system",
                    ativo: true,
                    plano: "ADMIN",
                    statusPagamento: "ATIVO"
                }
            });
        }

        const codigoAcesso = await prisma.codigoAcesso.create({
            data: {
                businessId: adminBusiness.id,
                codigo: codigo.trim().toUpperCase(),
                descricao: descricao || "Código de acesso para administrador",
                expiraEm: expiraEm ? new Date(expiraEm) : null,
                ativo: true
            },
            select: {
                id: true,
                codigo: true,
                descricao: true,
                expiraEm: true,
                ativo: true,
                createdAt: true
            }
        });

        res.status(201).json(codigoAcesso);
    } catch (err: any) {
        console.error("Erro ao criar código de acesso admin:", err);
        if (err.code === "P2002") {
            return res.status(400).json({ message: "Código já existe" });
        }
        res.status(500).json({ message: "Erro ao criar código de acesso" });
    }
};
