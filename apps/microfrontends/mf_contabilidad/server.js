import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5020;
const distPath = path.join(__dirname, "dist");

// Verificar que dist existe al iniciar
console.log(`[mf_contabilidad] Checking dist folder: ${distPath}`);
if (fs.existsSync(distPath)) {
	const files = fs.readdirSync(distPath);
	console.log(`[mf_contabilidad] dist folder contents: ${files.join(", ")}`);

	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));
	console.log(`[mf_contabilidad] remoteEntry.js exists: ${hasRemoteEntry}`);
	const hasMfManifest = fs.existsSync(path.join(distPath, "mf-manifest.json"));
	console.log(`[mf_contabilidad] mf-manifest.json exists: ${hasMfManifest}`);
} else {
	console.error(`[mf_contabilidad] ERROR: dist folder does not exist!`);
}

// CORS abierto para microfrontends remotos
app.use(cors());

// Headers para módulos ES
app.use((_req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

// Servir archivos estáticos
app.use(express.static(distPath));

// Health check endpoint
app.get("/health", (_req, res) => {
	const hasDistFolder = fs.existsSync(distPath);
	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));

	res.status(200).json({
		status: "healthy",
		service: "mf_contabilidad",
		port: port,
		distExists: hasDistFolder,
		remoteEntryExists: hasRemoteEntry,
		timestamp: new Date().toISOString()
	});
});

// 404 para rutas no encontradas (este es un remote, no SPA)
app.use((req, res) => {
	console.log(`[mf_contabilidad] 404: ${req.method} ${req.url}`);
	res.status(404).json({ error: "Not found", path: req.url });
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`[mf_contabilidad] Server running on port ${port}`);
	console.log(`[mf_contabilidad] Serving static files from: ${distPath}`);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("[mf_contabilidad] Server error:", error);
});

process.on("uncaughtException", (error) => {
	console.error("[mf_contabilidad] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("[mf_contabilidad] Unhandled rejection at:", promise, "reason:", reason);
});
