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
