import compression from "compression";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const applySecurityMiddleware = (app: Express) => {
  // Helmet con configuración que no interfiera con CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  // CORS ya está configurado en app.ts - no duplicar aquí
  app.use(compression());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 100,
      message: { error: "Demasiadas solicitudes" },
    }),
  );
};
