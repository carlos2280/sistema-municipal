import type { Server as HttpServer } from 'node:http'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { setupCallHandlers } from './handlers/callHandler.js'
import { setupChatHandlers } from './handlers/chatHandler.js'
import { setupPresenceHandlers } from './handlers/presenceHandler.js'

interface TokenPayload {
  userId: number
  email: string
  tenantSlug?: string
}

// ---------------------------------------------------------------------------
// Cache de suscripción al módulo chat (igual que en gateway, TTL 5 min)
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000

const chatSubscriptionCache = new Map<string, { allowed: boolean; expiresAt: number }>()

async function isChatModuleActive(tenantSlug: string): Promise<boolean> {
  if (!env.PLATFORM_URL) {
    // Si no hay PLATFORM_URL configurada, permitir (backward compat)
    return true
  }

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

    if (!res.ok) {
      // Fail-open: si no se puede verificar, permitir
      return true
    }

    const modules = (await res.json()) as { codigo: string }[]
    const allowed = modules.some((m) => m.codigo === 'chat')

    chatSubscriptionCache.set(tenantSlug, {
      allowed,
      expiresAt: now + CACHE_TTL_MS,
    })

    return allowed
  } catch {
    // Fail-open ante errores de red
    return true
  }
}

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Middleware de autenticación + verificación de suscripción
  io.use(async (socket, next) => {
    // Intentar obtener token de auth o de cookies
    let token = socket.handshake.auth.token as string | undefined

    // Si no hay token en auth, buscar en cookies
    if (!token) {
      const cookies = socket.handshake.headers.cookie
      if (cookies) {
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='))
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
      socket.data.tenantSlug = decoded.tenantSlug || 'default'

      // Verificar que el tenant tiene el módulo chat contratado
      const tenantSlug = decoded.tenantSlug || 'default'
      const chatActive = await isChatModuleActive(tenantSlug)

      if (!chatActive) {
        console.warn(
          `[Socket] Suscripción al chat no activa para tenant "${tenantSlug}" (usuario: ${decoded.userId})`
        )
        return next(new Error('Módulo de chat no contratado'))
      }

      next()
    } catch (err) {
      if (err instanceof Error && err.message === 'Módulo de chat no contratado') {
        return next(err)
      }
      next(new Error('Token inválido'))
    }
  })

  // Manejo de conexiones
  io.on('connection', (socket) => {
    console.log(
      `[Socket] Nueva conexión: ${socket.id} (Usuario: ${socket.data.userId})`
    )

    // Configurar handlers
    setupChatHandlers(io, socket)
    setupPresenceHandlers(io, socket)
    setupCallHandlers(io, socket)

    // Unirse a sala personal del usuario
    socket.join(`user:${socket.data.userId}`)

    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket] Desconexión: ${socket.id} (Razón: ${reason})`
      )
    })

    socket.on('error', (error) => {
      console.error(`[Socket] Error en ${socket.id}:`, error)
    })
  })

  console.log('[Socket.IO] Inicializado correctamente')

  return io
}
