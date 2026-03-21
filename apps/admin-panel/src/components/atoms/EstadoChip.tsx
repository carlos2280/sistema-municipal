import Chip from '@mui/material/Chip'
import type { EstadoTicket } from '@/types/mesa-ayuda'

interface EstadoChipProps {
  estado: EstadoTicket
  size?: 'small' | 'medium'
}

const ESTADO_LABEL: Record<EstadoTicket, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  en_espera: 'En Espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'

const ESTADO_COLOR: Record<EstadoTicket, ChipColor> = {
  abierto: 'info',
  en_progreso: 'primary',
  en_espera: 'warning',
  resuelto: 'success',
  cerrado: 'default',
}

export function EstadoChip({ estado, size = 'small' }: EstadoChipProps) {
  return (
    <Chip
      label={ESTADO_LABEL[estado]}
      color={ESTADO_COLOR[estado]}
      size={size}
    />
  )
}
