import express from "express";
import * as UsuarioController from "../controllers/UsuarioController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/profissionais", UsuarioController.listarProfissionais);
router.get("/perfil/me", authenticateToken, UsuarioController.getPerfil);
router.put("/perfil/me", authenticateToken, UsuarioController.updatePerfil);
router.put("/senha", authenticateToken, UsuarioController.alterarSenha);

export default router;
