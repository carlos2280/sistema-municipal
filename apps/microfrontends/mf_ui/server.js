import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5011;
console.log({ port });
// Configuración CORS segura
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
	"https://mfshell-production.up.railway.app",
	"https://mfstore-production.up.railway.app",
	"https://mfui-production.up.railway.app",
	"https://mfcontabilidad-production.up.railway.app",
	"http://localhost:5011/assets/remoteEntry.js",
	"http://localhost:5010/assets/remoteEntry.js",
	"http://localhost:5000",
	"http://localhost:5020/assets/remoteEntry.js",
];

app.use(
	cors({
		origin: true, // Permitir todos los orígenes temporalmente
		methods: ["GET", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Middleware para headers adicionales
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "dist")));

// Health check endpoint
app.get("/health", (req, res) => {
	res
		.status(200)
		.json({ status: "healthy", version: process.env.npm_package_version });
});

// Manejar rutas SPA (solo para el shell)
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`Server running on port ${port}`);
	console.log("Allowed origins:", allowedOrigins);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("Server error:", error);
});
