import { db } from "@/app";
import { loadEnv } from "@/config/env";
import { tokensContrasenaTemporal } from "@/db/schemas";
import type { CustomJwtPayload } from "@/types/express/auth";
import { and, eq, gt } from "drizzle-orm";
// middlewares/validarTokenTemporal.ts
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const { JWT_SECRET_TEMP } = loadEnv();

export const validarTokenTemporal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("HEADERS:", req.headers);
  // 1. Buscar token en query ?token=abc
  const tokenFromQuery =
    typeof req.query.token === "string" ? req.query.token : undefined;

  // 2. Buscar token en header Authorization: Bearer abc
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = tokenFromHeader || tokenFromQuery;
  console.log("token=>", token);

  if (!token) {
    res.status(401).json({ mensaje: "No autorizado" });
    return;
  }

  if (!JWT_SECRET_TEMP) {
    res.status(500).json({ mensaje: "Configuración del servidor incompleta" });
    return;
  }

  try {
    console.log("LLEGO");
    const decoded = jwt.verify(token, JWT_SECRET_TEMP) as CustomJwtPayload;
    console.log("LLEGO + DECODE ", decoded);
    req.user = decoded;
    req.tokenTemporal = token;

    // Buscar el token en DB
    const [tokenDB] = await db
      .select()
      .from(tokensContrasenaTemporal)
      .where(
        and(
          eq(tokensContrasenaTemporal.token, token),
          eq(tokensContrasenaTemporal.usado, false),
          gt(tokensContrasenaTemporal.expiraEn, new Date()),
        ),
      );

    if (!tokenDB) {
      res.status(401).json({ mensaje: "Token inválido, usado o expirado" });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
    return;
  }
};
