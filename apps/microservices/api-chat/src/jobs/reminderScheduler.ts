/**
 * Scheduler de recordatorios de reuniones.
 * Cada 60s busca recordatorios pendientes cuyo `enviar_en <= NOW()`
 * y emite `meeting:reminder` al socket personal del usuario.
 *
 * Usa setInterval (sin BullMQ) — suficiente para Fase 1.
 * Con Redis adapter de Socket.IO, el emit llega a la instancia correcta.
 */
import type { Server } from 'socket.io'
import { db } from '../db/client.js'
import { reunionesService } from '../services/reuniones.service.js'

const INTERVAL_MS = 60_000

let timer: ReturnType<typeof setInterval> | null = null

export function startReminderScheduler(io: Server): void {
  if (timer) return // evitar doble arranque

  timer = setInterval(async () => {
    try {
      const pendientes = await reunionesService.obtenerRecordatoriosPendientes(db)

      for (const recordatorio of pendientes) {
        const reunion = await reunionesService.obtenerPorId(db, recordatorio.reunionId)
        if (!reunion || reunion.estado === 'cancelada' || reunion.estado === 'completada') {
          await reunionesService.marcarRecordatorioEnviado(db, recordatorio.id)
          continue
        }

        const minutosRestantes = reunionesService.minutosRestantes(reunion)

        // Emitir al socket personal del usuario destinatario
        io.to(`user:${recordatorio.usuarioId}`).emit('meeting:reminder', {
          reunion,
          minutosRestantes,
        })

        await reunionesService.marcarRecordatorioEnviado(db, recordatorio.id)

        console.log(
          `[Reminder] Enviado recordatorio reunión ${reunion.id} → usuario ${recordatorio.usuarioId} (${minutosRestantes} min restantes)`
        )
      }
    } catch (err) {
      console.error('[Reminder] Error en scheduler:', err)
    }
  }, INTERVAL_MS)

  console.log('[Reminder] Scheduler de recordatorios iniciado (intervalo: 60s)')
}

export function stopReminderScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('[Reminder] Scheduler detenido')
  }
}
