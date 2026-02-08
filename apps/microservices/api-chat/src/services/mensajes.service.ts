import { and, desc, eq, lt } from 'drizzle-orm'
import { db } from '../db/client.js'
import { conversaciones } from '../db/schemas/conversaciones.schema.js'
import {
  type Mensaje,
  type NewMensaje,
  mensajes,
} from '../db/schemas/mensajes.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'

const PAGE_SIZE = 50

interface MensajeConRemitente extends Mensaje {
  remitente: {
    id: number
    nombreCompleto: string
    email: string
  }
}

export const mensajesService = {
  async obtenerMensajes(
    conversacionId: number,
    cursor?: number
  ): Promise<MensajeConRemitente[]> {
    const conditions = [eq(mensajes.conversacionId, conversacionId)]

    if (cursor) {
      conditions.push(lt(mensajes.id, cursor))
    }

    const results = await db
      .select({
        id: mensajes.id,
        conversacionId: mensajes.conversacionId,
        remitenteId: mensajes.remitenteId,
        contenido: mensajes.contenido,
        tipo: mensajes.tipo,
        replyToId: mensajes.replyToId,
        editado: mensajes.editado,
        eliminado: mensajes.eliminado,
        createdAt: mensajes.createdAt,
        updatedAt: mensajes.updatedAt,
        remitenteNombre: usuarios.nombreCompleto,
        remitenteEmail: usuarios.email,
      })
      .from(mensajes)
      .innerJoin(usuarios, eq(usuarios.id, mensajes.remitenteId))
      .where(and(...conditions))
      .orderBy(desc(mensajes.createdAt))
      .limit(PAGE_SIZE)

    return results.map((r) => ({
      id: r.id,
      conversacionId: r.conversacionId,
      remitenteId: r.remitenteId,
      contenido: r.contenido,
      tipo: r.tipo,
      replyToId: r.replyToId,
      editado: r.editado,
      eliminado: r.eliminado,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      remitente: {
        id: r.remitenteId,
        nombreCompleto: r.remitenteNombre,
        email: r.remitenteEmail,
      },
    }))
  },

  async crearMensaje(data: NewMensaje): Promise<MensajeConRemitente> {
    const [nuevoMensaje] = await db.insert(mensajes).values(data).returning()

    // Actualizar timestamp de la conversación
    await db
      .update(conversaciones)
      .set({ updatedAt: new Date() })
      .where(eq(conversaciones.id, data.conversacionId))

    // Obtener datos del remitente
    const [remitente] = await db
      .select({
        id: usuarios.id,
        nombreCompleto: usuarios.nombreCompleto,
        email: usuarios.email,
      })
      .from(usuarios)
      .where(eq(usuarios.id, data.remitenteId))

    return {
      ...nuevoMensaje,
      remitente: {
        id: remitente.id,
        nombreCompleto: remitente.nombreCompleto,
        email: remitente.email,
      },
    }
  },

  async obtenerMensajePorId(id: number): Promise<Mensaje | undefined> {
    const [result] = await db.select().from(mensajes).where(eq(mensajes.id, id))
    return result
  },

  async editarMensaje(
    id: number,
    contenido: string,
    usuarioId: number
  ): Promise<Mensaje | null> {
    const [mensaje] = await db
      .select()
      .from(mensajes)
      .where(and(eq(mensajes.id, id), eq(mensajes.remitenteId, usuarioId)))

    if (!mensaje) {
      return null
    }

    const [actualizado] = await db
      .update(mensajes)
      .set({ contenido, editado: true, updatedAt: new Date() })
      .where(eq(mensajes.id, id))
      .returning()

    return actualizado
  },

  async eliminarMensaje(id: number, usuarioId: number): Promise<boolean> {
    const [mensaje] = await db
      .select()
      .from(mensajes)
      .where(and(eq(mensajes.id, id), eq(mensajes.remitenteId, usuarioId)))

    if (!mensaje) {
      return false
    }

    await db
      .update(mensajes)
      .set({ eliminado: true, contenido: null, updatedAt: new Date() })
      .where(eq(mensajes.id, id))

    return true
  },
}
