import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import { conversaciones } from '../db/schemas/conversaciones.schema.js'
import { participantes } from '../db/schemas/participantes.schema.js'
import { departamentos } from '../db/schemas/departamentos.schema.js'
import { oficinas } from '../db/schemas/oficinas.schema.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'

interface SyncResult {
  created: number[]
  updated: number[]
}

export const gruposSistemaService = {
  async sincronizarGrupos(): Promise<SyncResult> {
    const allDepartamentos = await db.select().from(departamentos)

    const gruposSistema = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.sistema, true))

    const gruposPorDepto = new Map(
      gruposSistema.map((g) => [g.departamentoId, g])
    )

    const result: SyncResult = { created: [], updated: [] }

    for (const depto of allDepartamentos) {
      // Obtener usuarios activos del departamento (usuarios → oficinas → departamento)
      const usuariosDepto = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .innerJoin(oficinas, eq(usuarios.idOficina, oficinas.id))
        .where(
          and(
            eq(oficinas.idDepartamento, depto.id),
            eq(usuarios.activo, true)
          )
        )

      const userIds = usuariosDepto.map((u) => u.id)
      const existingGroup = gruposPorDepto.get(depto.id)

      if (!existingGroup) {
        // Crear nuevo grupo del sistema
        if (userIds.length === 0) continue

        const [newGroup] = await db
          .insert(conversaciones)
          .values({
            tipo: 'grupo',
            nombre: depto.nombreDepartamento,
            descripcion: `Grupo del departamento ${depto.nombreDepartamento}`,
            creadorId: userIds[0],
            sistema: true,
            departamentoId: depto.id,
          })
          .returning()

        await db.insert(participantes).values(
          userIds.map((uid) => ({
            conversacionId: newGroup.id,
            usuarioId: uid,
            rol: 'miembro' as const,
          }))
        )

        result.created.push(newGroup.id)
      } else {
        // Sincronizar miembros del grupo existente
        const currentParticipants = await db
          .select({ usuarioId: participantes.usuarioId })
          .from(participantes)
          .where(eq(participantes.conversacionId, existingGroup.id))

        const currentIds = new Set(currentParticipants.map((p) => p.usuarioId))
        const targetIds = new Set(userIds)

        const toAdd = userIds.filter((id) => !currentIds.has(id))
        const toRemove = currentParticipants
          .filter((p) => !targetIds.has(p.usuarioId))
          .map((p) => p.usuarioId)

        if (toAdd.length > 0) {
          await db.insert(participantes).values(
            toAdd.map((uid) => ({
              conversacionId: existingGroup.id,
              usuarioId: uid,
              rol: 'miembro' as const,
            }))
          )
        }

        if (toRemove.length > 0) {
          await db
            .delete(participantes)
            .where(
              and(
                eq(participantes.conversacionId, existingGroup.id),
                inArray(participantes.usuarioId, toRemove)
              )
            )
        }

        // Actualizar nombre si cambió el departamento
        if (existingGroup.nombre !== depto.nombreDepartamento) {
          await db
            .update(conversaciones)
            .set({
              nombre: depto.nombreDepartamento,
              updatedAt: new Date(),
            })
            .where(eq(conversaciones.id, existingGroup.id))
        }

        if (toAdd.length > 0 || toRemove.length > 0) {
          result.updated.push(existingGroup.id)
        }
      }
    }

    return result
  },
}
