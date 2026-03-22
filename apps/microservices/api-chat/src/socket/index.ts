import type { Server as HttpServer } from 'node:http'
import { createLogger } from '@municipal/core/logger'
import { createAdapter } from '@socket.io/redis-adapter'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { createTenantDbClient, db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { resolveTransversalDbName } from '../libs/platformClient.js'
import { createRedisClient, getRedisClient } from '../libs/redis.js'
import { setupCallHandlers } from './handlers/callHandler.js'
import { setupChatHandlers } from './handlers/chatHandler.js'
import { setupHeartbeatHandler } from './handlers/heartbeatHandler.js'
import { setupMeetingHandlers } from './handlers/meetingHandler.js'
import { setupPresenceHandlers } from './handlers/presenceHandler.js'
import { startPresenceCleanup } from './presenceCleanup.js'

const logger = createLogger('api-chat:socket')

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface TokenPayload {
  userId: number
  email: string
  tenantId?: number
  tenantSlug?: string
}

// Extiende socket.data con campos de tenant
declare module 'socket.io' {
  interface SocketData {
    userId: number
    email: string
    tenantId: number | undefined
    tenantSlug: string
    tenantDb: DbClient
  }
}

// ─── Cache de suscripción al módulo chat (TTL 5 min) ─────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000

const chatSubscriptionCache = new Map<
  string,
  { allowed: boolean; expiresAt: number }
>()

async function isChatModuleActive(tenantSlug: string): Promise<boolean> {
  if (!env.PLATFORM_URL) return true

  const now = Date.now()
  const cached = chatSubscriptionCache.get(tenantSlug)

  if (cached && cached.expiresAt > now) {
    return cached.allowed
  }

  try {
    const res = await fetch(`${env.PLATFORM_URL}/api/v1/tenant/modules`, {
      headers: { 'x-tenant-slug': tenantSlug },
      signal: AbortSignal.timeout(3000),
    })

    if (!res.ok) return true

    const modules = (await res.json()) as { codigo: string }[]
    const allowed = modules.some((m) => m.codigo === 'chat')

    chatSubscriptionCache.set(tenantSlug, {
      allowed,
      expiresAt: now + CACHE_TTL_MS,
    })

    return allowed
  } catch {
    return true
  }
}

// ─── Resolución de DbClient para un socket ───────────────────────────────────

/**
 * Resuelve la instancia Drizzle correcta para el tenant del socket.
 *
 * Prioridad:
 * 1. Handshake auth.transversalDbName (header inyectado por proxy/gateway)
 * 2. tenantId del JWT → consulta platform para obtener transversal_db_name
 * 3. DB por defecto (backward compat / desarrollo sin platform)
 */
async function resolveTenantDbClient(
  handshakeDbName: string | undefined,
  tenantId: number | undefined,
): Promise<DbClient> {
  // 1. Header explícito del gateway (WS handshake headers)
  if (handshakeDbName && handshakeDbName.trim() !== '') {
    logger.debug(
      { handshakeDbName },
      'Socket: usando DB transversal del handshake header',
    )
    return createTenantDbClient(handshakeDbName.trim())
  }

  // 2. Resolución dinámica via platform
  if (tenantId !== undefined) {
    const dbName = await resolveTransversalDbName(tenantId)
    if (dbName) {
      logger.debug(
        { tenantId, dbName },
        'Socket: DB transversal resuelta desde platform',
      )
      return createTenantDbClient(dbName)
    }
  }

  // 3. Fallback: DB transversal por defecto
  logger.debug(
    { tenantId },
    'Socket: usando DB transversal por defecto (fallback)',
  )
  return db
}

// ─── Inicialización del servidor Socket.IO con Redis adapter ─────────────────

export async function initializeSocket(
  httpServer: HttpServer,
): Promise<Server> {
  const redis = getRedisClient()

  // Socket.IO Redis adapter necesita 2 clientes dedicados: pub y sub
  const pubClient = createRedisClient()
  const subClient = createRedisClient()

  pubClient.on('error', (err: Error) => {
    logger.error({ err: err.message }, '[Redis:pub] Error')
  })
  subClient.on('error', (err: Error) => {
    logger.error({ err: err.message }, '[Redis:sub] Error')
  })

  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    // Heartbeat agresivo: detectar conexiones muertas en ~15s
    pingInterval: 10_000,
    pingTimeout: 5_000,
  })

  // Configurar Redis adapter para comunicación entre instancias
  io.adapter(createAdapter(pubClient, subClient))
  logger.info('[Socket.IO] Redis adapter configurado')

  // ─── Middleware: autenticación JWT + tenant DB + suscripción ─────────────

  io.use(async (socket, next) => {
    // Extraer token del handshake (auth o cookie)
    let token = socket.handshake.auth.token as string | undefined

    if (!token) {
      const cookies = socket.handshake.headers.cookie
      if (cookies) {
        const tokenCookie = cookies
          .split(';')
          .find((c) => c.trim().startsWith('token='))
        if (tokenCookie) {
          token = tokenCookie.split('=')[1]?.trim()
        }
      }
    }

    if (!token) {
      return next(new Error('Token no proporcionado'))
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload

      socket.data.userId = decoded.userId
      socket.data.email = decoded.email
      socket.data.tenantId = decoded.tenantId
      socket.data.tenantSlug = decoded.tenantSlug ?? 'default'

      // Verificar suscripción al módulo chat
      const chatActive = await isChatModuleActive(socket.data.tenantSlug)
      if (!chatActive) {
        logger.warn(
          { tenantSlug: socket.data.tenantSlug, userId: decoded.userId },
          'Suscripción al chat no activa para el tenant',
        )
        return next(new Error('Módulo de chat no contratado'))
      }

      // Resolver DB transversal del tenant
      const handshakeDbName = socket.handshake.headers['x-transversal-db-name']
      const dbNameFromHeader = Array.isArray(handshakeDbName)
        ? handshakeDbName[0]
        : handshakeDbName

      socket.data.tenantDb = await resolveTenantDbClient(
        dbNameFromHeader,
        decoded.tenantId,
      )

      next()
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'Módulo de chat no contratado'
      ) {
        return next(err)
      }
      logger.warn({ err }, 'Token inválido en handshake Socket.IO')
      next(new Error('Token inválido'))
    }
  })

  // ─── Manejo de conexiones ─────────────────────────────────────────────────

  io.on('connection', (socket) => {
    logger.info(
      {
        socketId: socket.id,
        userId: socket.data.userId,
        tenantId: socket.data.tenantId,
      },
      'Nueva conexión Socket.IO',
    )

    // Unirse a sala personal del usuario
    socket.join(`user:${socket.data.userId}`)

    // Configurar handlers (el orden no importa, cada uno es independiente)
    setupChatHandlers(io, socket)
    setupPresenceHandlers(io, socket, redis)
    setupCallHandlers(io, socket, redis)
    setupMeetingHandlers(io, socket)
    setupHeartbeatHandler(socket, redis)

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Desconexión Socket.IO')
    })

    socket.on('error', (error) => {
      logger.error({ socketId: socket.id, error }, 'Error en socket')
    })
  })

  // Cleanup job: detecta y limpia conexiones fantasma cada 2 minutos
  startPresenceCleanup(io, redis)

  logger.info('[Socket.IO] Inicializado correctamente')

  return io
}
