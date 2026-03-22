// Tipo local que representa una oficina resuelta desde api-identidad via HTTP.
// La tabla identidad.oficinas vive en muni_default, no en transversal.
export interface OficinaLocal {
  id: number
  nombreOficina: string
  idDepartamento: number
}
