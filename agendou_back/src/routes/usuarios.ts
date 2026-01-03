import express from "express";
import * as UsuarioController from "../controllers/UsuarioController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";

const router = express.Router();

// Rota pública que depende de business
router.get("/profissionais", validateBusiness, UsuarioController.listarProfissionais);

// Rotas autenticadas
router.get("/perfil/me", authenticateToken, validateBusiness, UsuarioController.getPerfil);
router.put("/perfil/me", authenticateToken, validateBusiness, UsuarioController.updatePerfil);
router.put("/senha", authenticateToken, validateBusiness, UsuarioController.alterarSenha);

// Rotas de suporte (profissionais)
import * as SuporteController from "../controllers/SuporteController.js";
router.post("/suporte", authenticateToken, validateBusiness, SuporteController.criarSolicitacao);
router.get("/suporte", authenticateToken, validateBusiness, SuporteController.listarMinhasSolicitacoes);

export default router;
