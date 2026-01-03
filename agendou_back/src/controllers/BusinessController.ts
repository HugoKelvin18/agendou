import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

// Resolver business por slug ou domínio (público)
export const resolverBusiness = async (req: Request, res: Response) => {
    try {
        const { slug, dominio } = req.query;

        if (!slug && !dominio) {
            return res.status(400).json({ message: "Parâmetro slug ou dominio é obrigatório" });
        }

        const where: any = {};
        if (slug) {
            where.slug = slug;
        }
        if (dominio) {
            where.dominio = dominio;
        }
        where.ativo = true;

        const business = await prisma.business.findFirst({
            where,
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
                limiteAgendamentos: true
            }
        });

        if (!business) {
            return res.status(404).json({ message: "Negócio não encontrado" });
        }

        res.json(business);
    } catch (err: any) {
        console.error("Erro ao resolver business:", err);
        res.status(500).json({ message: "Erro ao resolver business" });
    }
};

// Listar businesses (admin - futuro)
export const listar = async (req: AuthRequest, res: Response) => {
    try {
        // Futuro: verificar se usuário é admin
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

        res.json(businesses);
    } catch (err: any) {
        console.error("Erro ao listar businesses:", err);
        res.status(500).json({ message: "Erro ao listar businesses" });
    }
};

// Criar business (admin - futuro)
export const criar = async (req: AuthRequest, res: Response) => {
    try {
        const { nome, slug, dominio } = req.body;

        if (!nome || !slug) {
            return res.status(400).json({ message: "Campos obrigatórios: nome, slug" });
        }

        // Validar formato do slug (apenas letras, números e hífens)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({ message: "Slug inválido. Use apenas letras minúsculas, números e hífens" });
        }

        // Verificar se slug já existe
        const slugExistente = await prisma.business.findUnique({
            where: { slug }
        });

        if (slugExistente) {
            return res.status(400).json({ message: "Slug já está em uso" });
        }

        // Verificar domínio se fornecido
        if (dominio) {
            const dominioExistente = await prisma.business.findUnique({
                where: { dominio }
            });

            if (dominioExistente) {
                return res.status(400).json({ message: "Domínio já está em uso" });
            }
        }

        const business = await prisma.business.create({
            data: {
                nome,
                slug,
                dominio: dominio || null,
                ativo: true,
                plano: "FREE", // Plano padrão
                statusPagamento: "ATIVO",
                toleranciaDias: 5
            },
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
                createdAt: true
            }
        });

        res.status(201).json(business);
    } catch (err: any) {
        console.error("Erro ao criar business:", err);
        res.status(500).json({ message: "Erro ao criar business" });
    }
};

// Atualizar business (admin - futuro)
export const atualizar = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, slug, dominio, ativo, plano, statusPagamento, vencimento, ultimoPagamento, dataBloqueio, toleranciaDias, limiteUsuarios, limiteProfissionais, limiteServicos, limiteAgendamentos } = req.body;

        const business = await prisma.business.findUnique({
            where: { id: parseInt(id) }
        });

        if (!business) {
            return res.status(404).json({ message: "Negócio não encontrado" });
        }

        const dadosUpdate: any = {};
        if (nome !== undefined) dadosUpdate.nome = nome;
        if (ativo !== undefined) dadosUpdate.ativo = ativo;
        if (plano !== undefined) dadosUpdate.plano = plano;
        if (statusPagamento !== undefined) dadosUpdate.statusPagamento = statusPagamento;
        if (vencimento !== undefined) dadosUpdate.vencimento = vencimento ? new Date(vencimento) : null;
        if (ultimoPagamento !== undefined) dadosUpdate.ultimoPagamento = ultimoPagamento ? new Date(ultimoPagamento) : null;
        if (dataBloqueio !== undefined) dadosUpdate.dataBloqueio = dataBloqueio ? new Date(dataBloqueio) : null;
        if (toleranciaDias !== undefined) dadosUpdate.toleranciaDias = toleranciaDias;
        if (limiteUsuarios !== undefined) dadosUpdate.limiteUsuarios = limiteUsuarios;
        if (limiteProfissionais !== undefined) dadosUpdate.limiteProfissionais = limiteProfissionais;
        if (limiteServicos !== undefined) dadosUpdate.limiteServicos = limiteServicos;
        if (limiteAgendamentos !== undefined) dadosUpdate.limiteAgendamentos = limiteAgendamentos;

        // Validar slug se fornecido
        if (slug !== undefined) {
            if (!/^[a-z0-9-]+$/.test(slug)) {
                return res.status(400).json({ message: "Slug inválido. Use apenas letras minúsculas, números e hífens" });
            }

            if (slug !== business.slug) {
                const slugExistente = await prisma.business.findUnique({
                    where: { slug }
                });

                if (slugExistente) {
                    return res.status(400).json({ message: "Slug já está em uso" });
                }
                dadosUpdate.slug = slug;
            }
        }

        // Validar domínio se fornecido
        if (dominio !== undefined) {
            if (dominio && dominio !== business.dominio) {
                const dominioExistente = await prisma.business.findUnique({
                    where: { dominio }
                });

                if (dominioExistente) {
                    return res.status(400).json({ message: "Domínio já está em uso" });
                }
            }
            dadosUpdate.dominio = dominio || null;
        }

        const businessAtualizado = await prisma.business.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
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
                updatedAt: true
            }
        });

        res.json(businessAtualizado);
    } catch (err: any) {
        console.error("Erro ao atualizar business:", err);
        res.status(500).json({ message: "Erro ao atualizar business" });
    }
};
