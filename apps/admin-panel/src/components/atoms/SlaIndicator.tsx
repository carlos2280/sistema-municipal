import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import WarningIcon from '@mui/icons-material/Warning'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { differenceInHours, formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EstadoTicket } from '@/types/mesa-ayuda'

interface SlaIndicatorProps {
  fechaLimite: string | null
  estado: EstadoTicket
  compact?: boolean
}

type SlaStatus = 'vencido' | 'riesgo' | 'ok' | 'neutral'

function getSlaStatus(fechaLimite: string | null, estado: EstadoTicket): SlaStatus {
  if (estado === 'resuelto' || estado === 'cerrado') return 'neutral'
  if (!fechaLimite) return 'neutral'

  const fecha = parseISO(fechaLimite)
  if (isPast(fecha)) return 'vencido'
  const horasRestantes = differenceInHours(fecha, new Date())
  if (horasRestantes < 4) return 'riesgo'
  return 'ok'
}

function getSlaLabel(fechaLimite: string | null, estado: EstadoTicket): string {
  if (estado === 'resuelto' || estado === 'cerrado') return 'Resuelto'
  if (!fechaLimite) return 'Sin SLA'

  const fecha = parseISO(fechaLimite)
  if (isPast(fecha)) {
    const horas = Math.abs(differenceInHours(fecha, new Date()))
    return `Vencido ${horas}h`
  }
  return `${formatDistanceToNow(fecha, { locale: es, addSuffix: false })} restantes`
}

export function SlaIndicator({ fechaLimite, estado, compact = false }: SlaIndicatorProps) {
  const theme = useTheme()
  const status = getSlaStatus(fechaLimite, estado)
  const label = getSlaLabel(fechaLimite, estado)

  const colorMap: Record<SlaStatus, string> = {
    vencido: theme.palette.error.main,
    riesgo: theme.palette.warning.main,
    ok: theme.palette.success.main,
    neutral: theme.palette.text.disabled,
  }

  const iconMap: Record<SlaStatus, React.ReactNode> = {
    vencido: <ErrorIcon sx={{ fontSize: 14 }} />,
    riesgo: <WarningIcon sx={{ fontSize: 14 }} />,
    ok: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    neutral: <RemoveCircleOutlineIcon sx={{ fontSize: 14 }} />,
  }

  const color = colorMap[status]

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
        {iconMap[status]}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
      {iconMap[status]}
      <Typography variant="caption" sx={{ color, fontWeight: 500 }}>
        {label}
      </Typography>
      {status === 'neutral' && estado !== 'resuelto' && estado !== 'cerrado' && (
        <AccessTimeIcon sx={{ fontSize: 14, color: theme.palette.text.disabled }} />
      )}
    </Box>
  )
}
