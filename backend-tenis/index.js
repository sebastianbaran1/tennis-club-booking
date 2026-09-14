import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import courtRoutes from "./routes/courtsRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie http://localhost:${PORT}`);
});
