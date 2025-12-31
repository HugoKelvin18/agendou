import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "seu-secret-aqui");
        
        const user = await prisma.usuario.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        req.userId = decoded.userId;
        req.userRole = user.role;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido ou expirado" });
    }
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ message: "Acesso negado" });
        }
        next();
    };
};
