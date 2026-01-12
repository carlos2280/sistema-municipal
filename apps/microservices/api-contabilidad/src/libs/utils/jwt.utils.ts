import type { Usuario } from "@/types/usuario.types";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET as jwt.Secret,
  expiresIn:
    (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "1h",
  issuer: process.env.JWT_ISSUER || "api-auth",
};
/**
 * Función para generar un token JWT para un usuario
 * @param usuario Objeto usuario con los datos a incluir en el token
 * @returns Token JWT firmado
 */
export const generarToken = (
  usuario: Pick<Usuario, "id" | "email" | "nombreCompleto">,
): string => {
  const payload: jwt.JwtPayload = {
    sub: usuario.id.toString(),
    email: usuario.email,
    nombre: usuario.nombreCompleto,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    issuer: JWT_CONFIG.issuer,
  });
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
