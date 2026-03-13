import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./logger";
import { attachWebSocketUpgrade } from "./proxy";

const app = createApp();
const server = createServer(app);

// Attach WebSocket upgrade handler for Socket.IO → api-chat
attachWebSocketUpgrade(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 API Gateway running on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} recibido, iniciando graceful shutdown...`);
  server.close(() => {
    logger.info("API Gateway cerrado correctamente");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Shutdown forzado por timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
