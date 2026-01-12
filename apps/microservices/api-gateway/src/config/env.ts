import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  AUTH_URL: z.string().url(),
  IDENTITY_URL: z.string().url(),
  CONTABILIDAD_URL: z.string().url(),
  NODE_ENV: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "[Config] ❌ Invalid environment variables",
    parsed.error.format(),
  );
  process.exit(1);
}

export const env = parsed.data;
