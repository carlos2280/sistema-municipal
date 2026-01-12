import cors from "cors";
import express, { type Express } from "express";
import { logger } from "./logger";
import { applySecurityMiddleware } from "./middleware/security";
import { configureProxies } from "./proxy";
export const createApp = (): Express => {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );

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
