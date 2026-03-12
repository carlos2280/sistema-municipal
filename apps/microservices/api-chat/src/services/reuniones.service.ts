import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import type { DbClient } from '../db/client.js'
import {
  type InvitacionReunion,
  type NewInvitacionReunion,
  type NewRecordatorioReunion,
  type NewReunion,
  type RecordatorioReunion,
  type Reunion,
  invitacionesReunion,
  recordatoriosReunion,
  reuniones,
} from '../db/schemas/index.js'
import { participantes } from '../db/schemas/participantes.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'
import { mensajesService } from './mensajes.service.js'

export const reunionesService = {
  // ─── Queries ────────────────────────────────────────────────────────────────

  async obtenerPorId(db: DbClient, id: number): Promise<Reunion | undefined> {
    const [result] = await db.select().from(reuniones).where(eq(reuniones.id, id))
    return result
  },

  async obtenerConInvitaciones(db: DbClient, id: number) {
    const reunion = await this.obtenerPorId(db, id)
    if (!reunion) return undefined

    const invitaciones = await db
      .select({
        id: invitacionesReunion.id,
        reunionId: invitacionesReunion.reunionId,
        usuarioId: invitacionesReunion.usuarioId,
        estado: invitacionesReunion.estado,
        respondidoEn: invitacionesReunion.respondidoEn,
        createdAt: invitacionesReunion.createdAt,
        updatedAt: invitacionesReunion.updatedAt,
        nombreUsuario: usuarios.nombreCompleto,
      })
      .from(invitacionesReunion)
      .leftJoin(usuarios, eq(usuarios.id, invitacionesReunion.usuarioId))
      .where(eq(invitacionesReunion.reunionId, id))

    return { ...reunion, invitaciones }
  },

  async listarPorConversacion(db: DbClient, conversacionId: number): Promise<Reunion[]> {
    return db
      .select()
      .from(reuniones)
      .where(
        and(
          eq(reuniones.conversacionId, conversacionId),
          inArray(reuniones.estado, ['programada', 'activa'])
        )
      )
      .orderBy(reuniones.fechaInicio)
  },

  async listarProximasDelUsuario(db: DbClient, usuarioId: number): Promise<Reunion[]> {
    const ahora = new Date()

    // Obtener reunionIds donde el usuario tiene invitación
    const invitacionRows = await db
      .select({ reunionId: invitacionesReunion.reunionId })
      .from(invitacionesReunion)
      .where(
        and(
          eq(invitacionesReunion.usuarioId, usuarioId),
          inArray(invitacionesReunion.estado, ['pendiente', 'aceptada', 'tentativa'])
        )
      )

    if (invitacionRows.length === 0) return []

    const reunionIds = invitacionRows.map((r) => r.reunionId)

    return db
      .select()
      .from(reuniones)
      .where(
        and(
          inArray(reuniones.id, reunionIds),
          inArray(reuniones.estado, ['programada', 'activa']),
          gte(reuniones.fechaFin, ahora)
        )
      )
      .orderBy(reuniones.fechaInicio)
      .limit(20)
  },

  // ─── Mutations ───────────────────────────────────────────────────────────────

  async crearReunion(
    db: DbClient,
    data: NewReunion,
    participanteIds: number[]
  ): Promise<Reunion & { invitaciones: InvitacionReunion[] }> {
    // 1. Insertar reunión
    const [nuevaReunion] = await db.insert(reuniones).values(data).returning()

    // 2. Crear mensaje de sistema tipo 'reunion' en la conversación
    const mensaje = await mensajesService.crearMensaje(db, {
      conversacionId: data.conversacionId,
      remitenteId: data.organizadorId,
      contenido: String(nuevaReunion.id),
      tipo: 'reunion',
    })

    // 3. Vincular mensaje a la reunión
    const [reunionConMensaje] = await db
      .update(reuniones)
      .set({ mensajeId: mensaje.id })
      .where(eq(reuniones.id, nuevaReunion.id))
      .returning()

    // 4. Crear invitaciones para todos los participantes
    const invitacionValues: NewInvitacionReunion[] = participanteIds.map((uid) => ({
      reunionId: nuevaReunion.id,
      usuarioId: uid,
      estado: uid === data.organizadorId ? 'aceptada' : 'pendiente',
      respondidoEn: uid === data.organizadorId ? new Date() : undefined,
    }))

    const invitaciones = await db
      .insert(invitacionesReunion)
      .values(invitacionValues)
      .returning()

    // 5. Crear recordatorios de 15 min para todos los participantes
    const enviarEn = new Date(nuevaReunion.fechaInicio.getTime() - 15 * 60 * 1000)
    const recordatorioValues: NewRecordatorioReunion[] = participanteIds.map((uid) => ({
      reunionId: nuevaReunion.id,
      usuarioId: uid,
      minutosAntes: 15,
      enviarEn,
    }))

    await db.insert(recordatoriosReunion).values(recordatorioValues)

    return { ...reunionConMensaje, invitaciones }
  },

  async editarReunion(
    db: DbClient,
    id: number,
    userId: number,
    data: Partial<Pick<NewReunion, 'titulo' | 'descripcion' | 'fechaInicio' | 'fechaFin' | 'ubicacion' | 'notas' | 'tipo'>>
  ): Promise<Reunion | null> {
    const reunion = await this.obtenerPorId(db, id)
    if (!reunion || reunion.organizadorId !== userId) return null
    if (reunion.estado === 'cancelada' || reunion.estado === 'completada') return null

    const [actualizada] = await db
      .update(reuniones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reuniones.id, id))
      .returning()

    // Si cambia fechaInicio, recalcular enviarEn de los recordatorios pendientes
    if (data.fechaInicio) {
      const nuevaEnviarEn = new Date(data.fechaInicio.getTime() - 15 * 60 * 1000)
      await db
        .update(recordatoriosReunion)
        .set({ enviarEn: nuevaEnviarEn })
        .where(
          and(
            eq(recordatoriosReunion.reunionId, id),
            eq(recordatoriosReunion.estado, 'pendiente')
          )
        )
    }

    return actualizada
  },

  async cancelarReunion(
    db: DbClient,
    id: number,
    userId: number
  ): Promise<Reunion | null> {
    const reunion = await this.obtenerPorId(db, id)
    if (!reunion || reunion.organizadorId !== userId) return null
    if (reunion.estado === 'cancelada') return null

    const [cancelada] = await db
      .update(reuniones)
      .set({ estado: 'cancelada', updatedAt: new Date() })
      .where(eq(reuniones.id, id))
      .returning()

    // Cancelar recordatorios pendientes
    await db
      .update(recordatoriosReunion)
      .set({ estado: 'cancelado' })
      .where(
        and(
          eq(recordatoriosReunion.reunionId, id),
          eq(recordatoriosReunion.estado, 'pendiente')
        )
      )

    return cancelada
  },

  async responderInvitacion(
    db: DbClient,
    reunionId: number,
    usuarioId: number,
    estado: InvitacionReunion['estado']
  ): Promise<InvitacionReunion | null> {
    const [invitacion] = await db
      .select()
      .from(invitacionesReunion)
      .where(
        and(
          eq(invitacionesReunion.reunionId, reunionId),
          eq(invitacionesReunion.usuarioId, usuarioId)
        )
      )

    if (!invitacion) return null

    const [actualizada] = await db
      .update(invitacionesReunion)
      .set({ estado, respondidoEn: new Date(), updatedAt: new Date() })
      .where(eq(invitacionesReunion.id, invitacion.id))
      .returning()

    return actualizada
  },

  async marcarIniciada(
    db: DbClient,
    id: number,
    llamadaId: number
  ): Promise<Reunion | undefined> {
    const [actualizada] = await db
      .update(reuniones)
      .set({ estado: 'activa', llamadaId, updatedAt: new Date() })
      .where(eq(reuniones.id, id))
      .returning()
    return actualizada
  },

  async marcarCompletada(db: DbClient, id: number): Promise<Reunion | undefined> {
    const [actualizada] = await db
      .update(reuniones)
      .set({ estado: 'completada', updatedAt: new Date() })
      .where(eq(reuniones.id, id))
      .returning()
    return actualizada
  },

  // ─── Recordatorios ──────────────────────────────────────────────────────────

  async obtenerRecordatoriosPendientes(db: DbClient): Promise<RecordatorioReunion[]> {
    const ahora = new Date()
    return db
      .select()
      .from(recordatoriosReunion)
      .where(
        and(
          eq(recordatoriosReunion.estado, 'pendiente'),
          // enviarEn <= ahora
          lte(recordatoriosReunion.enviarEn, ahora)
        )
      )
      .orderBy(recordatoriosReunion.enviarEn)
  },

  async marcarRecordatorioEnviado(db: DbClient, id: number): Promise<void> {
    await db
      .update(recordatoriosReunion)
      .set({ estado: 'enviado', enviadoEn: new Date() })
      .where(eq(recordatoriosReunion.id, id))
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  async obtenerParticipanteIds(db: DbClient, conversacionId: number): Promise<number[]> {
    const rows = await db
      .select({ usuarioId: participantes.usuarioId })
      .from(participantes)
      .where(eq(participantes.conversacionId, conversacionId))
    return rows.map((r) => r.usuarioId)
  },

  async verificarAcceso(
    db: DbClient,
    reunionId: number,
    userId: number
  ): Promise<boolean> {
    const [inv] = await db
      .select()
      .from(invitacionesReunion)
      .where(
        and(
          eq(invitacionesReunion.reunionId, reunionId),
          eq(invitacionesReunion.usuarioId, userId)
        )
      )
    return !!inv
  },

  minutosRestantes(reunion: Reunion): number {
    return Math.max(
      0,
      Math.round((reunion.fechaInicio.getTime() - Date.now()) / 60000)
    )
  },
}

// Agrega historial de reuniones pasadas para la lista en el drawer
export async function listarTodasPorConversacion(
  db: DbClient,
  conversacionId: number
): Promise<Reunion[]> {
  return db
    .select()
    .from(reuniones)
    .where(eq(reuniones.conversacionId, conversacionId))
    .orderBy(desc(reuniones.fechaInicio))
    .limit(50)
}
