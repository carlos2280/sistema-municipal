import type { EstadoTicket } from '@/types/mesa-ayuda'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

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

type SemanticKey = 'info' | 'warning' | 'success' | 'disabled'

const ESTADO_SEMANTIC: Record<EstadoTicket, SemanticKey> = {
  abierto: 'info',
  en_progreso: 'warning',
  en_espera: 'warning',
  resuelto: 'success',
  cerrado: 'disabled',
}

export function EstadoChip({ estado, size = 'small' }: EstadoChipProps) {
  const theme = useTheme()
  const semantic = ESTADO_SEMANTIC[estado]

  const color =
    semantic === 'disabled'
      ? theme.palette.text.disabled
      : theme.palette[semantic].main

  const px = size === 'small' ? '8px' : '10px'
  const py = size === 'small' ? '3px' : '5px'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        px,
        py,
        borderRadius: '4px',
        backgroundColor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.2)}`,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {ESTADO_LABEL[estado]}
    </Box>
  )
}
