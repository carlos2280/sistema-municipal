import app from "@/app";
import { loadEnv } from "@/config/env";
import { createLogger } from "@municipal/shared/logger";

const logger = createLogger("api-platform");
const { PORT: PORT_DEFAULT } = loadEnv();
const PORT = PORT_DEFAULT || 3006;

const server = app.listen(PORT, () => {
  logger.info(`[api-platform] Servidor iniciado en puerto ${PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} recibido, iniciando graceful shutdown...`);
  server.close(() => {
    logger.info("Servidor cerrado correctamente");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Shutdown forzado por timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
