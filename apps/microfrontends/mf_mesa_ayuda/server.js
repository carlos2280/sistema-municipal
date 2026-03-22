import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5050;
const distPath = path.join(__dirname, "dist");

// Verificar que dist existe al iniciar
console.log(`[mf_mesa_ayuda] Checking dist folder: ${distPath}`);
if (fs.existsSync(distPath)) {
	const files = fs.readdirSync(distPath);
	console.log(`[mf_mesa_ayuda] dist folder contents: ${files.join(", ")}`);

	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));
	console.log(`[mf_mesa_ayuda] remoteEntry.js exists: ${hasRemoteEntry}`);
	const hasMfManifest = fs.existsSync(path.join(distPath, "mf-manifest.json"));
	console.log(`[mf_mesa_ayuda] mf-manifest.json exists: ${hasMfManifest}`);
} else {
	console.error(`[mf_mesa_ayuda] ERROR: dist folder does not exist!`);
}

// CORS abierto para microfrontends remotos
app.use(cors());

// Headers para modulos ES
app.use((_req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

// Servir archivos estaticos
app.use(express.static(distPath));

// Health check endpoint
app.get("/health", (_req, res) => {
	const hasDistFolder = fs.existsSync(distPath);
	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));

	res.status(200).json({
		status: "healthy",
		service: "mf_mesa_ayuda",
		port: port,
		distExists: hasDistFolder,
		remoteEntryExists: hasRemoteEntry,
		timestamp: new Date().toISOString()
	});
});

// 404 para rutas no encontradas (este es un remote, no SPA)
app.use((req, res) => {
	console.log(`[mf_mesa_ayuda] 404: ${req.method} ${req.url}`);
	res.status(404).json({ error: "Not found", path: req.url });
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`[mf_mesa_ayuda] Server running on port ${port}`);
	console.log(`[mf_mesa_ayuda] Serving static files from: ${distPath}`);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("[mf_mesa_ayuda] Server error:", error);
});

process.on("uncaughtException", (error) => {
	console.error("[mf_mesa_ayuda] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("[mf_mesa_ayuda] Unhandled rejection at:", promise, "reason:", reason);
});
