import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Todas as rotas admin requerem autenticação e role ADMIN
router.use(authenticateToken);
router.use(requireRole(["ADMIN"]));

// Rotas de businesses
router.get("/businesses", AdminController.listarBusinesses);
router.get("/businesses/:id", AdminController.obterBusiness);
router.patch("/businesses/:id/status", AdminController.atualizarStatusPagamento);
router.patch("/businesses/:id/plano", AdminController.atualizarPlano);
router.post("/businesses/:id/pagamento", AdminController.registrarPagamento);
router.post("/businesses/:id/bloquear", AdminController.bloquearBusiness);
router.post("/businesses/:id/liberar", AdminController.liberarBusiness);

// Rotas de códigos de acesso admin
router.post("/codigos-acesso", AdminController.criarCodigoAcessoAdmin);

export default router;
