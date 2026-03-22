import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { logger } from "../logger";

// ---------------------------------------------------------------------------
// Servicios que usan la DB transversal por tenant (solo api-chat)
// api-mesa-ayuda usa la DB transversal centralizada y no requiere este header
// ---------------------------------------------------------------------------
const TRANSVERSAL_SERVICE_PREFIXES: readonly string[] = [
  "/api/v1/chat",
  "/socket.io",
];

// ---------------------------------------------------------------------------
// Cache en memoria: tenantId → { transversalDbName, expiresAt }
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  transversalDbName: string;
  expiresAt: number;
}

const cache = new Map<number, CacheEntry>();

// ---------------------------------------------------------------------------
// Schema de validación de la respuesta de api-platform
// ---------------------------------------------------------------------------
const TransversalDbResponseSchema = z.object({
  transversalDbName: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Fetch con cache
// ---------------------------------------------------------------------------

async function fetchTransversalDbName(tenantId: number): Promise<string> {
  const url = `${env.PLATFORM_URL}/api/v1/tenant/transversal-db`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-tenant-id": String(tenantId),
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(
      `api-platform respondió ${res.status} al consultar transversal DB del tenant ${tenantId}`,
    );
  }

  const raw: unknown = await res.json();
  const parsed = TransversalDbResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Respuesta inesperada de api-platform para transversalDbName: ${parsed.error.message}`,
    );
  }

  return parsed.data.transversalDbName;
}

async function getTransversalDbName(tenantId: number): Promise<string> {
  const now = Date.now();
  const cached = cache.get(tenantId);

  if (cached && cached.expiresAt > now) {
    return cached.transversalDbName;
  }

  const transversalDbName = await fetchTransversalDbName(tenantId);

  cache.set(tenantId, {
    transversalDbName,
    expiresAt: now + CACHE_TTL_MS,
  });

  logger.info({
    event: "transversal_db_cache_refresh",
    tenantId,
    transversalDbName,
  });

  return transversalDbName;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isTransversalService(path: string): boolean {
  return TRANSVERSAL_SERVICE_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Transversal DB Injector — resuelve el nombre de la DB transversal del tenant
 * y lo almacena en req.__transversalDbName para que el proxy lo inyecte
 * como header x-transversal-db-name.
 *
 * Solo actúa en rutas de servicios transversales (api-chat).
 * Debe ejecutarse DESPUÉS de authenticateToken (necesita req.__gatewayUser).
 */
export const transversalDbInjector = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  // Solo procesar rutas de servicios transversales
  if (!isTransversalService(req.path)) {
    next();
    return;
  }

  // Si no hay usuario autenticado (ruta pública), pasar sin header
  if (!req.__gatewayUser) {
    next();
    return;
  }

  const { tenantId } = req.__gatewayUser;

  try {
    const transversalDbName = await getTransversalDbName(tenantId);
    req.__transversalDbName = transversalDbName;
  } catch (err) {
    // Fail-open con valor por defecto para no bloquear el servicio
    // El servicio downstream usará la DB transversal compartida como fallback
    logger.warn({
      event: "transversal_db_resolve_failed",
      tenantId,
      path: req.path,
      error: (err as Error).message,
    });
    req.__transversalDbName = "transversal";
  }

  next();
};

// ---------------------------------------------------------------------------
// Cache management
// ---------------------------------------------------------------------------

export function invalidateTransversalDbCache(tenantId: number): void {
  cache.delete(tenantId);
  logger.info({ event: "transversal_db_cache_invalidated", tenantId });
}

export function clearTransversalDbCache(): void {
  cache.clear();
  logger.info({ event: "transversal_db_cache_cleared" });
}
