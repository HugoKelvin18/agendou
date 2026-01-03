import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

interface BusinessRequest extends Request {
    businessId?: number;
}

// Listar todos os serviços
export const listar = async (req: BusinessRequest, res: Response) => {
    try {
        const businessId = req.businessId!; // Garantido pelo middleware validateBusiness

        const servicos = await prisma.servico.findMany({
            where: { 
                ativo: true,
                businessId: businessId
            },
            include: {
                profissional: { select: { id: true, nome: true } }
            }
        });

        res.json(servicos);
    } catch (err: any) {
        console.error("Erro ao listar serviços:", err);
        res.status(500).json({ message: "Erro ao listar serviços" });
    }
};

// Listar serviços por profissional
export const listarPorProfissional = async (req: BusinessRequest, res: Response) => {
    try {
        const { id } = req.params;
        const businessId = req.businessId!; // Garantido pelo middleware validateBusiness

        const servicos = await prisma.servico.findMany({
            where: {
                profissionalId: parseInt(id),
                ativo: true,
                businessId: businessId
            },
            include: {
                profissional: { select: { id: true, nome: true } }
            }
        });

        res.json(servicos);
    } catch (err: any) {
        console.error("Erro ao listar serviços do profissional:", err);
        res.status(500).json({ message: "Erro ao listar serviços" });
    }
};

// Criar serviço (profissional)
export const criar = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const businessId = req.businessId!;
        const { nome, descricao, preco, duracao, imagemUrl } = req.body;

        if (!nome || !descricao || preco === undefined || !duracao) {
            return res.status(400).json({ message: "Campos obrigatórios: nome, descricao, preco, duracao" });
        }

        const servico = await prisma.servico.create({
            data: {
                businessId: businessId,
                nome,
                descricao,
                preco: parseFloat(preco),
                duracao: parseInt(duracao),
                profissionalId,
                imagemUrl: imagemUrl || null,
                ativo: true
            },
            include: {
                profissional: { select: { id: true, nome: true } }
            }
        });

        res.status(201).json(servico);
    } catch (err: any) {
        console.error("Erro ao criar serviço:", err);
        res.status(500).json({ message: "Erro ao criar serviço" });
    }
};

// Atualizar serviço (profissional)
export const atualizar = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { id } = req.params;
        const { nome, descricao, preco, duracao, imagemUrl } = req.body;

        // Verificar se o serviço pertence ao profissional e business
        const servicoExistente = await prisma.servico.findFirst({
            where: {
                id: parseInt(id),
                profissionalId,
                businessId: req.businessId!
            }
        });

        if (!servicoExistente) {
            return res.status(404).json({ message: "Serviço não encontrado" });
        }

        const dadosUpdate: any = {};
        if (nome) dadosUpdate.nome = nome;
        if (descricao) dadosUpdate.descricao = descricao;
        if (preco !== undefined) dadosUpdate.preco = parseFloat(preco);
        if (duracao) dadosUpdate.duracao = parseInt(duracao);
        if (imagemUrl !== undefined) dadosUpdate.imagemUrl = imagemUrl;

        const servico = await prisma.servico.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
            include: {
                profissional: { select: { id: true, nome: true } }
            }
        });

        res.json(servico);
    } catch (err: any) {
        console.error("Erro ao atualizar serviço:", err);
        res.status(500).json({ message: "Erro ao atualizar serviço" });
    }
};

// Deletar serviço (profissional) - soft delete
export const deletar = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { id } = req.params;

        const servicoExistente = await prisma.servico.findFirst({
            where: {
                id: parseInt(id),
                profissionalId,
                businessId: req.businessId!
            }
        });

        if (!servicoExistente) {
            return res.status(404).json({ message: "Serviço não encontrado" });
        }

        await prisma.servico.update({
            where: { id: parseInt(id) },
            data: { ativo: false }
        });

        res.json({ message: "Serviço deletado com sucesso" });
    } catch (err: any) {
        console.error("Erro ao deletar serviço:", err);
        res.status(500).json({ message: "Erro ao deletar serviço" });
    }
};
