import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const register = async (req, res) => {
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
};

export const login = async (req, res) => {
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
};

export const verify = async (req, res) => {
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
};
