import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5040;
const distPath = path.join(__dirname, "dist");

console.log(`[mf_configuracion] Checking dist folder: ${distPath}`);
if (fs.existsSync(distPath)) {
	const files = fs.readdirSync(distPath);
	console.log(`[mf_configuracion] dist folder contents: ${files.join(", ")}`);

	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));
	console.log(`[mf_configuracion] remoteEntry.js exists: ${hasRemoteEntry}`);
	const hasMfManifest = fs.existsSync(path.join(distPath, "mf-manifest.json"));
	console.log(`[mf_configuracion] mf-manifest.json exists: ${hasMfManifest}`);
} else {
	console.error(`[mf_configuracion] ERROR: dist folder does not exist!`);
}

app.use(cors());

app.use((_req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.use(express.static(distPath));

app.get("/health", (_req, res) => {
	const hasDistFolder = fs.existsSync(distPath);
	const hasRemoteEntry = fs.existsSync(path.join(distPath, "remoteEntry.js"));

	res.status(200).json({
		status: "healthy",
		service: "mf_configuracion",
		port: port,
		distExists: hasDistFolder,
		remoteEntryExists: hasRemoteEntry,
		timestamp: new Date().toISOString(),
	});
});

app.use((req, res) => {
	console.log(`[mf_configuracion] 404: ${req.method} ${req.url}`);
	res.status(404).json({ error: "Not found", path: req.url });
});

const server = createServer(app);
server.listen(port, "0.0.0.0", () => {
	console.log(`[mf_configuracion] Server running on port ${port}`);
	console.log(`[mf_configuracion] Serving static files from: ${distPath}`);
});

server.on("error", (error) => {
	console.error("[mf_configuracion] Server error:", error);
});

process.on("uncaughtException", (error) => {
	console.error("[mf_configuracion] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("[mf_configuracion] Unhandled rejection at:", promise, "reason:", reason);
});
