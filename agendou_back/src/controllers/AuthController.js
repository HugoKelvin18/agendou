import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "seu-secret-aqui";

export const login = async (req, res) => {
    try {
        const { email, senha, businessId } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios" });
        }

        // Buscar usuário por email (único globalmente agora)
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }

        // Se for ADMIN, não precisa validar business
        if (usuario.role === "ADMIN") {
            const token = jwt.sign(
                { userId: usuario.id, role: usuario.role, businessId: null },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            const { senha: _, ...usuarioSemSenha } = usuario;

            return res.json({
                token,
                user: usuarioSemSenha
            });
        }

        // Para CLIENTE e PROFISSIONAL, validar business
        const businessIdFinal = businessId || usuario.businessId || parseInt(req.headers["x-business-id"] || "0");
        
        if (!businessIdFinal || businessIdFinal === 0) {
            return res.status(400).json({ message: "businessId é obrigatório" });
        }

        // Verificar se businessId do usuário corresponde
        if (usuario.businessId !== businessIdFinal) {
            return res.status(403).json({ message: "Usuário não pertence a este negócio" });
        }

        // Verificar bloqueio do business antes de autenticar
        const business = await prisma.business.findUnique({
            where: { id: businessIdFinal }
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
            const vencimento = new Date(business.vencimento);
            const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
            
            // Se está inadimplente e passou da tolerância, bloquear
            if (business.statusPagamento === "INADIMPLENTE" && diasAtraso > toleranciaDias) {
                // Bloquear automaticamente
                await prisma.business.update({
                    where: { id: businessIdFinal },
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
        }

        const token = jwt.sign(
            { userId: usuario.id, role: usuario.role, businessId: usuario.businessId },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = usuario;

        res.json({
            token,
            user: usuarioSemSenha
        });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro ao realizar login" });
    }
};

export const register = async (req, res) => {
    try {
        const { nome, email, senha, telefone, role, codigoAcesso, businessId } = req.body;

        if (!nome || !email || !senha || !role) {
            return res.status(400).json({ message: "Campos obrigatórios: nome, email, senha, role" });
        }

        // Se for ADMIN, validar código de acesso especial (ANTES de validar businessId)
        if (role === "ADMIN") {
            if (!codigoAcesso) {
                return res.status(400).json({ message: "Código de acesso é obrigatório para administradores" });
            }

            // Buscar business admin-system
            const adminBusiness = await prisma.business.findFirst({
                where: { slug: "admin-system" }
            });

            if (!adminBusiness) {
                return res.status(403).json({ message: "Sistema de administração não configurado" });
            }

            // Buscar código de acesso admin no business admin-system
            const codigo = await prisma.codigoAcesso.findUnique({
                where: { 
                    businessId_codigo: {
                        businessId: adminBusiness.id,
                        codigo: codigoAcesso.trim().toUpperCase()
                    }
                }
            });

            if (!codigo) {
                return res.status(403).json({ message: "Código de acesso inválido" });
            }

            if (!codigo.ativo) {
                return res.status(403).json({ message: "Código de acesso está inativo" });
            }

            // Verificar se expirou
            if (codigo.expiraEm && new Date() > codigo.expiraEm) {
                return res.status(403).json({ message: "Código de acesso expirado" });
            }

            // Admin não precisa de businessId
            const senhaHash = await bcrypt.hash(senha, 10);

            const novoUsuario = await prisma.usuario.create({
                data: {
                    businessId: null, // Admin não tem businessId
                    nome,
                    email,
                    senha: senhaHash,
                    telefone: telefone || null,
                    role: "ADMIN",
                    mensagemPublica: null
                }
            });

            const token = jwt.sign(
                { userId: novoUsuario.id, role: novoUsuario.role, businessId: null },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            const { senha: _, ...usuarioSemSenha } = novoUsuario;

            return res.status(201).json({
                message: "Administrador cadastrado com sucesso",
                token,
                user: usuarioSemSenha
            });
        }

        // Para CLIENTE e PROFISSIONAL, businessId é obrigatório
        const businessIdFinal = businessId || parseInt(req.headers["x-business-id"] || "0");
        if (!businessIdFinal || businessIdFinal === 0) {
            return res.status(400).json({ message: "businessId é obrigatório" });
        }

        // Validar se business existe e está ativo
        const business = await prisma.business.findUnique({
            where: { id: businessIdFinal }
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
            const vencimento = new Date(business.vencimento);
            const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
            
            // Se está inadimplente e passou da tolerância, bloquear
            if (business.statusPagamento === "INADIMPLENTE" && diasAtraso > toleranciaDias) {
                // Bloquear automaticamente
                await prisma.business.update({
                    where: { id: businessIdFinal },
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
        }

        // Validar código de acesso se for profissional
        if (role === "PROFISSIONAL") {
            if (!codigoAcesso) {
                return res.status(400).json({ message: "Código de acesso é obrigatório para profissionais" });
            }

            // Buscar código de acesso no banco (com businessId)
            const codigo = await prisma.codigoAcesso.findUnique({
                where: { 
                    businessId_codigo: {
                        businessId: businessIdFinal,
                        codigo: codigoAcesso.trim()
                    }
                }
            });

            if (!codigo) {
                return res.status(403).json({ message: "Código de acesso inválido" });
            }

            if (!codigo.ativo) {
                return res.status(403).json({ message: "Código de acesso está inativo" });
            }

            // Verificar se expirou
            if (codigo.expiraEm && new Date() > codigo.expiraEm) {
                return res.status(403).json({ message: "Código de acesso expirado" });
            }
        }

        // Verificar se email já existe (único globalmente)
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return res.status(400).json({ message: "Email já cadastrado" });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Criar usuário
        const novoUsuario = await prisma.usuario.create({
            data: {
                businessId: businessIdFinal,
                nome,
                email,
                senha: senhaHash,
                telefone: telefone || null,
                role,
                mensagemPublica: null
            }
        });

        // Gerar token
        const token = jwt.sign(
            { userId: novoUsuario.id, role: novoUsuario.role, businessId: novoUsuario.businessId },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = novoUsuario;

        res.status(201).json({
            message: "Usuário cadastrado com sucesso",
            token,
            user: usuarioSemSenha
        });
    } catch (err) {
        console.error("Erro no cadastro:", err);
        console.error("Detalhes do erro:", {
            message: err.message,
            code: err.code,
            meta: err.meta
        });
        
        // Retornar erro mais detalhado em desenvolvimento
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? "Erro ao cadastrar usuário" 
            : err.message || "Erro ao cadastrar usuário";
            
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
            code: process.env.NODE_ENV !== 'production' ? err.code : undefined
        });
    }
};
