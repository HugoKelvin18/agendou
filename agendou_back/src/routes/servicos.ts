import express from "express";
import * as ServicoController from "../controllers/ServicoController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";

const router = express.Router();

// Rotas públicas que dependem de business
router.get("/", validateBusiness, ServicoController.listar);
router.get("/profissional/:id", validateBusiness, ServicoController.listarPorProfissional);

// Rotas autenticadas
router.post("/", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), ServicoController.criar);
router.put("/:id", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), ServicoController.atualizar);
router.delete("/:id", authenticateToken, validateBusiness, requireRole(["PROFISSIONAL"]), ServicoController.deletar);

export default router;
