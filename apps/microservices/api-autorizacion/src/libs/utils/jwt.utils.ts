import { loadEnv } from "@/config/env";
import type { Usuario } from "@/db/schemas";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const { JWT_SECRET, JWT_ISSUER } = loadEnv();

const JWT_CONFIG = {
  secret: JWT_SECRET as string,
  accessTokenExpiry: "15m", // Access token expira en 15 minutos
  refreshTokenExpiry: "7d", // Refresh token expira en 7 días
  issuer: JWT_ISSUER || "api-autorizacion",
};

export interface TokenPayload {
  sub: string;
  userId: number;
  email: string;
  nombre: string;
  areaId: number;
  sistemaId: number;
  tipo: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Segundos hasta que expire el access token
}

/**
 * Genera un par de tokens (access + refresh) para un usuario
 * @param usuario Datos del usuario
 * @returns Par de tokens
 */
export const generarTokens = (
  usuario: Pick<Usuario, "id" | "email" | "nombreCompleto"> & {
    areaId: number;
    sistemaId: number;
  },
): TokenPair => {
  const basePayload = {
    sub: usuario.id.toString(),
    userId: usuario.id,
    email: usuario.email,
    nombre: usuario.nombreCompleto,
    areaId: usuario.areaId,
    sistemaId: usuario.sistemaId,
  };

  // Access Token (corta duración)
  const accessToken = jwt.sign(
    {
      ...basePayload,
      tipo: "access",
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry as string,
      issuer: JWT_CONFIG.issuer,
    } as jwt.SignOptions,
  );

  // Refresh Token (larga duración)
  const refreshToken = jwt.sign(
    {
      sub: usuario.id.toString(),
      userId: usuario.id,
      tipo: "refresh",
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiry as string,
      issuer: JWT_CONFIG.issuer,
    } as jwt.SignOptions,
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutos en segundos
  };
};

/**
 * Función LEGACY - usar generarTokens() en su lugar
 * @deprecated Use generarTokens() para obtener access + refresh tokens
 */
export const generarToken = (
  usuario: Pick<Usuario, "id" | "email" | "nombreCompleto"> & {
    areaId: number;
    sistemaId: number;
  },
): string => {
  const payload: jwt.JwtPayload = {
    sub: usuario.id.toString(),
    userId: usuario.id,
    email: usuario.email,
    nombre: usuario.nombreCompleto,
    areaId: usuario.areaId,
    sistemaId: usuario.sistemaId,
    tipo: "access",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry as string,
    issuer: JWT_CONFIG.issuer,
  } as jwt.SignOptions);
};

/**
 * Función para verificar y decodificar un token JWT
 * @param token Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export const verificarToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
    }) as JwtPayload;
  } catch (error) {
    console.error("Error al verificar token JWT:", error);
    return null;
  }
};
