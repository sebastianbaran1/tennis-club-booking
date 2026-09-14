import express from "express";
import {
  getUsers,
  getUsersAdmin,
  getUserReservations,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/users", authenticateToken, getUsers);
router.get("/usersAdmin", authenticateToken, getUsersAdmin);
router.get(
  "/users/:userId/reservations",
  authenticateToken,
  getUserReservations,
);
router.put("/user/:id", authenticateToken, updateUser);
router.delete("/user/:id", authenticateToken, deleteUser);

export default router;
