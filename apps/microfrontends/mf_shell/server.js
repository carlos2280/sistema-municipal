import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 80;
const distPath = path.join(__dirname, "dist");
const indexPath = path.join(distPath, "index.html");

// Verificar que dist existe al iniciar
console.log(`[mf_shell] Checking dist folder: ${distPath}`);
if (fs.existsSync(distPath)) {
	const files = fs.readdirSync(distPath);
	console.log(`[mf_shell] dist folder contents: ${files.join(", ")}`);

	const assetsPath = path.join(distPath, "assets");
	if (fs.existsSync(assetsPath)) {
		const assetFiles = fs.readdirSync(assetsPath);
		console.log(`[mf_shell] assets folder contents: ${assetFiles.slice(0, 10).join(", ")}${assetFiles.length > 10 ? '...' : ''}`);
	} else {
		console.error(`[mf_shell] ERROR: assets folder does not exist!`);
	}

	if (fs.existsSync(indexPath)) {
		console.log(`[mf_shell] index.html exists`);
	} else {
		console.error(`[mf_shell] ERROR: index.html does not exist!`);
	}
} else {
	console.error(`[mf_shell] ERROR: dist folder does not exist!`);
}

// CORS abierto para Module Federation
app.use(cors());

// Headers para módulos ES
app.use((_req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

// Servir archivos estáticos
app.use(express.static(distPath));

// Health check endpoint
app.get("/health", (_req, res) => {
	const hasDistFolder = fs.existsSync(distPath);
	const hasIndexHtml = fs.existsSync(indexPath);

	res.status(200).json({
		status: "healthy",
		service: "mf_shell",
		port: port,
		distExists: hasDistFolder,
		indexHtmlExists: hasIndexHtml,
		remotes: {
			mf_store: process.env.VITE_MF_STORE_URL || "not configured",
			mf_ui: process.env.VITE_MF_UI_URL || "not configured",
			mf_contabilidad: process.env.VITE_MF_CONTABILIDAD_URL || "not configured"
		},
		timestamp: new Date().toISOString()
	});
});

// Manejar rutas SPA
app.get("*", (req, res) => {
	if (fs.existsSync(indexPath)) {
		res.sendFile(indexPath);
	} else {
		console.error(`[mf_shell] Cannot serve ${req.url}: index.html not found`);
		res.status(500).json({
			error: "index.html not found",
			distPath: distPath,
			indexPath: indexPath
		});
	}
});

// Iniciar servidor
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
	console.log(`[mf_shell] Server running on port ${port}`);
	console.log(`[mf_shell] Serving static files from: ${distPath}`);
});

// Manejo de errores
server.on("error", (error) => {
	console.error("[mf_shell] Server error:", error);
});

process.on("uncaughtException", (error) => {
	console.error("[mf_shell] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("[mf_shell] Unhandled rejection at:", promise, "reason:", reason);
});
