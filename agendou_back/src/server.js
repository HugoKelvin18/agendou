import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();

// ✅ CORS: lê origens permitidas de variável de ambiente ou usa fallback
// Em produção, defina CORS_ORIGINS no .env com URLs separadas por vírgula
// Exemplo: CORS_ORIGINS=https://agendou-2026.vercel.app,https://seu-dominio.vercel.app
const corsOriginsEnv = process.env.CORS_ORIGINS;

let allowedOrigins;

if (corsOriginsEnv) {
  // Se CORS_ORIGINS está definida, usar ela (separada por vírgula)
  allowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim());
  console.log(`✅ CORS configurado com origens do ambiente: ${allowedOrigins.join(', ')}`);
} else {
  // Fallback para desenvolvimento local
  allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://agendou-2026.vercel.app",
    "https://agendou-seven.vercel.app"
  ];
  console.log(`⚠️ CORS_ORIGINS não definida, usando fallback (desenvolvimento local)`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: Postman/insomnia)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
        console.warn(`   Origens permitidas: ${allowedOrigins.join(', ')}`);
      }

      return callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());

// ✅ Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agendou-api" });
});

// ✅ Rota raiz
app.get("/", (_req, res) => {
  res.json({ message: "API Agendou funcionando!" });
});

// ✅ Teste de conexão com o banco (Neon)
app.get("/db-check", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: "Conexão com o banco OK ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Falha ao conectar no banco ❌" });
  }
});

// ✅ Rotas da API
import authRoutes from "./routes/auth.js";
import usuarioRoutes from "./routes/usuarios.js";
import agendamentoRoutes from "./routes/agendamentos.js";
import servicoRoutes from "./routes/servicos.js";
import disponibilidadeRoutes from "./routes/disponibilidades.js";
import notificacaoRoutes from "./routes/notificacoes.js";

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/agendamentos", agendamentoRoutes);
app.use("/servicos", servicoRoutes);
app.use("/disponibilidades", disponibilidadeRoutes);
app.use("/notificacoes", notificacaoRoutes);

// ✅ Render usa PORT dinâmica
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
