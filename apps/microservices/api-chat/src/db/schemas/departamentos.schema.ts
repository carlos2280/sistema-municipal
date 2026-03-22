// Tipo local que representa un departamento resuelto desde api-identidad via HTTP.
// La tabla identidad.departamentos vive en muni_default, no en transversal.
export interface DepartamentoLocal {
  id: number
  nombreDepartamento: string
  idDireccion: number
}
