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

  // Middleware de autenticación
  io.use((socket, next) => {
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
      next()
    } catch {
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
