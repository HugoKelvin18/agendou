import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as LeadController from "../controllers/LeadController.js";
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

// Rotas de suporte (admin)
import * as SuporteController from "../controllers/SuporteController.js";
router.get("/suporte", SuporteController.listarTodasSolicitacoes);
router.post("/suporte/:id/responder", SuporteController.responderSolicitacao);

// Rotas de mensagens
router.post("/businesses/:id/mensagem", AdminController.enviarMensagemBusiness);

// Rotas de leads (solicitações pendentes)
router.get("/leads/pendentes", LeadController.listarPendentes);
router.post("/leads/:id/ativar", LeadController.ativarBusiness);

export default router;
