import router from "@/routes";
import cors from "cors";
import express from "express";
import { loadEnv } from "./config/env";
import { type DbClient, initializeDB } from "./db/client";
import { errorHandler } from "./libs/middleware/error.middleware";
import cookieParser from 'cookie-parser';
const app = express();


// Cargar y validar variables de entorno
const env = loadEnv();

// Inicializar la base de datos (esto crea la instancia)
const db: DbClient = initializeDB(env);


app.use(express.json());

app.use(cookieParser());


// Configuración CORS para el gateway
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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



app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Middleware para manejar conexiones abortadas
app.use((req, res, next) => {
  req.on('aborted', () => {
    console.log('Request aborted by client:', req.method, req.url);
  });
  next();
});


app.use(errorHandler);
export { db };
export default app;
