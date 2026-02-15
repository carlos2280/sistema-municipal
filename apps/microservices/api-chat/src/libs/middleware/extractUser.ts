import { extractUserFromHeaders } from "@municipal/shared/auth";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "./AppError.js";

/**
 * Middleware que extrae datos del usuario de headers del gateway (producción)
 * o de JWT en cookies/Bearer (desarrollo directo).
 *
 * Mapea a req.usuario = { id, email } para mantener compatibilidad con controllers de chat.
 */
export const extractUser: RequestHandler = (req, _res, next) => {
  // Path 1: Request vino del gateway (headers X-User-*)
  const user = extractUserFromHeaders(
    req.headers as Record<string, string | string[] | undefined>,
  );
  if (user) {
    req.usuario = { id: user.userId, email: user.email };
    return next();
  }

  // Path 2: Acceso directo en desarrollo (Bearer o cookie)
  if (env.NODE_ENV === "development") {
    try {
      let token: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

      if (!token && req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return next(new AppError("Token no proporcionado", 401));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: number;
        email: string;
      };
      req.usuario = { id: decoded.userId, email: decoded.email };
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Token expirado", 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Token inválido", 401));
      }
      return next(error);
    }
  }

  // Path 3: Producción sin headers del gateway = no autorizado
  next(new AppError("No autorizado", 401));
};
