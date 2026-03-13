import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { AppError, createErrorResponse } from "@municipal/core/errors";
import { requestIdMiddleware } from "@municipal/core/logger";
import { env } from "./config/env";
import { logger } from "./logger";
import { authenticateToken, stripUserHeaders } from "./middleware/auth";
import {
  applySecurityMiddleware,
  authenticatedLimiter,
  loginLimiter,
} from "./middleware/security";
import {
  clearSubscriptionCache,
  invalidateSubscriptionCache,
  subscriptionGuard,
} from "./middleware/subscriptionGuard";
import { configureProxies } from "./proxy";

const corsOptions = {
  origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const BACKENDS = {
  "api-identidad": `${env.IDENTITY_URL}/api/health`,
  "api-autorizacion": `${env.AUTH_URL}/api/health`,
  "api-contabilidad": `${env.CONTABILIDAD_URL}/api/health`,
  "api-chat": `${env.CHAT_URL}/api/health`,
  "api-platform": `${env.PLATFORM_URL}/api/health`,
} as const;

async function checkBackend(url: string): Promise<"ok" | "unreachable"> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return res.ok ? "ok" : "unreachable";
  } catch {
    return "unreachable";
  }
}

export const createApp = (): Express => {
  const app = express();

  // CORS primero - antes de cualquier otro middleware
  app.use(cors(corsOptions));

  // Responder inmediatamente a OPTIONS (preflight) - antes del proxy
  // En Express 5, usar middleware en lugar de app.options("*") por compatibilidad con path-to-regexp v8
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Request ID para tracing distribuido
  app.use(requestIdMiddleware);

  // Parse cookies (necesario para leer JWT del cookie "token")
  app.use(cookieParser());

  app.use(express.json({ limit: "5mb" }));

  // SEGURIDAD: Eliminar headers X-User-* spoofados de requests externos
  app.use(stripUserHeaders);

  applySecurityMiddleware(app);

  // RATE LIMIT: Login — 5 intentos / 15 min por IP
  app.use(
    [
      "/api/v1/autorizacion/login",
      "/api/v1/autorizacion/areas",
      "/api/v1/autorizacion/sistemas",
    ],
    loginLimiter,
  );

  // AUTH: Validar JWT y almacenar datos del usuario en req.__gatewayUser
  app.use(authenticateToken);

  // RATE LIMIT: Usuarios autenticados — 200 req / min por userId
  app.use(authenticatedLimiter);

  // SUBSCRIPTION: Bloquear acceso a módulos no contratados por el tenant
  app.use(subscriptionGuard);

  // INTERNAL: Endpoint para invalidar cache de suscripciones (llamado por api-platform)
  app.post("/internal/cache/invalidate", (req, res) => {
    const adminKey = req.headers["x-admin-key"] as string;
    const requestId = req.headers["x-request-id"] as string ?? "unknown";
    if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
      res.status(401).json({
        success: false,
        code: "HTTP_401",
        message: "Unauthorized",
        requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { tenantSlug } = req.body as { tenantSlug?: string };

    if (tenantSlug) {
      invalidateSubscriptionCache(tenantSlug);
      res.json({ ok: true, invalidated: tenantSlug });
    } else {
      clearSubscriptionCache();
      res.json({ ok: true, invalidated: "all" });
    }
  });

  // PROXY: Rutas a servicios backend (inyecta X-User-* headers en onProxyReq)
  configureProxies(app);

  // HEALTH: Verifica conectividad real a todos los backends
  app.get("/health", async (_req, res) => {
    const results = await Promise.all(
      Object.entries(BACKENDS).map(async ([name, url]) => [
        name,
        await checkBackend(url),
      ]),
    );
    const backends = Object.fromEntries(results) as Record<string, "ok" | "unreachable">;
    const allOk = Object.values(backends).every((s) => s === "ok");

    res.status(allOk ? 200 : 503).json({
      status: allOk ? "ok" : "degraded",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      backends,
    });
  });

  app.use((req, _res, next) => {
    logger.info(`[Gateway] ${req.method} ${req.originalUrl}`);
    next();
  });

  // ERROR HANDLER: respuesta estándar para errores no manejados
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const requestId = req.headers["x-request-id"] as string ?? "unknown";
    if (err instanceof AppError) {
      res.status(err.statusCode).json(createErrorResponse(err, requestId));
      return;
    }
    logger.error({ err, requestId }, "Error no manejado en api-gateway");
    res.status(500).json(
      createErrorResponse(
        new AppError(500, "INTERNAL_ERROR", "Error interno del servidor"),
        requestId,
      ),
    );
  });

  return app;
};
