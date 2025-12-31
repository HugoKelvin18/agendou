import express from "express";
import * as AuthController from "../controllers/AuthController.js"; // .js porque é arquivo .js

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

export default router;
