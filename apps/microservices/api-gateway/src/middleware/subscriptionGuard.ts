import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../logger";

// ---------------------------------------------------------------------------
// Mapeo ruta → módulo
// Solo se listan las rutas que requieren suscripción activa.
// Servicios core (autorizacion, identidad, platform) NO se listan
// y por lo tanto siempre pasan.
// ---------------------------------------------------------------------------
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/api/v1/contabilidad": "contabilidad",
  "/api/v1/chat": "chat",
};

// ---------------------------------------------------------------------------
// Cache en memoria: tenantSlug → { moduleCodes[], expiresAt }
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  moduleCodes: string[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Obtiene los códigos de módulos activos de un tenant desde api-platform.
 */
async function fetchActiveModules(tenantSlug: string): Promise<string[]> {
  const url = `${env.PLATFORM_URL}/api/v1/tenant/modules`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-tenant-slug": tenantSlug,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(
      `api-platform respondió ${res.status}: ${await res.text()}`,
    );
  }

  const modules: { codigo: string }[] = await res.json();
  return modules.map((m) => m.codigo);
}

/**
 * Retorna módulos cacheados o los obtiene de api-platform si el cache expiró.
 */
async function getActiveModuleCodes(tenantSlug: string): Promise<string[]> {
  const now = Date.now();
  const cached = cache.get(tenantSlug);

  if (cached && cached.expiresAt > now) {
    return cached.moduleCodes;
  }

  const moduleCodes = await fetchActiveModules(tenantSlug);

  cache.set(tenantSlug, {
    moduleCodes,
    expiresAt: now + CACHE_TTL_MS,
  });

  logger.info({
    event: "subscription_cache_refresh",
    tenantSlug,
    modules: moduleCodes,
  });

  return moduleCodes;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Subscription Guard — bloquea requests a APIs de módulos que el tenant
 * no tiene contratados. Debe ejecutarse DESPUÉS de authenticateToken
 * (necesita req.__gatewayUser.tenantSlug).
 *
 * Rutas públicas y servicios core pasan sin restricción.
 */
export const subscriptionGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Si no hay usuario autenticado (ruta pública), pasar.
  if (!req.__gatewayUser) {
    next();
    return;
  }

  // Determinar qué módulo (si alguno) corresponde a la ruta.
  const requiredModule = resolveModuleForPath(req.path);

  // Rutas core / no mapeadas → siempre permitidas.
  if (!requiredModule) {
    next();
    return;
  }

  const { tenantSlug } = req.__gatewayUser;

  try {
    const activeModules = await getActiveModuleCodes(tenantSlug);

    if (!activeModules.includes(requiredModule)) {
      logger.warn({
        event: "subscription_blocked",
        tenantSlug,
        module: requiredModule,
        path: req.path,
        userId: req.__gatewayUser.userId,
      });

      res.status(403).json({
        error: "Módulo no contratado",
        message: `El módulo "${requiredModule}" no está activo para esta municipalidad.`,
        code: "MODULE_NOT_SUBSCRIBED",
      });
      return;
    }

    next();
  } catch (err) {
    logger.error({
      event: "subscription_guard_error",
      tenantSlug,
      module: requiredModule,
      error: (err as Error).message,
    });

    // Fail-open: si no podemos verificar, dejamos pasar para evitar caídas.
    // El servicio downstream también puede aplicar sus propias validaciones.
    next();
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveModuleForPath(path: string): string | null {
  for (const [prefix, moduleCode] of Object.entries(ROUTE_MODULE_MAP)) {
    if (path.startsWith(prefix)) {
      return moduleCode;
    }
  }
  return null;
}

/**
 * Invalida el cache de módulos de un tenant específico (se invoca
 * externamente cuando cambian las suscripciones, ej. via admin API).
 */
export function invalidateSubscriptionCache(tenantSlug: string): void {
  cache.delete(tenantSlug);
  logger.info({
    event: "subscription_cache_invalidated",
    tenantSlug,
  });
}

/**
 * Limpia todo el cache de suscripciones.
 */
export function clearSubscriptionCache(): void {
  cache.clear();
  logger.info({ event: "subscription_cache_cleared" });
}
