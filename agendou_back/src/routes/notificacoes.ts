import express from "express";
import * as NotificacaoController from "../controllers/NotificacaoController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";

const router = express.Router();

router.get("/cliente", authenticateToken, validateBusiness, NotificacaoController.listarCliente);
router.get("/profissional", authenticateToken, validateBusiness, NotificacaoController.listarProfissional);
router.post("/marcar-lida", authenticateToken, validateBusiness, NotificacaoController.marcarComoLida);

export default router;
