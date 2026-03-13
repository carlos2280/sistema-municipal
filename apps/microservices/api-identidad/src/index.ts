import app from "@/app";
import { loadEnv } from "@/config/env";
import { closeTenantPools } from "@municipal/shared/database";
import { createLogger } from "@municipal/shared/logger";

const logger = createLogger("api-identidad");
const { PORT: PORT_DEFAULT } = loadEnv();
const PORT = PORT_DEFAULT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`[api-identidad] Servidor iniciado en puerto ${PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} recibido, iniciando graceful shutdown...`);
  server.close(async () => {
    await closeTenantPools();
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
