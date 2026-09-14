import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
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
