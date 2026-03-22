import { and, eq, inArray } from 'drizzle-orm'
import type { DbClient } from '../db/client.js'
import { obtenerDepartamentosConUsuarios } from '../libs/identidadClient.js'
import { conversaciones } from '../db/schemas/conversaciones.schema.js'
import { participantes } from '../db/schemas/participantes.schema.js'

interface SyncResult {
  created: number[]
  updated: number[]
}

export const gruposSistemaService = {
  /**
   * Sincroniza los grupos del sistema con la estructura de departamentos
   * de api-identidad. Un grupo del sistema = un departamento.
   * Los usuarios del grupo son todos los activos del departamento
   * (via sus oficinas), resueltos por HTTP a api-identidad.
   *
   * @param db      cliente de DB del tenant (mensajeria en transversal)
   * @param dbName  nombre de la DB del tenant (para el header x-tenant-db-name
   *                que api-identidad necesita para resolver el organigrama)
   */
  async sincronizarGrupos(db: DbClient, dbName: string): Promise<SyncResult> {
    // Obtener departamentos con sus usuarios desde api-identidad
    const allDepartamentos = await obtenerDepartamentosConUsuarios(dbName)

    const gruposSistema = await db
      .select()
      .from(conversaciones)
      .where(eq(conversaciones.sistema, true))

    const gruposPorDepto = new Map(
      gruposSistema.map((g) => [g.departamentoId, g]),
    )

    const result: SyncResult = { created: [], updated: [] }

    for (const depto of allDepartamentos) {
      const userIds = depto.usuarioIds
      const existingGroup = gruposPorDepto.get(depto.id)

      if (!existingGroup) {
        // Crear nuevo grupo del sistema
        if (userIds.length === 0) continue

        const [newGroup] = await db
          .insert(conversaciones)
          .values({
            tipo: 'grupo',
            nombre: depto.nombre,
            descripcion: `Grupo del departamento ${depto.nombre}`,
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
          })),
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
            })),
          )
        }

        if (toRemove.length > 0) {
          await db
            .delete(participantes)
            .where(
              and(
                eq(participantes.conversacionId, existingGroup.id),
                inArray(participantes.usuarioId, toRemove),
              ),
            )
        }

        // Actualizar nombre si cambio el departamento
        if (existingGroup.nombre !== depto.nombre) {
          await db
            .update(conversaciones)
            .set({
              nombre: depto.nombre,
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
