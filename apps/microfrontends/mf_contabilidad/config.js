// env.config.js

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
dotenv.config({
	path: path.join(__dirname, `.env.${process.env.NODE_ENV || "development"}`),
});

// Configuración base
const envConfig = {
	// Entorno
	NODE_ENV: process.env.NODE_ENV || "development",
	isProduction: process.env.NODE_ENV === "production",

	// Servidor
	PORT: process.env.VITE_PORT || 5011, // Usamos directamente VITE_DEV_PORT
	PUBLIC_URL:
		process.env.VITE_PUBLIC_URL ||
		`http://localhost:${process.env.VITE_DEV_PORT || 5011}/`,

	// CORS
	CORS: {
		allowedOrigins: process.env.VITE_ALLOWED_ORIGINS?.split(",") || [
			"http://localhost:5000",
			"http://localhost:5010",
			"http://localhost:5011",
			"http://localhost:5020",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
		],
		credentials: true,
	},

	// Microfrontends
	MF_URLS: {
		SHELL: process.env.VITE_SHELL_URL || "http://localhost:5000",
		STORE: process.env.VITE_STORE_URL || "http://localhost:5010",
		CONTABILIDAD: process.env.VITE_CONTABILIDAD_URL || "http://localhost:5020",
		UI:
			process.env.VITE_PUBLIC_URL ||
			`http://localhost:${process.env.VITE_DEV_PORT || 5011}/`,
	},

	// Debug
	DEBUG: process.env.VITE_DEBUG === "true",
};

// Validación
if (!envConfig.PORT) {
	console.warn("⚠️ Puerto no configurado, usando 5011 por defecto");
	envConfig.PORT = 5011;
}

// Log de configuración cargada
console.log("🛠️ Configuración cargada:", {
	NODE_ENV: envConfig.NODE_ENV,
	PORT: envConfig.PORT,
	CORS_ORIGINS: envConfig.CORS.allowedOrigins,
	DEBUG: envConfig.DEBUG,
});

export default envConfig;
