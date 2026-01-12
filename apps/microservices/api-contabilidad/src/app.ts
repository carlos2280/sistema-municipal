import { loadEnv } from "@/config/env";

import { type DbClient, initializeDB } from "@/db/client";
import { errorHandler } from "@/libs/middleware/error.middleware";
import router from "@/routes";
import cookieParser from 'cookie-parser';
import cors from "cors";
import express, { type Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
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
app.use(express.json());
app.use(cookieParser());

app.use("/api", router);
// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 👇 Este debe ir al final
app.use(errorHandler);
// Exportar por separado
export { db };
export default app; // Exportamos directamente la instancia de Express
