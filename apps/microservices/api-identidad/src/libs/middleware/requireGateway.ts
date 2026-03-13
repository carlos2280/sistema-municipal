import { GATEWAY_SIGNATURE, X_USER_HEADERS } from "@municipal/shared/auth";
import type { NextFunction, Request, Response } from "express";

/**
 * Bloquea requests que no vienen del API Gateway en producción.
 * El gateway inyecta X-Secured-By: API-Gateway en cada request proxiado.
 * En desarrollo, permite acceso directo para facilitar pruebas locales.
 */
export const requireGateway = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // Health checks son accesibles directamente (Railway, monitoring)
  if (req.path.endsWith("/health")) {
    return next();
  }

  const secured = req.headers[X_USER_HEADERS.secured];
  if (secured !== GATEWAY_SIGNATURE) {
    res.status(403).json({ message: "Acceso directo no permitido" });
    return;
  }

  next();
};
