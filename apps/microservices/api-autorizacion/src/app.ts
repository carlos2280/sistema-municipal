import router from "@/routes";
import cors from "cors";
import express from "express";
import { loadEnv } from "./config/env";
import { type DbClient, initializeDB } from "./db/client";
import { type PlatformDbClient, initializePlatformDB } from "./db/platformClient";
import { errorHandler } from "./libs/middleware/error.middleware";
import { requireGateway } from "./libs/middleware/requireGateway";
import { tenantDbMiddleware } from "./libs/middleware/tenantDb";
import cookieParser from 'cookie-parser';
import { sql } from "drizzle-orm";
import { requestIdMiddleware } from "@municipal/shared/logger";
const app = express();


// Cargar y validar variables de entorno
const env = loadEnv();

// Inicializar la base de datos del tenant (esto crea la instancia)
const db: DbClient = initializeDB(env);

// Inicializar la base de datos platform (multi-tenant)
const platformDb: PlatformDbClient = initializePlatformDB(env);


app.use(express.json());
app.use(requestIdMiddleware);

app.use(cookieParser());
app.use(requireGateway);
app.use(tenantDbMiddleware);

// Configuración CORS para el gateway
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));


// Configuración mejorada de body parser
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));




app.use("/api", router);



app.get("/api/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", service: "api-autorizacion", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy", service: "api-autorizacion", timestamp: new Date().toISOString() });
  }
});


app.use(errorHandler);
export { db, platformDb };
export default app;
