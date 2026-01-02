import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "seu-secret-aqui";

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios" });
        }

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

        const token = jwt.sign(
            { userId: usuario.id, role: usuario.role },
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
        const { nome, email, senha, telefone, role, codigoAcesso } = req.body;

        if (!nome || !email || !senha || !role) {
            return res.status(400).json({ message: "Campos obrigatórios: nome, email, senha, role" });
        }

        // Validar código de acesso se for profissional
        if (role === "PROFISSIONAL") {
            if (!codigoAcesso) {
                return res.status(400).json({ message: "Código de acesso é obrigatório para profissionais" });
            }

            // Buscar código de acesso no banco
            const codigo = await prisma.codigoAcesso.findUnique({
                where: { codigo: codigoAcesso.trim() }
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

        // Verificar se email já existe
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
            { userId: novoUsuario.id, role: novoUsuario.role },
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
