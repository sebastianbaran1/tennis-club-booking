import prisma from "../config/db.js";

export const getUsers = async (req, res) => {
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
};

export const getUsersAdmin = async (req, res) => {
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
};

export const getUserReservations = async (req, res) => {
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
};

export const updateUser = async (req, res) => {
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
};

export const deleteUser = async (req, res) => {
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
};
