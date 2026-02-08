import { createServer } from 'node:http'
import app from './app.js'
import { env } from './config/env.js'
import { initializeSocket } from './socket/index.js'

const httpServer = createServer(app)

// Inicializar Socket.IO
const io = initializeSocket(httpServer)

// Hacer io disponible en la app si es necesario
app.set('io', io)

httpServer.listen(Number(env.PORT), () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║       API Chat - Sistema Municipal               ║
╠══════════════════════════════════════════════════╣
║  REST API:    http://localhost:${env.PORT}/api/chat    ║
║  WebSocket:   http://localhost:${env.PORT}             ║
║  Health:      http://localhost:${env.PORT}/health      ║
║  Environment: ${env.NODE_ENV.padEnd(30)}   ║
╚══════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM recibido, cerrando servidor...')
  httpServer.close(() => {
    console.log('[Server] Servidor cerrado')
    process.exit(0)
  })
})
