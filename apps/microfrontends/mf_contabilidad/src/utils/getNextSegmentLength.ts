// utils/getNextSegmentLength.ts
const SEGMENT_LENGTHS = [2, 2, 3, 3, 3]; // para tipo 4..8

/**
 * Dado un tipoCuentaId (4-8) y un código ya formateado con guiones,
 * devuelve cuántos dígitos debe permitir en el siguiente segmento.
 */
export function getNextSegmentLength(
  tipoCuentaId: number,
  formattedCode: string,
): number {
  // Cuántos segmentos totales permite este tipo:
  const total = Math.max(0, Math.min(SEGMENT_LENGTHS.length, tipoCuentaId - 3));
  // Cuántos ya escribió el user (cuenta los guiones):
  const written = formattedCode.split('-').length - 1;
  // Si ya escribió todos, devolvemos el último:
  if (written >= total) return SEGMENT_LENGTHS[total - 1] || 0;
  // Si no, devolvemos el que corresponde:
  return SEGMENT_LENGTHS[written] || 0;
}
