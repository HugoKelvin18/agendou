import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
    body: any;
    params: any;
    query: any;
}

interface BusinessRequest extends Request {
    businessId?: number;
    query: any;
}

export const getPerfil = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;
        const businessId = req.businessId!;

        const usuario = await prisma.usuario.findFirst({
            where: { 
                id: usuarioId,
                businessId: businessId
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                role: true,
                mensagemPublica: true,
                cidade: true,
                bairro: true,
                endereco: true,
                numero: true,
                complemento: true,
                uf: true,
                cep: true,
                whatsapp: true,
                emailPublico: true,
                instagram: true,
                facebook: true,
                tiktok: true,
                site: true,
                linkedin: true,
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
        const { 
            nome, telefone, mensagemPublica,
            cidade, bairro, endereco, numero, complemento, uf, cep,
            whatsapp, emailPublico,
            instagram, facebook, tiktok, site, linkedin
        } = req.body;

        const dadosUpdate: any = {};
        if (nome) dadosUpdate.nome = nome;
        if (telefone !== undefined) dadosUpdate.telefone = telefone;
        if (mensagemPublica !== undefined) dadosUpdate.mensagemPublica = mensagemPublica;
        if (cidade !== undefined) dadosUpdate.cidade = cidade;
        if (bairro !== undefined) dadosUpdate.bairro = bairro;
        if (endereco !== undefined) dadosUpdate.endereco = endereco;
        if (numero !== undefined) dadosUpdate.numero = numero;
        if (complemento !== undefined) dadosUpdate.complemento = complemento;
        if (uf !== undefined) dadosUpdate.uf = uf;
        if (cep !== undefined) dadosUpdate.cep = cep;
        if (whatsapp !== undefined) dadosUpdate.whatsapp = whatsapp;
        if (emailPublico !== undefined) dadosUpdate.emailPublico = emailPublico;
        if (instagram !== undefined) dadosUpdate.instagram = instagram;
        if (facebook !== undefined) dadosUpdate.facebook = facebook;
        if (tiktok !== undefined) dadosUpdate.tiktok = tiktok;
        if (site !== undefined) dadosUpdate.site = site;
        if (linkedin !== undefined) dadosUpdate.linkedin = linkedin;

        // Verificar se usuário pertence ao businessId
        const usuarioExistente = await prisma.usuario.findFirst({
            where: { 
                id: usuarioId,
                businessId: req.businessId!
            }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

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
                cidade: true,
                bairro: true,
                endereco: true,
                numero: true,
                complemento: true,
                uf: true,
                cep: true,
                whatsapp: true,
                emailPublico: true,
                instagram: true,
                facebook: true,
                tiktok: true,
                site: true,
                linkedin: true,
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
        const businessId = req.businessId; // Pode ser null para admins
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias" });
        }

        // Para não-admins, verificar businessId; para admins, businessId pode ser null
        const whereClause: any = { id: usuarioId };
        if (businessId !== null && businessId !== undefined) {
            whereClause.businessId = businessId;
        } else {
            // Se businessId é null, verificar se é admin
            whereClause.role = "ADMIN";
        }

        const usuario = await prisma.usuario.findFirst({
            where: whereClause
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

export const listarProfissionais = async (req: BusinessRequest, res: Response) => {
    try {
        const businessId = req.businessId!; // Garantido pelo middleware validateBusiness

        const profissionais = await prisma.usuario.findMany({
            where: { 
                role: "PROFISSIONAL",
                businessId: businessId
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                mensagemPublica: true,
                cidade: true,
                bairro: true,
                endereco: true,
                numero: true,
                complemento: true,
                uf: true,
                cep: true,
                whatsapp: true,
                emailPublico: true,
                instagram: true,
                facebook: true,
                tiktok: true,
                site: true,
                linkedin: true
            }
        });

        res.json(profissionais);
    } catch (err: any) {
        console.error("Erro ao listar profissionais:", err);
        res.status(500).json({ message: "Erro ao listar profissionais" });
    }
};
