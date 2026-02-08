import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import {
  type Conversacion,
  type NewConversacion,
  conversaciones,
} from '../db/schemas/conversaciones.schema.js'
import {
  type NewParticipante,
  participantes,
} from '../db/schemas/participantes.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'

export const conversacionesService = {
  async obtenerConversacionesPorUsuario(usuarioId: number) {
    // Obtener IDs de conversaciones del usuario
    const conversacionesDelUsuario = await db
      .select({ id: conversaciones.id })
      .from(conversaciones)
      .innerJoin(participantes, eq(participantes.conversacionId, conversaciones.id))
      .where(eq(participantes.usuarioId, usuarioId))
      .orderBy(desc(conversaciones.updatedAt))

    const conversacionIds = conversacionesDelUsuario.map(c => c.id)

    if (conversacionIds.length === 0) {
      return []
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
    return conversacionesData.map(conv => ({
      id: conv.id,
      tipo: conv.tipo,
      nombre: conv.nombre,
      descripcion: conv.descripcion,
      avatarUrl: conv.avatarUrl,
      creadorId: conv.creadorId,
      activo: conv.activo,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participantes: participantesPorConversacion.get(conv.id) || [],
      ultimoMensaje: null,
      mensajesNoLeidos: 0,
    }))
  },

  async obtenerConversacionPorId(id: number): Promise<Conversacion | undefined> {
    const [result] = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.id, id))

    return result
  },

  async crearConversacion(
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
      { tipo: 'directa', creadorId: usuarioId1 },
      [usuarioId1, usuarioId2]
    )
  },

  async verificarParticipante(
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

  async obtenerParticipantes(conversacionId: number) {
    return db
      .select()
      .from(participantes)
      .where(eq(participantes.conversacionId, conversacionId))
  },
}
