import app from "@/app";
import { loadEnv } from "@/config/env";

const { PORT: PORT_DEFAULT } = loadEnv();

const PORT = PORT_DEFAULT || 3000;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
