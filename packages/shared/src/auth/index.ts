/**
 * Módulo de autenticación compartido entre gateway y microservicios.
 *
 * El gateway valida el JWT y propaga datos del usuario como headers internos.
 * Los servicios leen esos headers con extractUserFromHeaders().
 */

export interface UserPayload {
  sub: string;
  userId: number;
  email: string;
  nombre: string;
  areaId: number;
  sistemaId: number;
}

export const X_USER_HEADERS = {
  userId: "x-user-id",
  email: "x-user-email",
  nombre: "x-user-nombre",
  areaId: "x-user-area-id",
  sistemaId: "x-user-sistema-id",
  sub: "x-user-sub",
  secured: "x-secured-by",
} as const;

export const GATEWAY_SIGNATURE = "API-Gateway";

/** Lista de todos los headers X-User-* (para stripping anti-spoofing) */
export const ALL_USER_HEADERS = Object.values(X_USER_HEADERS);

/**
 * Extrae datos del usuario de los headers inyectados por el gateway.
 * Retorna null si el request no vino del gateway (sin X-Secured-By header).
 */
export function extractUserFromHeaders(
  headers: Record<string, string | string[] | undefined>,
): UserPayload | null {
  const secured = headers[X_USER_HEADERS.secured];
  if (secured !== GATEWAY_SIGNATURE) return null;

  const userId = headers[X_USER_HEADERS.userId];
  const email = headers[X_USER_HEADERS.email];

  if (!userId || !email) return null;

  return {
    sub: (headers[X_USER_HEADERS.sub] as string) || String(userId),
    userId: Number(userId),
    email: email as string,
    nombre: (headers[X_USER_HEADERS.nombre] as string) || "",
    areaId: Number(headers[X_USER_HEADERS.areaId]) || 0,
    sistemaId: Number(headers[X_USER_HEADERS.sistemaId]) || 0,
  };
}
