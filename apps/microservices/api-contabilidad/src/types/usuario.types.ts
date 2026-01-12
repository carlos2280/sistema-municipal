// Tipo básico de Usuario para uso en JWT
// No incluimos la tabla completa ya que esta API no maneja usuarios directamente
export interface Usuario {
  id: number;
  email: string;
  nombreCompleto: string;
}
