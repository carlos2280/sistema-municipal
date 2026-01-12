import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 80;

// CORS abierto para Module Federation
app.use(cors());

// Headers para módulos ES
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "dist")));

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		version: process.env.npm_package_version,
		services: ["mf-store", "mf-ui", "mf-contabilidad"],
	});
});

// Manejar rutas SPA
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`Server running on port ${port}`);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("Server error:", error);
});
