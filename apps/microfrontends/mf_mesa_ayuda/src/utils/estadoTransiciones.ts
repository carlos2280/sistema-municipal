import type { EstadoTicket } from '@/types/mesa-ayuda.types'

// ─── Mapa de transiciones validas entre estados ───────────────────
const transicionesValidas: Record<EstadoTicket, EstadoTicket[]> = {
  abierto: ['en_progreso', 'cerrado'],
  en_progreso: ['en_espera', 'resuelto', 'cerrado'],
  en_espera: ['en_progreso', 'cerrado'],
  resuelto: ['cerrado', 'en_progreso'],
  cerrado: [],
}

/**
 * Verifica si un ticket puede transicionar de un estado a otro.
 */
export function canTransitionTo(
  estadoActual: EstadoTicket,
  estadoDestino: EstadoTicket,
): boolean {
  return transicionesValidas[estadoActual].includes(estadoDestino)
}

/**
 * Obtiene los estados destino validos para un estado dado.
 */
export function getTransicionesDisponibles(
  estadoActual: EstadoTicket,
): EstadoTicket[] {
  return transicionesValidas[estadoActual]
}

// ─── Colores por estado (theme token keys) ────────────────────────
const estadoColorMap: Record<
  EstadoTicket,
  'info' | 'warning' | 'success' | 'error' | 'default'
> = {
  abierto: 'info',
  en_progreso: 'warning',
  en_espera: 'default',
  resuelto: 'success',
  cerrado: 'error',
}

export function getEstadoColor(
  estado: EstadoTicket,
): 'info' | 'warning' | 'success' | 'error' | 'default' {
  return estadoColorMap[estado] ?? 'default'
}

// ─── Labels legibles por estado ───────────────────────────────────
const estadoLabelMap: Record<EstadoTicket, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  en_espera: 'En Espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

export function getEstadoLabel(estado: EstadoTicket): string {
  return estadoLabelMap[estado] ?? estado
}
