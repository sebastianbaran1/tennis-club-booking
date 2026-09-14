import express from "express";
import {
  getReservations,
  createReservation,
  deleteReservation,
} from "../controllers/reservationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getReservations);
router.post("/", authenticateToken, createReservation);
router.delete("/:id", authenticateToken, deleteReservation);

export default router;
