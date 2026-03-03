import app from "@/app";
import { loadEnv } from "@/config/env";

const { PORT: PORT_DEFAULT } = loadEnv();
const PORT = PORT_DEFAULT || 3006;

app.listen(PORT, () => {
  console.info(`[api-platform] Server running on port ${PORT}`);
});
