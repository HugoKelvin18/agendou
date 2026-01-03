import { prisma } from "../lib/prisma.js";

/**
 * Middleware para verificar se o business está bloqueado
 * Deve ser usado APÓS validateBusiness
 * Usado especificamente em rotas de autenticação (login/register)
 */
export const checkBusinessBlocked = async (req, res, next) => {
    try {
        const businessId = req.businessId;

        if (!businessId) {
            return res.status(400).json({ message: "businessId não fornecido" });
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: {
                id: true,
                ativo: true,
                statusPagamento: true,
                vencimento: true,
                toleranciaDias: true,
                dataBloqueio: true
            }
        });

        if (!business || !business.ativo) {
            return res.status(403).json({ 
                message: "Negócio não encontrado ou inativo",
                code: "BUSINESS_INACTIVE"
            });
        }

        // Verificar se está bloqueado
        if (business.statusPagamento === "BLOQUEADO") {
            return res.status(403).json({ 
                message: "Acesso bloqueado. Entre em contato com o suporte para regularizar sua situação.",
                code: "BUSINESS_BLOCKED",
                dataBloqueio: business.dataBloqueio
            });
        }

        // Verificar se está cancelado
        if (business.statusPagamento === "CANCELADO") {
            return res.status(403).json({ 
                message: "Assinatura cancelada. Entre em contato com o suporte.",
                code: "BUSINESS_CANCELLED"
            });
        }

        // Verificar inadimplência (vencimento + tolerância)
        if (business.vencimento) {
            const hoje = new Date();
            const vencimento = new Date(business.vencimento);
            const toleranciaDias = business.toleranciaDias || 5;
            const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
            
            // Se está inadimplente e passou da tolerância, bloquear
            if (business.statusPagamento === "INADIMPLENTE" && diasAtraso > toleranciaDias) {
                // Bloquear automaticamente
                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        statusPagamento: "BLOQUEADO",
                        dataBloqueio: hoje
                    }
                });
                
                return res.status(403).json({ 
                    message: `Acesso bloqueado por inadimplência. Vencimento há ${diasAtraso} dias. Entre em contato com o suporte para regularizar.`,
                    code: "BUSINESS_OVERDUE_BLOCKED",
                    diasAtraso,
                    vencimento: business.vencimento
                });
            }

            // Se está vencido mas ainda dentro da tolerância, permitir mas avisar
            if (diasAtraso > 0 && diasAtraso <= toleranciaDias && business.statusPagamento !== "INADIMPLENTE") {
                // Atualizar status para inadimplente se ainda não estiver
                if (business.statusPagamento === "ATIVO") {
                    await prisma.business.update({
                        where: { id: businessId },
                        data: { statusPagamento: "INADIMPLENTE" }
                    });
                }
                
                // Permitir acesso mas adicionar aviso no header (opcional)
                res.setHeader("X-Payment-Warning", `Vencimento há ${diasAtraso} dias. Regularize em até ${toleranciaDias - diasAtraso} dias.`);
            }
        }

        next();
    } catch (error) {
        console.error("Erro ao verificar bloqueio do business:", error);
        return res.status(500).json({ message: "Erro ao verificar status do negócio" });
    }
};
