import dotenv from "dotenv";
import path from "node:path";

// Load .env from the gateway project root (not monorepo root)
// This is needed because vitest workspace mode runs from the monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
