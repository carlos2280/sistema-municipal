import { loadEnv } from "@/config/env";
import type { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { CustomJwtPayload } from "../../types/express/auth";
const { JWT_SECRET } = loadEnv();
const JWT_CONFIG = {
  secret: JWT_SECRET as jwt.Secret,
  // expiresIn: (JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "1h",
  // issuer: JWT_ISSUER || "api",
};

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ mensaje: "No autorizado" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_CONFIG.secret) as CustomJwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
    return;
  }
};
