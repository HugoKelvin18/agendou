import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

// Criar solicitação de suporte (profissional)
export const criarSolicitacao = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;
        const businessId = req.businessId!;
        const { assunto, descricao } = req.body;

        if (!assunto || !descricao) {
            return res.status(400).json({ message: "Assunto e descrição são obrigatórios" });
        }

        // Verificar se usuário é profissional
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuario || usuario.role !== "PROFISSIONAL") {
            return res.status(403).json({ message: "Apenas profissionais podem criar solicitações de suporte" });
        }

        const solicitacao = await prisma.solicitacaoSuporte.create({
            data: {
                businessId,
                usuarioId,
                assunto: assunto.trim(),
                descricao: descricao.trim(),
                status: "PENDENTE"
            },
            include: {
                business: {
                    select: {
                        id: true,
                        nome: true,
                        slug: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json(solicitacao);
    } catch (err: any) {
        console.error("Erro ao criar solicitação de suporte:", err);
        res.status(500).json({ message: "Erro ao criar solicitação de suporte" });
    }
};

// Listar solicitações de suporte do profissional
export const listarMinhasSolicitacoes = async (req: AuthRequest, res: Response) => {
    try {
        const usuarioId = req.userId!;

        const solicitacoes = await prisma.solicitacaoSuporte.findMany({
            where: { usuarioId },
            include: {
                business: {
                    select: {
                        id: true,
                        nome: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                criadoEm: "desc"
            }
        });

        res.json(solicitacoes);
    } catch (err: any) {
        console.error("Erro ao listar solicitações:", err);
        res.status(500).json({ message: "Erro ao listar solicitações" });
    }
};

// Listar todas as solicitações (admin)
export const listarTodasSolicitacoes = async (req: AuthRequest, res: Response) => {
    try {
        const { status, businessId } = req.query;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (businessId) {
            where.businessId = parseInt(businessId as string);
        }

        const solicitacoes = await prisma.solicitacaoSuporte.findMany({
            where,
            include: {
                business: {
                    select: {
                        id: true,
                        nome: true,
                        slug: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: {
                criadoEm: "desc"
            }
        });

        res.json(solicitacoes);
    } catch (err: any) {
        console.error("Erro ao listar solicitações:", err);
        res.status(500).json({ message: "Erro ao listar solicitações" });
    }
};

// Responder solicitação (admin)
export const responderSolicitacao = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { resposta, status } = req.body;

        if (!resposta || !resposta.trim()) {
            return res.status(400).json({ message: "Resposta é obrigatória" });
        }

        const dadosUpdate: any = {
            resposta: resposta.trim(),
            respondidoEm: new Date()
        };

        if (status && ["PENDENTE", "EM_ATENDIMENTO", "RESOLVIDO", "CANCELADO"].includes(status)) {
            dadosUpdate.status = status;
        } else {
            dadosUpdate.status = "RESOLVIDO";
        }

        const solicitacao = await prisma.solicitacaoSuporte.update({
            where: { id: parseInt(id) },
            data: dadosUpdate,
            include: {
                business: {
                    select: {
                        id: true,
                        nome: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });

        res.json(solicitacao);
    } catch (err: any) {
        console.error("Erro ao responder solicitação:", err);
        res.status(500).json({ message: "Erro ao responder solicitação" });
    }
};
