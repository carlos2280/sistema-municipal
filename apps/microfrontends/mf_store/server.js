import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5010;
const distPath = path.join(__dirname, "dist");

// Verificar que dist existe al iniciar
console.log(`[mf_store] Checking dist folder: ${distPath}`);
if (fs.existsSync(distPath)) {
	const files = fs.readdirSync(distPath);
	console.log(`[mf_store] dist folder contents: ${files.join(", ")}`);

	const assetsPath = path.join(distPath, "assets");
	if (fs.existsSync(assetsPath)) {
		const assetFiles = fs.readdirSync(assetsPath);
		console.log(`[mf_store] assets folder contents: ${assetFiles.join(", ")}`);
		const hasRemoteEntry = assetFiles.some(f => f.includes("remoteEntry"));
		console.log(`[mf_store] remoteEntry.js exists: ${hasRemoteEntry}`);
	} else {
		console.error(`[mf_store] ERROR: assets folder does not exist!`);
	}
} else {
	console.error(`[mf_store] ERROR: dist folder does not exist!`);
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
	const hasRemoteEntry = fs.existsSync(path.join(distPath, "assets", "remoteEntry.js"));

	res.status(200).json({
		status: "healthy",
		service: "mf_store",
		port: port,
		distExists: hasDistFolder,
		remoteEntryExists: hasRemoteEntry,
		timestamp: new Date().toISOString()
	});
});

// 404 para rutas no encontradas (este es un remote, no SPA)
app.use((req, res) => {
	console.log(`[mf_store] 404: ${req.method} ${req.url}`);
	res.status(404).json({ error: "Not found", path: req.url });
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`[mf_store] Server running on port ${port}`);
	console.log(`[mf_store] Serving static files from: ${distPath}`);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("[mf_store] Server error:", error);
});

process.on("uncaughtException", (error) => {
	console.error("[mf_store] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("[mf_store] Unhandled rejection at:", promise, "reason:", reason);
});
