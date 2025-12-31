import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();

// ✅ CORS: coloque aqui o domínio do seu front na Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://agendou-2026.vercel.app" // troque se mudar
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: Postman/insomnia)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

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

// ✅ Render usa PORT dinâmica
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
