import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

export const getPerfil = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                role: true,
                mensagemPublica: true,
                createdAt: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        res.json(usuario);
    } catch (err: any) {
        console.error("Erro ao buscar perfil:", err);
        res.status(500).json({ message: "Erro ao buscar perfil" });
    }
};

export const updatePerfil = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;
        const { nome, telefone, mensagemPublica } = req.body;

        const dadosUpdate: any = {};
        if (nome) dadosUpdate.nome = nome;
        if (telefone !== undefined) dadosUpdate.telefone = telefone;
        if (mensagemPublica !== undefined) dadosUpdate.mensagemPublica = mensagemPublica;

        const usuario = await prisma.usuario.update({
            where: { id: usuarioId },
            data: dadosUpdate,
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                role: true,
                mensagemPublica: true,
                createdAt: true
            }
        });

        res.json(usuario);
    } catch (err: any) {
        console.error("Erro ao atualizar perfil:", err);
        res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
};

export const alterarSenha = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias" });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: "Senha atual incorreta" });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { id: usuarioId },
            data: { senha: novaSenhaHash }
        });

        res.json({ message: "Senha alterada com sucesso" });
    } catch (err: any) {
        console.error("Erro ao alterar senha:", err);
        res.status(500).json({ message: "Erro ao alterar senha" });
    }
};

export const listarProfissionais = async (req: Request, res: Response) => {
    try {
        const profissionais = await prisma.usuario.findMany({
            where: { role: "PROFISSIONAL" },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                mensagemPublica: true
            }
        });

        res.json(profissionais);
    } catch (err: any) {
        console.error("Erro ao listar profissionais:", err);
        res.status(500).json({ message: "Erro ao listar profissionais" });
    }
};
