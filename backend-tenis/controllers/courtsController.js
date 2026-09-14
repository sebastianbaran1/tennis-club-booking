import prisma from "../config/db.js";

export const getCourts = async (req, res) => {
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
};

export const createCourt = async (req, res) => {
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
};

export const updateCourt = async (req, res) => {
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
};

export const deleteCourt = async (req, res) => {
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
};
