import compression from "compression";
import type { Express, Request } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";

/** Rate limiter general — 100 req / 15 min por IP */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas solicitudes" },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Rate limiter para endpoints de login — 5 intentos / 15 min por IP */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos de login. Intenta en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Rate limiter para usuarios autenticados — 200 req / min por userId */
export const authenticatedLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: "Límite de solicitudes alcanzado. Intenta en 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    req.__gatewayUser ? `user:${req.__gatewayUser.userId}` : (req.ip ?? "unknown"),
  skip: (req: Request) => !req.__gatewayUser,
});

export const applySecurityMiddleware = (app: Express) => {
  app.use(
    helmet({
      // CSP: el gateway solo sirve JSON — sin activos web
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      // HSTS: solo producción (Railway usa HTTPS). 1 año con preload.
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      // No filtrar el origen en redirects
      referrerPolicy: { policy: "no-referrer" },
      // Necesario para que el frontend cargue recursos proxiados cross-origin
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(compression());
  app.use(globalLimiter);
};
