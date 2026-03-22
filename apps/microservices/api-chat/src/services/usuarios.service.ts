import {
  type UsuarioResumen,
  buscarUsuarios as identidadBuscarUsuarios,
  obtenerUsuarioPorId as identidadObtenerUsuarioPorId,
} from '../libs/identidadClient.js'

export const usuariosService = {
  /**
   * Busca usuarios delegando a api-identidad.
   * El parametro `db` se mantiene por compatibilidad de firma con los controllers
   * que pasan `tenantDb`, pero no se usa (identidad vive en muni_default).
   */
  async buscarUsuarios(
    _db: unknown,
    busqueda: string,
    usuarioActualId: number,
    limit = 20,
  ): Promise<UsuarioResumen[]> {
    return identidadBuscarUsuarios(busqueda, usuarioActualId, limit)
  },

  async obtenerUsuarioPorId(
    _db: unknown,
    id: number,
  ): Promise<UsuarioResumen | undefined> {
    return identidadObtenerUsuarioPorId(id)
  },
}
