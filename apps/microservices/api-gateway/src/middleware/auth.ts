import { ALL_USER_HEADERS } from "@municipal/shared/auth";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { isPublicRoute } from "../config/publicRoutes";
import { logger } from "../logger";

export interface GatewayUserPayload {
  sub: string;
  userId: number;
  email: string;
  nombre: string;
  areaId: number;
  sistemaId: number;
}

declare module "express-serve-static-core" {
  interface Request {
    __gatewayUser?: GatewayUserPayload;
  }
}

/**
 * Elimina headers X-User-* de requests entrantes para prevenir spoofing.
 * Un cliente externo no debe poder inyectar estos headers.
 */
export const stripUserHeaders = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  for (const header of ALL_USER_HEADERS) {
    delete req.headers[header];
  }
  next();
};

/**
 * Valida JWT y almacena payload decodificado en req.__gatewayUser.
 * Las rutas públicas (login, refresh, health) se saltan la validación.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isPublicRoute(req.method, req.path)) {
    return next();
  }

  // Leer token de cookie (primario) o Authorization Bearer (fallback)
  let token: string | undefined;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    res.status(401).json({ mensaje: "No autorizado - Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    // Rechazar refresh tokens usados como access tokens
    if (decoded.tipo === "refresh") {
      res
        .status(401)
        .json({ mensaje: "No autorizado - Tipo de token incorrecto" });
      return;
    }

    req.__gatewayUser = {
      sub: decoded.sub || String(decoded.userId),
      userId: decoded.userId,
      email: decoded.email,
      nombre: decoded.nombre || "",
      areaId: decoded.areaId || 0,
      sistemaId: decoded.sistemaId || 0,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ mensaje: "Token expirado" });
      return;
    }
    logger.warn({
      event: "auth_failed",
      error: (err as Error).message,
      path: req.path,
    });
    res.status(401).json({ mensaje: "Token inválido" });
    return;
  }
};
