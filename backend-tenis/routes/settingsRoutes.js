import express from "express";
import {
  getSchedule,
  updateSchedule,
  getExceptions,
  updateExceptions,
} from "../controllers/settingsController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/schedule", getSchedule);
router.put("/schedule", authenticateToken, updateSchedule);
router.get("/exceptions", getExceptions);
router.put("/exceptions", authenticateToken, updateExceptions);

export default router;
