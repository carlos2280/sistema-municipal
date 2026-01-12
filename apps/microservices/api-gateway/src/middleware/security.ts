import compression from "compression";
import cors from "cors";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const applySecurityMiddleware = (app: Express) => {
  app.use(helmet());
  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(compression());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 100,
      message: { error: "Demasiadas solicitudes" },
    }),
  );
};
