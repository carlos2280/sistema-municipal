import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5011;
// CORS abierto para microfrontends remotos
app.use(cors());

// Headers para módulos ES
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

// 404 para rutas no encontradas (este es un remote, no SPA)
app.use((req, res) => {
	res.status(404).json({ error: "Not found" });
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
