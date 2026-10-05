import express from "express";
import {
  register,
  login,
  verify,
  healthCheck,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticateToken, verify);
router.get("/health", healthCheck);

export default router;
