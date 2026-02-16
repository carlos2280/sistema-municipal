import type { IncomingMessage, ServerResponse } from "node:http";
import type { ClientRequest } from "node:http";
import type http from "node:http";
import { X_USER_HEADERS } from "@municipal/shared/auth";
import type { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { GatewayUserPayload } from "../middleware/auth";
import { env } from "../config/env";
import { logger } from "../logger";

interface RequestWithBody extends IncomingMessage {
  body?: unknown;
  __gatewayUser?: GatewayUserPayload;
}

interface ServiceConfig {
  baseUrl: string;
  path: string;
  pathRewrite: string;
  timeout?: number;
}

export const configureProxies = (app: Express) => {
  const isProduction = env.NODE_ENV === "production";
  const defaultTimeout = 30000;

  // IMPORTANTE: El orden importa - las rutas más específicas primero
  const services: Record<string, ServiceConfig> = {
    contabilidad: {
      baseUrl: env.CONTABILIDAD_URL,
      path: "/api/v1/contabilidad",
      pathRewrite: "/api/v1",
      timeout: 10000,
    },
    chat: {
      baseUrl: env.CHAT_URL,
      path: "/api/v1/chat",
      pathRewrite: "/api/chat/v1",
      timeout: 30000,
    },
    autorizacion: {
      baseUrl: env.AUTH_URL,
      path: "/api/v1/autorizacion",
      pathRewrite: "/api/v1/autorizacion",
      timeout: 5000,
    },
    identity: {
      baseUrl: env.IDENTITY_URL,
      path: "/api/v1/identidad",
      pathRewrite: "/api/v1/identidad",
      timeout: 10000,
    },
  };

  // Middleware común para todos los proxies
  app.use((req, res, next) => {
    // Configuración común de seguridad
    res.removeHeader("X-Powered-By");

    // Headers de seguridad básicos
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    next();
  });

  for (const [name, config] of Object.entries(services)) {
    const timeout = config.timeout || defaultTimeout;

    app.use(
      config.path,
      createProxyMiddleware({
        target: config.baseUrl,
        changeOrigin: true,
        secure: isProduction,
        protocolRewrite: isProduction ? "https" : "http",
        pathRewrite: (path, _req) => {
          // Express ya removió el prefijo (config.path), necesitamos agregarlo de vuelta
          return `${config.pathRewrite}${path}`;
        },
        xfwd: true, // Para manejar correctamente los headers X-Forwarded-*
        timeout,
        proxyTimeout: timeout,
        on: {
          proxyReq: (
            proxyReq: ClientRequest,
            req: IncomingMessage,
            _res: ServerResponse,
          ) => {
            // Limpieza de headers
            for (const header of ["referer"]) {
              proxyReq.removeHeader(header);
            }

            // Headers de seguridad
            proxyReq.setHeader("X-Secured-By", "API-Gateway");
            proxyReq.setHeader(
              "X-Forwarded-Proto",
              isProduction ? "https" : "http",
            );
            // Inyectar datos del usuario autenticado como headers internos
            const reqWithUser = req as RequestWithBody;
            if (reqWithUser.__gatewayUser) {
              const user = reqWithUser.__gatewayUser;
              proxyReq.setHeader(X_USER_HEADERS.userId, String(user.userId));
              proxyReq.setHeader(X_USER_HEADERS.email, user.email);
              proxyReq.setHeader(X_USER_HEADERS.nombre, user.nombre);
              proxyReq.setHeader(X_USER_HEADERS.areaId, String(user.areaId));
              proxyReq.setHeader(
                X_USER_HEADERS.sistemaId,
                String(user.sistemaId),
              );
              proxyReq.setHeader(X_USER_HEADERS.sub, user.sub);
            }

            // Construir URL final para logging
            const targetUrl = `${config.baseUrl}${req.url}`;

            // Logging estructurado
            logger.info({
              event: "proxy_request",
              service: name,
              method: req.method,
              path: req.url,
              target: targetUrl,
              baseUrl: config.baseUrl,
              timestamp: new Date().toISOString(),
            });

            // Manejo del body
            const reqWithBody = req as RequestWithBody;
            if (reqWithBody.body) {
              const bodyData = JSON.stringify(reqWithBody.body);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          },
          proxyRes: (proxyRes, req, res) => {
            // Agregar headers CORS a la respuesta del proxy
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader("Access-Control-Allow-Origin", origin);
              res.setHeader("Access-Control-Allow-Credentials", "true");
            }

            logger.info({
              event: "proxy_response",
              service: name,
              method: req.method,
              path: req.url,
              status: proxyRes.statusCode,
            });
          },
          error: (err, req, res) => {
            logger.error({
              event: "proxy_error",
              service: name,
              method: req.method,
              path: req.url,
              error: err.message,
              stack: env.NODE_ENV === "development" ? err.stack : undefined,
              timestamp: new Date().toISOString(),
            });

            // Verificación de tipo más segura
            if ("writeHead" in res && typeof res.writeHead === "function") {
              if (!("headersSent" in res) || !res.headersSent) {
                res.writeHead(502, {
                  "Content-Type": "application/json",
                  "Retry-After": "30",
                });
                res.end(
                  JSON.stringify({
                    error: "Bad Gateway",
                    message: `Service ${name} is currently unavailable`,
                    status: 502,
                    timestamp: new Date().toISOString(),
                  }),
                );
              }
            }
          },
        },
      }),
    );

    logger.info(
      `[Gateway] ${name.toUpperCase()}: ${config.path} (AA) ${config.baseUrl}`,
    );
  }

  // Socket.IO proxy → api-chat (WebSocket + polling)
  const socketProxy = createProxyMiddleware({
    target: env.CHAT_URL,
    changeOrigin: true,
    ws: true,
    secure: isProduction,
    on: {
      proxyReq: (_proxyReq, req) => {
        logger.info({
          event: "socket_proxy",
          method: req.method,
          path: req.url,
          target: env.CHAT_URL,
        });
      },
      error: (err, req) => {
        logger.error({
          event: "socket_proxy_error",
          path: req.url,
          error: err.message,
        });
      },
    },
  });

  app.use("/socket.io", socketProxy);

  logger.info(
    `[Gateway] SOCKET.IO: /socket.io → ${env.CHAT_URL}`,
  );
};

/**
 * Attaches WebSocket upgrade handler to the HTTP server.
 * Must be called after configureProxies.
 */
export const attachWebSocketUpgrade = (server: http.Server) => {
  const socketUpgradeProxy = createProxyMiddleware({
    target: env.CHAT_URL,
    changeOrigin: true,
    ws: true,
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/socket.io")) {
      socketUpgradeProxy.upgrade?.(req, socket, head);
    }
  });

  logger.info("[Gateway] WebSocket upgrade handler attached");
};
