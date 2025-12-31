import express from "express";
import * as ServicoController from "../controllers/ServicoController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", ServicoController.listar);
router.get("/profissional/:id", ServicoController.listarPorProfissional);
router.post("/", authenticateToken, requireRole(["PROFISSIONAL"]), ServicoController.criar);
router.put("/:id", authenticateToken, requireRole(["PROFISSIONAL"]), ServicoController.atualizar);
router.delete("/:id", authenticateToken, requireRole(["PROFISSIONAL"]), ServicoController.deletar);

export default router;
