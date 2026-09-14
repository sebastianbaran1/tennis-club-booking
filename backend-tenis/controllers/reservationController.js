import prisma from "../config/db.js";
import { timeToMinutes } from "../utils/helpers.js";

export const getReservations = async (req, res) => {
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
};

export const createReservation = async (req, res) => {
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
};

export const deleteReservation = async (req, res) => {
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
};
