import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import "dotenv/config";

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
const PORT = 5005;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Serwer Klubu Tenisowego wita!");
});

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Użytkownik z tym adresem e-mail już istnieje." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
      },
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Nieprawidłowy adres e-mail lub hasło." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Nieprawidłowy adres e-mail lub hasło." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Zalogowano pomyślnie!",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

app.get("/api/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Brak biletu wstępu." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Użytkownik przestał istnieć." });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Bilet jest nieważny lub wygasł." });
  }
});

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

app.get("/api/reservations", async (req, res) => {
  const { date } = req.query;

  try {
    const courts = await prisma.court.findMany();
    const reservations = await prisma.reservation.findMany({
      where: { date: date },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    res.json({ courts, reservations });
  } catch (error) {
    res.status(500).json({ error: "Błąd pobierania kalendarza." });
  }
});

app.post("/api/reservations", async (req, res) => {
  const { courtId, date, startTime, duration, userId } = req.body;

  try {
    const now = new Date();
    const polishTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    const todayStr = polishTime.toISOString().split("T")[0];
    const currentMinutes = polishTime.getHours() * 60 + polishTime.getMinutes();
    const requestMinutes = timeToMinutes(startTime);

    if (date < todayStr) {
      return res
        .status(400)
        .json({ error: "Nie możesz cofnąć czasu! Wybierz przyszłą datę." });
    }

    if (date === todayStr && requestMinutes <= currentMinutes) {
      return res
        .status(400)
        .json({ error: "Ta godzina już minęła. Wybierz późniejszy termin." });
    }
    const newStartMin = timeToMinutes(startTime);
    const newEndMin = newStartMin + parseInt(duration);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        courtId: parseInt(courtId),
        date: date,
      },
    });

    const hasCollision = existingReservations.some((res) => {
      const existStartMin = timeToMinutes(res.startTime);
      const existEndMin = existStartMin + res.duration;

      return newStartMin < existEndMin && newEndMin > existStartMin;
    });

    if (hasCollision) {
      return res
        .status(400)
        .json({
          error:
            "Niestety, ten termin nakłada się na inną rezerwację na tym korcie.",
        });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        courtId: parseInt(courtId),
        date,
        startTime,
        duration: parseInt(duration),
        userId: parseInt(userId),
      },
    });

    res
      .status(201)
      .json({ message: "Kort zarezerwowany!", reservation: newReservation });
  } catch (error) {
    console.error("Błąd podczas rezerwacji:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.delete("/api/reservations/:id", async (req, res) => {
  const reservationId = parseInt(req.params.id);
  const requestingUserId = parseInt(req.body.userId);

  try {
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Rezerwacja nie istnieje." });
    }

    if (
      requestingUser.role !== "ADMIN" &&
      reservation.userId !== requestingUserId
    ) {
      return res
        .status(403)
        .json({ error: "Nie możesz usunąć cudzej rezerwacji!" });
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    res.json({ message: "Rezerwacja została anulowana." });
  } catch (error) {
    res.status(500).json({ error: "Wystąpił błąd serwera podczas usuwania." });
  }
});

app.get("/api/users/:userId/reservations", async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const userReservations = await prisma.reservation.findMany({
      where: { userId: userId },
      include: { court: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    res.json(userReservations);
  } catch (error) {
    console.error("Błąd pobierania rezerwacji użytkownika:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie http://localhost:${PORT}`);
});
