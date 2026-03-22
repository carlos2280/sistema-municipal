import { and, desc, eq, lt } from 'drizzle-orm'
import type { DbClient } from '../db/client.js'
import { conversaciones } from '../db/schemas/conversaciones.schema.js'
import {
  type Mensaje,
  type NewMensaje,
  mensajes,
} from '../db/schemas/mensajes.schema.js'
import {
  type UsuarioResumen,
  obtenerUsuarioPorId,
  obtenerUsuariosBatch,
} from '../libs/identidadClient.js'

const PAGE_SIZE = 50

interface MensajeConRemitente extends Mensaje {
  remitente: {
    id: number
    nombreCompleto: string
    email: string
  }
}

// Fallback cuando el usuario no se puede resolver desde api-identidad
function remitenteDesconocido(id: number): UsuarioResumen {
  return { id, nombreCompleto: 'Usuario', email: '' }
}

export const mensajesService = {
  async obtenerMensajes(
    db: DbClient,
    conversacionId: number,
    cursor?: number,
  ): Promise<MensajeConRemitente[]> {
    const conditions = [eq(mensajes.conversacionId, conversacionId)]

    if (cursor) {
      conditions.push(lt(mensajes.id, cursor))
    }

    const results = await db
      .select()
      .from(mensajes)
      .where(and(...conditions))
      .orderBy(desc(mensajes.createdAt))
      .limit(PAGE_SIZE)

    if (results.length === 0) return []

    // Enriquecer con datos de usuario via api-identidad (batch)
    const remitenteIds = [...new Set(results.map((r) => r.remitenteId))]
    const remitentes = await obtenerUsuariosBatch(remitenteIds)
    const remitenteMap = new Map(remitentes.map((u) => [u.id, u]))

    return results.map((r) => ({
      ...r,
      remitente:
        remitenteMap.get(r.remitenteId) ?? remitenteDesconocido(r.remitenteId),
    }))
  },

  async crearMensaje(
    db: DbClient,
    data: NewMensaje,
  ): Promise<MensajeConRemitente> {
    const [nuevoMensaje] = await db.insert(mensajes).values(data).returning()

    // Actualizar timestamp de la conversacion
    await db
      .update(conversaciones)
      .set({ updatedAt: new Date() })
      .where(eq(conversaciones.id, data.conversacionId))

    // Resolver datos del remitente via api-identidad
    const remitente =
      (await obtenerUsuarioPorId(data.remitenteId)) ??
      remitenteDesconocido(data.remitenteId)

    return {
      ...nuevoMensaje,
      remitente,
    }
  },

  async obtenerMensajePorId(
    db: DbClient,
    id: number,
  ): Promise<Mensaje | undefined> {
    const [result] = await db.select().from(mensajes).where(eq(mensajes.id, id))
    return result
  },

  async editarMensaje(
    db: DbClient,
    id: number,
    contenido: string,
    usuarioId: number,
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

  async eliminarMensaje(
    db: DbClient,
    id: number,
    usuarioId: number,
  ): Promise<boolean> {
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
