import { and, count, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm'
import type { DbClient } from '../db/client.js'
import {
  type Conversacion,
  type NewConversacion,
  conversaciones,
} from '../db/schemas/conversaciones.schema.js'
import { mensajes } from '../db/schemas/mensajes.schema.js'
import {
  type NewParticipante,
  participantes,
} from '../db/schemas/participantes.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'

export const conversacionesService = {
  async obtenerConversacionesPorUsuario(db: DbClient, usuarioId: number) {
    // Obtener IDs de conversaciones del usuario con su última lectura
    const conversacionesDelUsuario = await db
      .select({
        id: conversaciones.id,
        ultimaLectura: participantes.ultimaLectura,
      })
      .from(conversaciones)
      .innerJoin(participantes, eq(participantes.conversacionId, conversaciones.id))
      .where(eq(participantes.usuarioId, usuarioId))
      .orderBy(desc(conversaciones.updatedAt))

    const conversacionIds = conversacionesDelUsuario.map(c => c.id)

    if (conversacionIds.length === 0) {
      return []
    }

    // Mapa de última lectura por conversación
    const ultimaLecturaPorConv = new Map<number, Date | null>()
    for (const c of conversacionesDelUsuario) {
      ultimaLecturaPorConv.set(c.id, c.ultimaLectura)
    }

    // Obtener datos completos de las conversaciones
    const conversacionesData = await db
      .select()
      .from(conversaciones)
      .where(inArray(conversaciones.id, conversacionIds))
      .orderBy(desc(conversaciones.updatedAt))

    // Obtener participantes con datos de usuario para cada conversación
    const participantesData = await db
      .select({
        conversacionId: participantes.conversacionId,
        usuarioId: participantes.usuarioId,
        rol: participantes.rol,
        nombreCompleto: usuarios.nombreCompleto,
        email: usuarios.email,
      })
      .from(participantes)
      .innerJoin(usuarios, eq(usuarios.id, participantes.usuarioId))
      .where(inArray(participantes.conversacionId, conversacionIds))

    // Obtener último mensaje de cada conversación (con nombre del remitente)
    // Usamos una subquery con DISTINCT ON para eficiencia
    const ultimosMensajes = await db
      .select({
        id: mensajes.id,
        conversacionId: mensajes.conversacionId,
        contenido: mensajes.contenido,
        tipo: mensajes.tipo,
        createdAt: mensajes.createdAt,
        remitenteId: mensajes.remitenteId,
        remitente: usuarios.nombreCompleto,
      })
      .from(mensajes)
      .innerJoin(usuarios, eq(usuarios.id, mensajes.remitenteId))
      .where(
        and(
          inArray(mensajes.conversacionId, conversacionIds),
          eq(mensajes.eliminado, false),
        )
      )
      .orderBy(mensajes.conversacionId, desc(mensajes.createdAt))

    // Agrupar: solo el primer mensaje por conversación (el más reciente)
    const ultimoMensajePorConv = new Map<number, {
      id: number
      contenido: string | null
      tipo: string | null
      createdAt: Date | null
      remitenteId: number
      remitente: string
    }>()
    for (const m of ultimosMensajes) {
      if (!ultimoMensajePorConv.has(m.conversacionId)) {
        ultimoMensajePorConv.set(m.conversacionId, {
          id: m.id,
          contenido: m.contenido,
          tipo: m.tipo,
          createdAt: m.createdAt,
          remitenteId: m.remitenteId,
          remitente: m.remitente,
        })
      }
    }

    // Contar mensajes no leídos por conversación
    const noLeidosCounts = await db
      .select({
        conversacionId: mensajes.conversacionId,
        count: count(),
      })
      .from(mensajes)
      .innerJoin(participantes, and(
        eq(participantes.conversacionId, mensajes.conversacionId),
        eq(participantes.usuarioId, usuarioId),
      ))
      .where(
        and(
          inArray(mensajes.conversacionId, conversacionIds),
          eq(mensajes.eliminado, false),
          // Mensajes posteriores a la última lectura del usuario
          or(
            isNull(participantes.ultimaLectura),
            gt(mensajes.createdAt, participantes.ultimaLectura),
          ),
        )
      )
      .groupBy(mensajes.conversacionId)

    const noLeidosPorConv = new Map<number, number>()
    for (const n of noLeidosCounts) {
      noLeidosPorConv.set(n.conversacionId, n.count)
    }

    // Agrupar participantes por conversación
    const participantesPorConversacion = new Map<number, Array<{
      usuarioId: number
      rol: string | null
      usuario: { nombreCompleto: string; email: string }
    }>>()

    for (const p of participantesData) {
      const existing = participantesPorConversacion.get(p.conversacionId) || []
      existing.push({
        usuarioId: p.usuarioId,
        rol: p.rol,
        usuario: {
          nombreCompleto: p.nombreCompleto,
          email: p.email,
        },
      })
      participantesPorConversacion.set(p.conversacionId, existing)
    }

    // Transformar resultado para el frontend
    return conversacionesData.map(conv => {
      const ultimo = ultimoMensajePorConv.get(conv.id)
      return {
        id: conv.id,
        tipo: conv.tipo,
        nombre: conv.nombre,
        descripcion: conv.descripcion,
        avatarUrl: conv.avatarUrl,
        creadorId: conv.creadorId,
        activo: conv.activo,
        sistema: conv.sistema ?? false,
        departamentoId: conv.departamentoId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participantes: participantesPorConversacion.get(conv.id) || [],
        ultimoMensaje: ultimo
          ? {
              id: ultimo.id,
              contenido: ultimo.contenido ?? '',
              tipo: ultimo.tipo,
              createdAt: ultimo.createdAt?.toISOString() ?? '',
              remitente: { id: ultimo.remitenteId, nombreCompleto: ultimo.remitente },
            }
          : null,
        mensajesNoLeidos: noLeidosPorConv.get(conv.id) ?? 0,
      }
    })
  },

  async obtenerConversacionPorId(db: DbClient, id: number): Promise<Conversacion | undefined> {
    const [result] = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.id, id))

    return result
  },

  async crearConversacion(
    db: DbClient,
    data: NewConversacion,
    participantesIds: number[]
  ): Promise<Conversacion> {
    const [nuevaConversacion] = await db
      .insert(conversaciones)
      .values(data)
      .returning()

    // Agregar participantes
    const participantesData: NewParticipante[] = participantesIds.map(
      (usuarioId) => ({
        conversacionId: nuevaConversacion.id,
        usuarioId,
        rol: usuarioId === data.creadorId ? 'admin' : 'miembro',
      })
    )

    await db.insert(participantes).values(participantesData)

    return nuevaConversacion
  },

  async crearConversacionDirecta(
    db: DbClient,
    usuarioId1: number,
    usuarioId2: number
  ): Promise<Conversacion> {
    // Verificar si ya existe una conversación directa entre estos usuarios
    const existente = await db
      .select({ conversacionId: participantes.conversacionId })
      .from(participantes)
      .innerJoin(conversaciones, eq(participantes.conversacionId, conversaciones.id))
      .where(
        and(
          eq(conversaciones.tipo, 'directa'),
          eq(participantes.usuarioId, usuarioId1)
        )
      )

    for (const conv of existente) {
      const otroParticipante = await db
        .select()
        .from(participantes)
        .where(
          and(
            eq(participantes.conversacionId, conv.conversacionId),
            eq(participantes.usuarioId, usuarioId2)
          )
        )

      if (otroParticipante.length > 0) {
        const [conversacionExistente] = await db
          .select()
          .from(conversaciones)
          .where(eq(conversaciones.id, conv.conversacionId))

        return conversacionExistente
      }
    }

    // Crear nueva conversación directa
    return this.crearConversacion(
      db,
      { tipo: 'directa', creadorId: usuarioId1 },
      [usuarioId1, usuarioId2]
    )
  },

  async verificarParticipante(
    db: DbClient,
    conversacionId: number,
    usuarioId: number
  ): Promise<boolean> {
    const [result] = await db
      .select()
      .from(participantes)
      .where(
        and(
          eq(participantes.conversacionId, conversacionId),
          eq(participantes.usuarioId, usuarioId)
        )
      )

    return !!result
  },

  async obtenerParticipantes(db: DbClient, conversacionId: number) {
    return db
      .select()
      .from(participantes)
      .where(eq(participantes.conversacionId, conversacionId))
  },

  async obtenerParticipantesConUsuario(db: DbClient, conversacionId: number) {
    return db
      .select({
        id: participantes.id,
        usuarioId: participantes.usuarioId,
        conversacionId: participantes.conversacionId,
        rol: participantes.rol,
        createdAt: participantes.createdAt,
        usuario: {
          id: usuarios.id,
          nombreCompleto: usuarios.nombreCompleto,
          email: usuarios.email,
        },
      })
      .from(participantes)
      .innerJoin(usuarios, eq(usuarios.id, participantes.usuarioId))
      .where(eq(participantes.conversacionId, conversacionId))
  },

  async eliminarParticipante(
    db: DbClient,
    conversacionId: number,
    usuarioIdToRemove: number,
    solicitanteId: number
  ) {
    const [conv] = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.id, conversacionId))

    if (!conv) return { success: false, error: 'Conversación no encontrada' }
    if (conv.tipo !== 'grupo')
      return { success: false, error: 'Solo se pueden eliminar miembros de grupos' }
    if (conv.sistema)
      return { success: false, error: 'No se pueden eliminar miembros de grupos del sistema' }

    const [solicitante] = await db
      .select()
      .from(participantes)
      .where(
        and(
          eq(participantes.conversacionId, conversacionId),
          eq(participantes.usuarioId, solicitanteId)
        )
      )

    if (!solicitante || solicitante.rol !== 'admin') {
      return { success: false, error: 'Solo administradores pueden eliminar miembros' }
    }

    if (usuarioIdToRemove === solicitanteId) {
      return { success: false, error: 'No puedes eliminarte a ti mismo del grupo' }
    }

    await db
      .delete(participantes)
      .where(
        and(
          eq(participantes.conversacionId, conversacionId),
          eq(participantes.usuarioId, usuarioIdToRemove)
        )
      )

    return { success: true }
  },

  async agregarParticipante(
    db: DbClient,
    conversacionId: number,
    nuevoUsuarioId: number,
    solicitanteId: number
  ) {
    const [conv] = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.id, conversacionId))

    if (!conv) return { success: false, error: 'Conversación no encontrada' }
    if (conv.tipo !== 'grupo')
      return { success: false, error: 'Solo se pueden agregar miembros a grupos' }

    const [solicitante] = await db
      .select()
      .from(participantes)
      .where(
        and(
          eq(participantes.conversacionId, conversacionId),
          eq(participantes.usuarioId, solicitanteId)
        )
      )

    if (!solicitante || solicitante.rol !== 'admin') {
      return { success: false, error: 'Solo administradores pueden agregar miembros' }
    }

    const yaExiste = await this.verificarParticipante(db, conversacionId, nuevoUsuarioId)
    if (yaExiste) return { success: false, error: 'El usuario ya es miembro del grupo' }

    await db.insert(participantes).values({
      conversacionId,
      usuarioId: nuevoUsuarioId,
      rol: 'miembro',
    })

    return { success: true }
  },

  async renombrarGrupo(
    db: DbClient,
    conversacionId: number,
    nuevoNombre: string,
    solicitanteId: number
  ) {
    const [conv] = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.id, conversacionId))

    if (!conv) return { success: false, error: 'Conversación no encontrada' }
    if (conv.tipo !== 'grupo')
      return { success: false, error: 'Solo se pueden renombrar grupos' }
    if (conv.sistema)
      return { success: false, error: 'No se pueden renombrar grupos del sistema' }

    const [solicitante] = await db
      .select()
      .from(participantes)
      .where(
        and(
          eq(participantes.conversacionId, conversacionId),
          eq(participantes.usuarioId, solicitanteId)
        )
      )

    if (!solicitante || solicitante.rol !== 'admin') {
      return { success: false, error: 'Solo administradores pueden renombrar el grupo' }
    }

    await db
      .update(conversaciones)
      .set({ nombre: nuevoNombre.trim(), updatedAt: new Date() })
      .where(eq(conversaciones.id, conversacionId))

    return { success: true }
  },
}
