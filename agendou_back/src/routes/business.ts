import { Router } from "express";
import * as BusinessController from "../controllers/BusinessController.js";
import * as LeadController from "../controllers/LeadController.js";

const router = Router();

// Rota pública para resolver business
router.get("/public/business", BusinessController.resolverBusiness);

// Rota pública para criar lead (solicitação de plano)
// Nota: Esta rota também está registrada diretamente no server.js como fallback
router.post("/public/business/lead", async (req, res) => {
    console.log("📥 POST /public/business/lead recebido (via router)");
    try {
        await LeadController.criarLead(req, res);
    } catch (error) {
        console.error("Erro na rota business.ts:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Erro ao processar solicitação" });
        }
    }
});

// Rotas protegidas (admin - futuro)
// router.get("/", authenticateToken, BusinessController.listar);
// router.post("/", authenticateToken, BusinessController.criar);
// router.put("/:id", authenticateToken, BusinessController.atualizar);

export default router;
