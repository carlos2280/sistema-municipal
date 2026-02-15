import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { env } from "./config/env";
import { logger } from "./logger";
import { authenticateToken, stripUserHeaders } from "./middleware/auth";
import { applySecurityMiddleware } from "./middleware/security";
import { configureProxies } from "./proxy";

const corsOptions = {
  origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

export const createApp = (): Express => {
  const app = express();

  // CORS primero - antes de cualquier otro middleware
  app.use(cors(corsOptions));

  // Responder inmediatamente a OPTIONS (preflight) - antes del proxy
  // En Express 5, usar middleware en lugar de app.options("*") por compatibilidad con path-to-regexp v8
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Parse cookies (necesario para leer JWT del cookie "token")
  app.use(cookieParser());

  app.use(express.json({ limit: "5mb" }));

  // SEGURIDAD: Eliminar headers X-User-* spoofados de requests externos
  app.use(stripUserHeaders);

  applySecurityMiddleware(app);

  // AUTH: Validar JWT y almacenar datos del usuario en req.__gatewayUser
  app.use(authenticateToken);

  // PROXY: Rutas a servicios backend (inyecta X-User-* headers en onProxyReq)
  configureProxies(app);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use((req, _res, next) => {
    logger.info(`[Gateway] ${req.method} ${req.originalUrl}`);
    next();
  });

  return app;
};
