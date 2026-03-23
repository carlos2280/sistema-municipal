import { loadEnv } from "@/config/env";
import {
  type DbClient,
  type TransversalDbClient,
  initializeDB,
  initializeTransversalDB,
} from "@/db/client";
import { errorHandler } from "@/libs/middleware/error.middleware";
import { requireGateway } from "@/libs/middleware/requireGateway";
import apiRouter from "@/routes";
import { requestIdMiddleware } from "@municipal/core/logger";
import cors from "cors";
import { sql } from "drizzle-orm";
import express from "express";

// 1. Load environment
const env = loadEnv();

// 2. Initialize databases
export const db: DbClient = initializeDB(env);
export const transversalDb: TransversalDbClient = initializeTransversalDB(env);

// 3. Create Express app
const app = express();

// 4. Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(requestIdMiddleware);
app.use(express.json());
app.use(requireGateway);

// 5. Routes
app.use("/api", apiRouter);

// 6. Health check
app.get("/api/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      status: "ok",
      service: "api-platform",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      service: "api-platform",
      timestamp: new Date().toISOString(),
    });
  }
});

// 7. Error handler (MUST be last)
app.use(errorHandler);

export default app;
