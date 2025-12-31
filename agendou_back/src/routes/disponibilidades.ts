import express from "express";
import * as DisponibilidadeController from "../controllers/DisponibilidadeController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", DisponibilidadeController.listar);
router.get("/horarios-disponiveis", DisponibilidadeController.horariosDisponiveis);
router.get("/profissional", authenticateToken, requireRole(["PROFISSIONAL"]), DisponibilidadeController.listarPorProfissional);
router.post("/", authenticateToken, requireRole(["PROFISSIONAL"]), DisponibilidadeController.criar);
router.delete("/:id", authenticateToken, requireRole(["PROFISSIONAL"]), DisponibilidadeController.deletar);

export default router;
