// Tipo local que representa los datos de usuario que api-chat recibe
// desde api-identidad via HTTP (no JOIN directo, las tablas viven en DBs distintas).
export interface UsuarioLocal {
  id: number
  nombreCompleto: string
  email: string
}
