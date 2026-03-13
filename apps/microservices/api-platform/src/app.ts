import cors from "cors";
import express from "express";
import { loadEnv } from "@/config/env";
import { initializeDB, type DbClient } from "@/db/client";
import { errorHandler } from "@/libs/middleware/error.middleware";
import { requireGateway } from "@/libs/middleware/requireGateway";
import apiRouter from "@/routes";

// 1. Load environment
const env = loadEnv();

// 2. Initialize database
export const db: DbClient = initializeDB(env);

// 3. Create Express app
const app = express();

// 4. Middleware
app.use(cors());
app.use(express.json());
app.use(requireGateway);

// 5. Routes
app.use("/api", apiRouter);

// 6. Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "api-platform" });
});

// 7. Error handler (MUST be last)
app.use(errorHandler);

export default app;
