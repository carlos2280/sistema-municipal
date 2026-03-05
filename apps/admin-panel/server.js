import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5050;
const distPath = path.join(__dirname, "dist");

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", service: "admin-panel" });
});

// SPA fallback — todas las rutas sirven index.html
app.use(express.static(distPath));
app.get("*path", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const server = createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`[admin-panel] Server running on port ${port}`);
});
