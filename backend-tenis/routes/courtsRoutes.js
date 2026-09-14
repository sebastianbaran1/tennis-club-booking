import express from "express";
import {
  getCourts,
  createCourt,
  updateCourt,
  deleteCourt,
} from "../controllers/courtsController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getCourts);
router.post("/", authenticateToken, createCourt);
router.put("/:id", authenticateToken, updateCourt);
router.delete("/:id", authenticateToken, deleteCourt);

export default router;
