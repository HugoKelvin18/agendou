import { prisma } from "../lib/prisma.js";

/**
 * Middleware para validar e resolver businessId do header ou token
 * Deve ser usado APÓS authenticateToken
 */
export const validateBusiness = async (req, res, next) => {
    try {
        const headerBusinessId = req.headers["x-business-id"];
        const tokenBusinessId = req.businessId; // Vem do authenticateToken

        let businessId = null;

        // Priorizar header, depois token
        if (headerBusinessId) {
            businessId = parseInt(headerBusinessId);
        } else if (tokenBusinessId) {
            businessId = tokenBusinessId;
        }

        if (!businessId || isNaN(businessId)) {
            return res.status(400).json({ message: "businessId não fornecido ou inválido" });
        }

        // Verificar se business existe e está ativo
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if (!business || !business.ativo) {
            return res.status(404).json({ message: "Negócio não encontrado ou inativo" });
        }

        // Verificar bloqueio e inadimplência
        const hoje = new Date();
        const toleranciaDias = business.toleranciaDias || 5;
        
        // Verificar se está bloqueado
        if (business.statusPagamento === "BLOQUEADO") {
            return res.status(403).json({ 
                message: "Acesso bloqueado. Entre em contato com o suporte.",
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
        if (business.vencimento && business.statusPagamento === "INADIMPLENTE") {
            const diasAtraso = Math.floor((hoje - new Date(business.vencimento)) / (1000 * 60 * 60 * 24));
            
            if (diasAtraso > toleranciaDias) {
                // Bloquear automaticamente após tolerância
                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        statusPagamento: "BLOQUEADO",
                        dataBloqueio: hoje
                    }
                });
                
                return res.status(403).json({ 
                    message: `Acesso bloqueado por inadimplência. Vencimento há ${diasAtraso} dias. Entre em contato com o suporte.`,
                    code: "BUSINESS_OVERDUE_BLOCKED",
                    diasAtraso,
                    vencimento: business.vencimento
                });
            }
        }

        // Validar que o businessId do token corresponde ao do header (se ambos existirem)
        if (headerBusinessId && tokenBusinessId && parseInt(headerBusinessId) !== tokenBusinessId) {
            return res.status(403).json({ message: "businessId do header não corresponde ao do token" });
        }

        // Se usuário autenticado, verificar se pertence ao business
        if (req.userId) {
            const usuario = await prisma.usuario.findUnique({
                where: { id: req.userId },
                select: { businessId: true }
            });

            if (!usuario || usuario.businessId !== businessId) {
                return res.status(403).json({ message: "Usuário não pertence a este negócio" });
            }
        }

        req.businessId = businessId;
        next();
    } catch (error) {
        console.error("Erro ao validar business:", error);
        return res.status(500).json({ message: "Erro ao validar business" });
    }
};
