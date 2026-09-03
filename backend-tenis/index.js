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

const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== "string" || timeString === "--:--") {
    return 0;
  }
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

app.use(cors());
app.use(express.json());

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Brak tokenu." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Użytkownik przestał istnieć." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token nieważny." });
  }
};

app.get("/", (req, res) => {
  res.send("Serwer Klubu Tenisowego wita!");
});

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === "GUEST") {
        const guestToUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword, role: "USER" },
        });

        const token = jwt.sign(
          { userId: guestToUser.id, email: guestToUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" },
        );

        return res.status(201).json({
          message: "Rejestracja przebiegla pomyslnie!",
          token,
          user: {
            id: guestToUser.id,
            email: guestToUser.email,
            firstName: guestToUser.firstName,
            lastName: guestToUser.lastName,
            phone: guestToUser.phone,
            role: guestToUser.role,
          },
        });
      }

      return res
        .status(400)
        .json({ error: "Uzytkownik z tym adresem e-mail juz istnieje" });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Rejestracja przebiegla pomyslnie!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        role: newUser.role,
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
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Zalogowano pomyślnie!",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

app.get("/api/verify", authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Token nieważny." });
  }
});

app.get("/api/reservations", authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const user = req.user;

    if (
      user.role === "ADMIN" ||
      user.role === "DEMO_ADMIN" ||
      user.role === "RECEPTIONIST"
    ) {
      const reservations = await prisma.reservation.findMany({
        where: { date: date },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
      });
      return res.json({ reservations });
    } else {
      const reservations = await prisma.reservation.findMany({
        where: { date: date },
        select: {
          id: true,
          courtId: true,
          startTime: true,
          duration: true,
          userId: true,
        },
      });
      const now = new Date();
      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Warsaw",
      }).format(now);
      const timeStr = new Intl.DateTimeFormat("pl-PL", {
        timeZone: "Europe/Warsaw",
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);
      let futureReservations = reservations;
      if (date === todayStr) {
        futureReservations = reservations.filter((reservation) => {
          return (
            timeToMinutes(reservation.startTime) + 60 >= timeToMinutes(timeStr)
          );
        });
      }
      return res.json({ reservations: futureReservations });
    }
  } catch (error) {
    console.error("Błąd pobierania kalendarza:", error);
    res.status(500).json({ error: "Błąd pobierania kalendarza." });
  }
});

app.post("/api/reservations", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { courtId, date, startTime, duration, userId, newClient } = req.body;

    if (!["RECEPTIONIST", "ADMIN", "USER", "DEMO_ADMIN"].includes(user.role)) {
      return res.status(403).json({ error: "Brak dostępu do zasobów" });
    }

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Warsaw",
    }).format(now);
    const timeStr = new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    const [currentHours, currentMins] = timeStr.split(":").map(Number);
    const currentMinutes = currentHours * 60 + currentMins;

    const requestMinutes = timeToMinutes(startTime);

    if (date < todayStr) {
      return res.status(400).json({ error: "Wybierz przyszłą datę." });
    }

    if (date === todayStr && requestMinutes <= currentMinutes) {
      return res.status(400).json({ error: "Ta godzina już minęła." });
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
      return res.status(400).json({
        error:
          "Niestety, ten termin nakłada się na inną rezerwację na tym korcie.",
      });
    }

    const parsedDuration = parseInt(duration);

    if (parsedDuration !== 60 && parsedDuration !== 90) {
      return res.status(400).json({ error: "Zły czas rezerwacji" });
    }

    const settings = await prisma.settings.findUnique({ where: { id: 1 } });

    if (!settings || !settings.schedule || !settings.exceptions) {
      return res.status(500).json({ error: "Błąd konfiguracji klubu." });
    }

    const schedule = settings.schedule[new Date(date).getDay()];
    const exceptions = settings.exceptions;

    if (exceptions.includes(date)) {
      return res
        .status(400)
        .json({ error: "Klub jest nieczynny w ten dzień." });
    }
    if (
      !schedule ||
      !schedule.open ||
      !schedule.close ||
      schedule.open === "--:--" ||
      schedule.close === "--:--"
    ) {
      return res
        .status(400)
        .json({ error: "Klub jest nieczynny w ten dzień." });
    }

    if (newEndMin > timeToMinutes(schedule.close)) {
      return res.status(400).json({ error: "Zbyt długi czas rezerwacji" });
    }

    let finalUserId = user.id;

    const result = await prisma.$transaction(async (tx) => {
      if (
        user.role === "RECEPTIONIST" ||
        user.role === "ADMIN" ||
        user.role === "DEMO_ADMIN"
      ) {
        finalUserId = userId;

        if (userId === null) {
          const existingUser = await tx.user.findFirst({
            where: {
              email: newClient.email,
            },
          });

          if (existingUser !== null) {
            throw new Error("USER_EXISTS");
          }

          const guestData = await tx.user.create({
            data: {
              role: "GUEST",
              phone: newClient.phone,
              firstName: newClient.firstName,
              lastName: newClient.lastName,
              email: newClient.email,
            },
          });

          finalUserId = guestData.id;
        }
      }

      const newReservation = await tx.reservation.create({
        data: {
          courtId: parseInt(courtId),
          date,
          startTime,
          duration: parseInt(duration),
          userId: parseInt(finalUserId),
        },
      });

      return newReservation;
    });

    res
      .status(201)
      .json({ message: "Kort zarezerwowany!", reservation: result });
  } catch (error) {
    if (error.message === "USER_EXISTS") {
      return res.status(400).json({
        error: "Taki uzytkownik juz istnieje",
      });
    }
    console.error("Błąd podczas rezerwacji:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.delete("/api/reservations/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const reservationId = parseInt(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Rezerwacja nie istnieje." });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "RECEPTIONIST" &&
      user.role !== "DEMO_ADMIN" &&
      reservation.userId !== user.id
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
    console.error("Błąd podczas usuwania rezerwacji:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera podczas usuwania." });
  }
});

app.get("/api/users", authenticateToken, async (req, res) => {
  const user = req.user;

  if (
    user.role !== "RECEPTIONIST" &&
    user.role !== "ADMIN" &&
    user.role !== "DEMO_ADMIN"
  ) {
    return res.status(403).json({ error: "Brak dostępu do zasobów" });
  }

  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, phone: true },
    });
    res.json({ users });
  } catch (error) {
    console.error("Błąd pobierania użytkowników:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.get("/api/usersAdmin", authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "ADMIN" && user.role !== "DEMO_ADMIN") {
      return res.status(403).json({ error: "Brak dostępu do zasobów" });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (error) {
    console.error("Błąd pobierania użytkowników:", error);
    res.status(500).json({ error: "Błąd pobierania uzytkownikow" });
  }
});

app.get(
  "/api/users/:userId/reservations",
  authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;

      const reservations = await prisma.reservation.findMany({
        where: { userId: user.id },
        include: { court: true },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      res.json({ reservations });
    } catch (error) {
      console.error("Błąd pobierania rezerwacji użytkownika:", error);
      res.status(500).json({ error: "Wystąpił błąd serwera." });
    }
  },
);

app.put("/api/user/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, phone, role } = req.body;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const userToEdit = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email, phone, role },
    });

    res.status(200).json(userToEdit);
  } catch (error) {
    console.error("Błąd podczas edycji użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/api/user/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const userId = parseInt(req.params.id);
    const randomEmail = `deleted_user_${userId}_${Date.now()}@klubRzeszow.com`;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const userToDelete = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, email: randomEmail },
    });
    res.status(200).json(userToDelete);
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/api/settings/schedule", async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (settings) {
      res.json({ schedule: settings.schedule });
    } else {
      res.status(404).json({ error: "Brak ustawień" });
    }
  } catch (error) {
    console.error("Błąd pobierania harmonogramu:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.put("/api/settings/schedule", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { schedule } = req.body;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const settings = await prisma.settings.upsert({
      create: {
        id: 1,
        schedule: schedule,
      },
      update: {
        schedule: schedule,
      },
      where: {
        id: 1,
      },
    });

    res.status(200).json(settings);
  } catch (error) {
    console.error("Błąd podczas zapisywania harmonogramu:", error);
    res.status(500).json({ error: "Błąd serwera podczas zapisywania" });
  }
});

app.get("/api/settings/exceptions", async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (settings) {
      res.json({ exceptions: settings.exceptions });
    } else {
      res.status(404).json({ error: "Brak ustawień" });
    }
  } catch (error) {
    console.error("Błąd pobierania dni wolnych:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

app.put("/api/settings/exceptions", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { closedDays } = req.body;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const settings = await prisma.settings.upsert({
      create: {
        id: 1,
        exceptions: closedDays,
      },
      update: {
        exceptions: closedDays,
      },
      where: {
        id: 1,
      },
    });

    res.status(200).json(settings);
  } catch (error) {
    console.error("Błąd podczas zapisywania dni wolnych:", error);
    res.status(500).json({ error: "Błąd serwera podczas zapisywania" });
  }
});

app.get("/api/courts", async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      orderBy: { id: "asc" },
      where: { isActive: true },
    });

    res.json({ courts });
  } catch (error) {
    console.error("Błąd pobierania kortów:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/api/courts/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const courtId = parseInt(req.params.id);

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const court = await prisma.court.update({
      where: { id: courtId },
      data: {
        isActive: false,
      },
    });

    res.status(200).json(court);
  } catch (error) {
    console.error("Błąd podczas usuwania kortu:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.put("/api/courts/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const courtId = parseInt(req.params.id);
    const { name, surface, isBlocked, blockReason } = req.body;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const court = await prisma.court.update({
      where: { id: courtId },
      data: { name, surface, isBlocked, blockReason },
    });

    res.status(200).json(court);
  } catch (error) {
    console.error("Błąd podczas edycji kortu:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/api/courts", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, surface } = req.body;

    if (user.role === "DEMO_ADMIN") {
      return res.status(403).json({
        error:
          "Tryb demonstracyjny: podgląd i klikanie są dozwolone, ale wprowadzanie zmian zostało zablokowane. Miłego testowania systemu!",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Nie masz dostępu do tych danych" });
    }

    const court = await prisma.court.create({
      data: { name, surface },
    });

    res.status(201).json(court);
  } catch (error) {
    console.error("Błąd podczas dodawania kortu:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie http://localhost:${PORT}`);
});
