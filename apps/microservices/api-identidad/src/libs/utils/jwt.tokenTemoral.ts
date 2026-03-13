// utils/token.ts
import { loadEnv } from "@/config/env";
import jwt from "jsonwebtoken";
const { JWT_SECRET_TEMP } = loadEnv();
if (!JWT_SECRET_TEMP) throw new Error("JWT_SECRET_TEMP no está configurado");
const JWT_SECRET = JWT_SECRET_TEMP;

export const generarTokenTemporal = (email: string) => {
  const payload = { email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};
