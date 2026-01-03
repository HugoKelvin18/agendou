import express from "express";
import * as NotificacaoController from "../controllers/NotificacaoController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/business.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/cliente", authenticateToken, validateBusiness, NotificacaoController.listarCliente);
router.get("/profissional", authenticateToken, validateBusiness, NotificacaoController.listarProfissional);
router.get("/admin", authenticateToken, requireRole(["ADMIN"]), NotificacaoController.listarAdmin);
router.post("/marcar-lida", authenticateToken, (req, res, next) => {
    // Para admin, não precisa validateBusiness
    if (req.userRole === "ADMIN") {
        return next();
    }
    validateBusiness(req, res, next);
}, NotificacaoController.marcarComoLida);

export default router;
