import { Router } from "express";
import * as BusinessController from "../controllers/BusinessController.js";

const router = Router();

// Rota pública para resolver business
router.get("/public/business", BusinessController.resolverBusiness);

// Rotas protegidas (admin - futuro)
// router.get("/", authenticateToken, BusinessController.listar);
// router.post("/", authenticateToken, BusinessController.criar);
// router.put("/:id", authenticateToken, BusinessController.atualizar);

export default router;
