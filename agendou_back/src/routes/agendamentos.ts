import express from "express";
import * as AgendamentoController from "../controllers/AgendamentoController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Rotas de cliente
router.post("/cliente", authenticateToken, requireRole(["CLIENTE"]), AgendamentoController.criarCliente);
router.get("/cliente/:clienteId", authenticateToken, requireRole(["CLIENTE"]), AgendamentoController.listarCliente);
// Rota alternativa sem parâmetro (usa req.userId)
router.get("/cliente", authenticateToken, requireRole(["CLIENTE"]), AgendamentoController.listarCliente);
router.patch("/:id/cancelar", authenticateToken, requireRole(["CLIENTE"]), AgendamentoController.cancelarCliente);

// Rotas de profissional
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas dinâmicas
router.get("/profissional/faturamento", authenticateToken, requireRole(["PROFISSIONAL"]), AgendamentoController.faturamento);
router.get("/profissional", authenticateToken, requireRole(["PROFISSIONAL"]), AgendamentoController.listarProfissional);
router.get("/profissional/:profissionalId", authenticateToken, requireRole(["PROFISSIONAL"]), AgendamentoController.listarProfissional);
router.patch("/:id/status", authenticateToken, requireRole(["PROFISSIONAL"]), AgendamentoController.atualizarStatus);

export default router;
