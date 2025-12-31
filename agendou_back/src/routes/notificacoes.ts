import express from "express";
import * as NotificacaoController from "../controllers/NotificacaoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/cliente", authenticateToken, NotificacaoController.listarCliente);
router.get("/profissional", authenticateToken, NotificacaoController.listarProfissional);
router.post("/marcar-lida", authenticateToken, NotificacaoController.marcarComoLida);

export default router;
