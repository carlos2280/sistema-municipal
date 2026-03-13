import { createServer } from 'node:http'
import app from './app.js'
import { env } from './config/env.js'
import { db } from './db/client.js'
import { startReminderScheduler, stopReminderScheduler } from './jobs/reminderScheduler.js'
import { disconnectRedis } from './libs/redis.js'
import { createLogger } from '@municipal/core/logger'
import { gruposSistemaService } from './services/gruposSistema.service.js'
import { initializeSocket } from './socket/index.js'

const logger = createLogger('api-chat')
const httpServer = createServer(app)

async function bootstrap() {
  const io = await initializeSocket(httpServer)
  app.set('io', io)
  startReminderScheduler(io)

  httpServer.listen(Number(env.PORT), () => {
    logger.info(`[api-chat] Servidor iniciado en puerto ${env.PORT}`)

    gruposSistemaService
      .sincronizarGrupos(db)
      .then((result) => {
        if (result.created.length > 0 || result.updated.length > 0) {
          logger.info(`[Sync] Grupos del sistema: ${result.created.length} creados, ${result.updated.length} actualizados`)
        }
      })
      .catch((err) => {
        logger.error(err, '[Sync] Error al sincronizar grupos del sistema')
      })
  })
}

bootstrap().catch((err) => {
  logger.error(err, '[Server] Error fatal al iniciar')
  process.exit(1)
})

function shutdown(signal: string) {
  logger.info(`${signal} recibido, iniciando graceful shutdown...`)
  httpServer.close(async () => {
    stopReminderScheduler()
    await disconnectRedis()
    logger.info('Servidor cerrado correctamente')
    process.exit(0)
  })
  setTimeout(() => {
    logger.error('Shutdown forzado por timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
