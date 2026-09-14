import prisma from "../config/db.js";

export const getSchedule = async (req, res) => {
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
};

export const updateSchedule = async (req, res) => {
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
};

export const getExceptions = async (req, res) => {
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
};

export const updateExceptions = async (req, res) => {
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
};
