import { Router } from "express";
import * as BusinessController from "../controllers/BusinessController.js";
import * as LeadController from "../controllers/LeadController.js";

const router = Router();

// Rota pública para resolver business
router.get("/public/business", BusinessController.resolverBusiness);

// Rota pública para criar lead (solicitação de plano)
router.post("/public/business/lead", (req, res) => {
    console.log("📥 POST /public/business/lead recebido");
    LeadController.criarLead(req, res);
});

// Rotas protegidas (admin - futuro)
// router.get("/", authenticateToken, BusinessController.listar);
// router.post("/", authenticateToken, BusinessController.criar);
// router.put("/:id", authenticateToken, BusinessController.atualizar);

export default router;
