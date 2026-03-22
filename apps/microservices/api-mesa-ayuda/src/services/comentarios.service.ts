import type { DbClient } from '@/db/client'
import { AppError } from '@/libs/middleware/AppError'
import type { CrearComentarioInput } from '@/libs/schemas/comentarios.schemas'
import { comentarios, tickets } from '@municipal/db-mesa-ayuda'
import { and, eq } from 'drizzle-orm'

export async function listarComentarios(
  db: DbClient,
  tenantId: number,
  ticketId: number,
) {
  const [ticket] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, tenantId)))

  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404)
  }

  return db
    .select()
    .from(comentarios)
    .where(eq(comentarios.ticketId, ticketId))
    .orderBy(comentarios.createdAt)
}

export async function agregarComentario(
  db: DbClient,
  tenantId: number,
  ticketId: number,
  input: CrearComentarioInput,
  autor: { id: number; nombre: string },
) {
  const [ticket] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, tenantId)))

  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404)
  }

  const [comentario] = await db
    .insert(comentarios)
    .values({
      ticketId,
      autorId: autor.id,
      autorNombre: autor.nombre,
      contenido: input.contenido,
      esInterno: input.esInterno,
    })
    .returning()

  return comentario
}

export async function eliminarComentario(
  db: DbClient,
  ticketId: number,
  comentarioId: number,
  autorId: number,
) {
  const [comentario] = await db
    .select({ id: comentarios.id, autorId: comentarios.autorId })
    .from(comentarios)
    .where(
      and(eq(comentarios.id, comentarioId), eq(comentarios.ticketId, ticketId)),
    )

  if (!comentario) {
    throw new AppError('Comentario no encontrado', 404)
  }

  if (comentario.autorId !== autorId) {
    throw new AppError('Solo el autor puede eliminar su comentario', 403)
  }

  await db.delete(comentarios).where(eq(comentarios.id, comentarioId))
}
