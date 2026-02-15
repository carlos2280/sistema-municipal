import { extractUserFromHeaders } from "@municipal/shared/auth";
import { getEnv } from "@/config/env";
import type { CustomJwtPayload } from "@/types/express/auth";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware que extrae datos del usuario de headers del gateway (producción)
 * o de JWT en cookies (desarrollo directo).
 */
export const extractUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Path 1: Request vino del gateway (headers X-User-*)
  const user = extractUserFromHeaders(
    req.headers as Record<string, string | string[] | undefined>,
  );
  if (user) {
    req.user = {
      userId: user.userId,
      email: user.email,
      nombre: user.nombre,
      areaId: user.areaId,
      sistemaId: user.sistemaId,
    } as CustomJwtPayload;
    return next();
  }

  // Path 2: Acceso directo en desarrollo (cookie-based)
  const { NODE_ENV, JWT_SECRET } = getEnv();
  if (NODE_ENV === "development") {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ mensaje: "No autorizado" });
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      req.user = {
        userId: payload.userId,
        email: payload.email,
        nombre: payload.nombre || "",
        areaId: payload.areaId || 0,
        sistemaId: payload.sistemaId || 0,
      } as CustomJwtPayload;
      return next();
    } catch {
      res.status(401).json({ mensaje: "Token inválido o expirado" });
      return;
    }
  }

  // Path 3: Producción sin headers del gateway = no autorizado
  res.status(401).json({ mensaje: "No autorizado" });
};
