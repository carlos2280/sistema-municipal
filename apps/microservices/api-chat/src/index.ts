import { createServer } from 'node:http'
import app from './app.js'
import { env } from './config/env.js'
import { db } from './db/client.js'
import { startReminderScheduler, stopReminderScheduler } from './jobs/reminderScheduler.js'
import { disconnectRedis } from './libs/redis.js'
import { gruposSistemaService } from './services/gruposSistema.service.js'
import { initializeSocket } from './socket/index.js'

const httpServer = createServer(app)

async function bootstrap() {
  // Inicializar Socket.IO con Redis adapter
  const io = await initializeSocket(httpServer)

  // Hacer io disponible en la app si es necesario
  app.set('io', io)

  // Iniciar scheduler de recordatorios de reuniones
  startReminderScheduler(io)

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

    // Sincronizar grupos del sistema por departamento al arrancar
    gruposSistemaService
      .sincronizarGrupos(db)
      .then((result) => {
        if (result.created.length > 0 || result.updated.length > 0) {
          console.log(
            `[Sync] Grupos del sistema: ${result.created.length} creados, ${result.updated.length} actualizados`
          )
        }
      })
      .catch((err) => {
        console.error('[Sync] Error al sincronizar grupos del sistema:', err)
      })
  })
}

bootstrap().catch((err) => {
  console.error('[Server] Error fatal al iniciar:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM recibido, cerrando servidor...')
  httpServer.close(async () => {
    stopReminderScheduler()
    await disconnectRedis()
    console.log('[Server] Servidor cerrado')
    process.exit(0)
  })
})
