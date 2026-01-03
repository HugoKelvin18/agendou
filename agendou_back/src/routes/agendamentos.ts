import express from "express";
import * as AgendamentoController from "../controllers/AgendamentoController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";

const router = express.Router();

// Rotas de cliente
router.post("/cliente", authenticateToken, validateBusiness, requireRole(["CLIENTE"]), AgendamentoController.criarCliente);
router.get("/cliente/:clienteId", authenticateToken, validateBusiness, requireRole(["CLIENTE"]), AgendamentoController.listarCliente);
// Rota alternativa sem parâmetro (usa req.userId)
router.get("/cliente", authenticateToken, validateBusiness, requireRole(["CLIENTE"]), AgendamentoController.listarCliente);
router.patch("/:id/cancelar", authenticateToken, validateBusiness, requireRole(["CLIENTE"]), AgendamentoController.cancelarCliente);

// Rotas de profissional
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas dinâmicas
router.get("/profissional/faturamento", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), AgendamentoController.faturamento);
router.get("/profissional", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), AgendamentoController.listarProfissional);
router.get("/profissional/:profissionalId", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), AgendamentoController.listarProfissional);
router.patch("/:id/status", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), AgendamentoController.atualizarStatus);

export default router;
