import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Criar lead (business pendente) a partir do formulário público
 */
export const criarLead = async (req: Request, res: Response) => {
    try {
        const { nome, whatsapp, plano, aceiteTermos } = req.body;

        // Validações
        if (!nome || !whatsapp || !plano) {
            return res.status(400).json({ 
                message: "Nome do negócio, WhatsApp e plano são obrigatórios" 
            });
        }

        if (!aceiteTermos) {
            return res.status(400).json({ 
                message: "É necessário aceitar os termos de uso" 
            });
        }

        // Validar plano
        const planosValidos = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
        if (!planosValidos.includes(plano)) {
            return res.status(400).json({ 
                message: "Plano inválido" 
            });
        }

        // Gerar slug único a partir do nome
        const slugBase = nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        let slug = slugBase;
        let contador = 1;
        
        // Garantir que o slug seja único
        while (await prisma.business.findUnique({ where: { slug } })) {
            slug = `${slugBase}-${contador}`;
            contador++;
        }

        // Criar business em estado PENDENTE
        const business = await prisma.business.create({
            data: {
                nome: nome.trim(),
                slug,
                whatsapp: whatsapp.trim(),
                plano,
                statusPagamento: "PENDENTE",
                ativo: false, // Inativo até confirmação
                vencimento: null, // Será definido quando ativado
                ultimoPagamento: null,
                dataBloqueio: null,
                toleranciaDias: 5
            }
        });

        return res.status(201).json({
            message: "Solicitação recebida com sucesso! Aguarde até 2 horas para confirmação.",
            businessId: business.id,
            business: {
                id: business.id,
                nome: business.nome,
                plano: business.plano,
                statusPagamento: business.statusPagamento
            }
        });
    } catch (error: any) {
        console.error("Erro ao criar lead:", error);
        return res.status(500).json({ 
            message: "Erro ao processar solicitação. Tente novamente." 
        });
    }
};

/**
 * Listar businesses pendentes (para admin)
 */
export const listarPendentes = async (req: Request, res: Response) => {
    try {
        const businesses = await prisma.business.findMany({
            where: {
                statusPagamento: "PENDENTE"
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                nome: true,
                slug: true,
                dominio: true,
                whatsapp: true,
                plano: true,
                statusPagamento: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.json(businesses);
    } catch (error: any) {
        console.error("Erro ao listar pendentes:", error);
        return res.status(500).json({ 
            message: "Erro ao listar solicitações pendentes" 
        });
    }
};

/**
 * Ativar business pendente (admin)
 */
export const ativarBusiness = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { codigoAcesso, dominio } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID do business é obrigatório" });
        }

        const business = await prisma.business.findUnique({
            where: { id: parseInt(id) }
        });

        if (!business) {
            return res.status(404).json({ message: "Business não encontrado" });
        }

        if (business.statusPagamento !== "PENDENTE") {
            return res.status(400).json({ 
                message: "Apenas businesses pendentes podem ser ativados" 
            });
        }

        // Calcular vencimento (30 dias a partir de agora)
        const vencimento = new Date();
        vencimento.setDate(vencimento.getDate() + 30);

        // Atualizar business
        const businessAtualizado = await prisma.business.update({
            where: { id: parseInt(id) },
            data: {
                statusPagamento: "ATIVO",
                ativo: true,
                vencimento,
                ultimoPagamento: new Date(),
                dominio: dominio || null
            }
        });

        // Criar código de acesso se fornecido
        if (codigoAcesso) {
            await prisma.codigoAcesso.create({
                data: {
                    businessId: businessAtualizado.id,
                    codigo: codigoAcesso.trim(),
                    ativo: true,
                    descricao: `Código criado na ativação do business ${businessAtualizado.nome}`
                }
            });
        }

        return res.json({
            message: "Business ativado com sucesso",
            business: businessAtualizado
        });
    } catch (error: any) {
        console.error("Erro ao ativar business:", error);
        return res.status(500).json({ 
            message: "Erro ao ativar business" 
        });
    }
};
