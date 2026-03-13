import { loadEnv } from "@/config/env";

import { type DbClient, initializeDB } from "@/db/client";
import { errorHandler } from "@/libs/middleware/error.middleware";
import { requireGateway } from "@/libs/middleware/requireGateway";
import { tenantDbMiddleware } from "@/libs/middleware/tenantDb";
import router from "@/routes";
import cookieParser from 'cookie-parser';
import cors from "cors";
import express, { type Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { sql } from "drizzle-orm";
import { requestIdMiddleware } from "@municipal/shared/logger";
// Cargar y validar variables de entorno
const env = loadEnv();

// Inicializar la base de datos (esto crea la instancia)
const db: DbClient = initializeDB(env);

const app: Express = express();
// Configuración de Swagger

// Configuración CORS para el gateway
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(requestIdMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(requireGateway);
app.use(tenantDbMiddleware);

app.use("/api", router);
// Ruta de prueba
app.get("/api/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", service: "api-contabilidad", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy", service: "api-contabilidad", timestamp: new Date().toISOString() });
  }
});

// 👇 Este debe ir al final
app.use(errorHandler);
// Exportar por separado
export { db };
export default app; // Exportamos directamente la instancia de Express
