import { ilike, ne, and, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { usuarios } from '../db/schemas/usuarios.schema.js'

export const usuariosService = {
  async buscarUsuarios(busqueda: string, usuarioActualId: number, limit = 20) {
    const resultado = await db
      .select({
        id: usuarios.id,
        nombreCompleto: usuarios.nombreCompleto,
        email: usuarios.email,
      })
      .from(usuarios)
      .where(
        and(
          ne(usuarios.id, usuarioActualId),
          eq(usuarios.activo, true),
          busqueda
            ? ilike(usuarios.nombreCompleto, `%${busqueda}%`)
            : undefined
        )
      )
      .limit(limit)

    return resultado
  },

  async obtenerUsuarioPorId(id: number) {
    const [usuario] = await db
      .select({
        id: usuarios.id,
        nombreCompleto: usuarios.nombreCompleto,
        email: usuarios.email,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))

    return usuario
  },
}
