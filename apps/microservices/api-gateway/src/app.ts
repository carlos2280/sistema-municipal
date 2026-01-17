import cors from "cors";
import express, { type Express } from "express";
import { logger } from "./logger";
import { applySecurityMiddleware } from "./middleware/security";
import { configureProxies } from "./proxy";

const corsOptions = {
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

export const createApp = (): Express => {
  const app = express();

  // CORS primero - antes de cualquier otro middleware
  app.use(cors(corsOptions));

  // Responder inmediatamente a OPTIONS (preflight) - antes del proxy
  app.options("*", (_req, res) => {
    res.sendStatus(204);
  });

  app.use(express.json({ limit: "5mb" }));

  applySecurityMiddleware(app);
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
