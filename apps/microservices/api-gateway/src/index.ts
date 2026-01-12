import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 API Gateway running on http://localhost:${env.PORT}`);
});
