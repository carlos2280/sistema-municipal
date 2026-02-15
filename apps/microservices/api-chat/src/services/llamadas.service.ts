import { AccessToken } from 'livekit-server-sdk'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import { env } from '../config/env.js'
import {
  type Llamada,
  type NewLlamada,
  llamadas,
} from '../db/schemas/llamadas.schema.js'
import { participantes } from '../db/schemas/participantes.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'
import { mensajesService } from './mensajes.service.js'

export const llamadasService = {
  generateRoomName(conversacionId: number): string {
    return `call-${conversacionId}-${Date.now()}`
  },

  async generateToken(
    roomName: string,
    userId: number,
    userName: string
  ): Promise<string> {
    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: String(userId),
      name: userName,
    })
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    })
    return await at.toJwt()
  },

  async crearLlamada(data: NewLlamada): Promise<Llamada> {
    const [nuevaLlamada] = await db
      .insert(llamadas)
      .values(data)
      .returning()
    return nuevaLlamada
  },

  async actualizarEstado(
    llamadaId: number,
    estado: Llamada['estado'],
    extra?: Partial<NewLlamada>
  ): Promise<Llamada | undefined> {
    const [updated] = await db
      .update(llamadas)
      .set({ estado, ...extra })
      .where(eq(llamadas.id, llamadaId))
      .returning()
    return updated
  },

  async finalizarLlamada(
    llamadaId: number,
    participantesQueUnieron: number[]
  ): Promise<Llamada | undefined> {
    const [llamada] = await db
      .select()
      .from(llamadas)
      .where(eq(llamadas.id, llamadaId))

    if (!llamada) return undefined

    const ahora = new Date()
    const inicio = llamada.iniciadaEn || llamada.createdAt || ahora
    const duracionSegundos = Math.round(
      (ahora.getTime() - inicio.getTime()) / 1000
    )

    const [updated] = await db
      .update(llamadas)
      .set({
        estado: 'finalizada',
        finalizadaEn: ahora,
        duracionSegundos,
        participantesIds: JSON.stringify(participantesQueUnieron),
      })
      .where(eq(llamadas.id, llamadaId))
      .returning()

    // Insertar mensaje sistema en la conversación
    const duracionStr = this.formatDuration(duracionSegundos)
    const tipoLabel = llamada.tipo === 'video' ? 'Videollamada' : 'Llamada de voz'
    await mensajesService.crearMensaje({
      conversacionId: llamada.conversacionId,
      remitenteId: llamada.iniciadoPor,
      contenido: `${tipoLabel} - ${duracionStr}`,
      tipo: 'sistema',
    })

    return updated
  },

  async rechazarLlamada(
    llamadaId: number,
    estado: 'rechazada' | 'sin_respuesta'
  ): Promise<Llamada | undefined> {
    const [updated] = await db
      .update(llamadas)
      .set({
        estado,
        finalizadaEn: new Date(),
        duracionSegundos: 0,
      })
      .where(eq(llamadas.id, llamadaId))
      .returning()

    if (updated) {
      const label =
        estado === 'rechazada'
          ? 'Llamada rechazada'
          : 'Llamada sin respuesta'
      await mensajesService.crearMensaje({
        conversacionId: updated.conversacionId,
        remitenteId: updated.iniciadoPor,
        contenido: label,
        tipo: 'sistema',
      })
    }

    return updated
  },

  async obtenerPorId(id: number): Promise<Llamada | undefined> {
    const [result] = await db
      .select()
      .from(llamadas)
      .where(eq(llamadas.id, id))
    return result
  },

  async obtenerLlamadaActiva(
    conversacionId: number
  ): Promise<Llamada | undefined> {
    const [result] = await db
      .select()
      .from(llamadas)
      .where(
        and(
          eq(llamadas.conversacionId, conversacionId),
          inArray(llamadas.estado, ['sonando', 'activa'])
        )
      )
    return result
  },

  async obtenerHistorial(
    conversacionId: number,
    limit = 20
  ): Promise<Llamada[]> {
    return db
      .select()
      .from(llamadas)
      .where(eq(llamadas.conversacionId, conversacionId))
      .orderBy(desc(llamadas.createdAt))
      .limit(limit)
  },

  async obtenerUsuario(userId: number) {
    const [user] = await db
      .select({
        id: usuarios.id,
        nombreCompleto: usuarios.nombreCompleto,
      })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
    return user
  },

  async obtenerParticipanteIds(conversacionId: number): Promise<number[]> {
    const parts = await db
      .select({ usuarioId: participantes.usuarioId })
      .from(participantes)
      .where(eq(participantes.conversacionId, conversacionId))
    return parts.map((p) => p.usuarioId)
  },

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins < 60) return `${mins}:${String(secs).padStart(2, '0')}`
    const hrs = Math.floor(mins / 60)
    const remainMins = mins % 60
    return `${hrs}:${String(remainMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  },
}
