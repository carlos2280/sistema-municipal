import { loadEnv } from "@/config/env";
import swaggerOptions from "@/config/swagger";
import { type DbClient, initializeDB } from "@/db/client";
import { errorHandler } from "@/libs/middleware/error.middleware";
import { requireGateway } from "@/libs/middleware/requireGateway";
import { tenantDbMiddleware } from "@/libs/middleware/tenantDb";
import router from "@/routes";
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
const specs = swaggerJSDoc(swaggerOptions);
app.use(cors());
app.use(express.json());
app.use(requireGateway);
app.use(tenantDbMiddleware);
// Ruta para la documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
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
