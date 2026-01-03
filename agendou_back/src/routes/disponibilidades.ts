import express from "express";
import * as DisponibilidadeController from "../controllers/DisponibilidadeController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";

const router = express.Router();

// Rotas públicas que dependem de business
router.get("/", validateBusiness, DisponibilidadeController.listar);
router.get("/horarios-disponiveis", validateBusiness, DisponibilidadeController.horariosDisponiveis);

// Rotas autenticadas
router.get("/profissional", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), DisponibilidadeController.listarPorProfissional);
router.post("/", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), DisponibilidadeController.criar);
router.delete("/:id", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), DisponibilidadeController.deletar);

export default router;
