import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ArrowLeft, Calendar, X } from 'lucide-react'
import { useListarReunionesQuery } from 'mf_store/store'
import { memo } from 'react'

interface MeetingListProps {
  conversacionId: number
  currentUserId?: number
  onSelectReunion: (reunionId: number) => void
  onBack?: () => void
  onClose?: () => void
}

function formatRange(inicio: string, fin: string): string {
  const d = new Date(inicio)
  const h1 = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const h2 = new Date(fin).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const fecha = d.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${fecha} · ${h1}–${h2}`
}

export const MeetingList = memo(function MeetingList({
  conversacionId,
  onSelectReunion,
  onBack,
  onClose,
}: MeetingListProps) {
  const theme = useTheme()
  const { data: reuniones = [], isLoading } =
    useListarReunionesQuery(conversacionId)

  /** Color semántico para el dot de estado */
  const getEstadoColor = (estado: string): string => {
    const map: Record<string, string> = {
      programada: theme.palette.info.main,
      activa: theme.palette.success.main,
      completada: theme.palette.text.disabled,
      cancelada: theme.palette.error.main,
    }
    return map[estado] ?? theme.palette.text.disabled
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1.5,
          borderBottom: `1px solid ${theme.meridian.borders.default}`,
          bgcolor: theme.meridian.surfaces.s1,
        }}
      >
        {onBack && (
          <IconButton size="small" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowLeft size={18} />
          </IconButton>
        )}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            fontFamily: '"Bricolage Grotesque", sans-serif',
            flex: 1,
          }}
        >
          Reuniones
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Cargando...
            </Typography>
          </Box>
        ) : reuniones.length === 0 ? (
          /* MERIDIAN empty state */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              gap: 1.5,
            }}
          >
            <Calendar
              size={32}
              color={theme.palette.text.disabled}
              strokeWidth={1.5}
            />
            <Typography
              sx={{
                fontSize: '13.5px',
                fontFamily: '"DM Sans", sans-serif',
                color: 'text.secondary',
              }}
            >
              No hay reuniones programadas
            </Typography>
          </Box>
        ) : (
          reuniones.map((reunion) => (
            <Box
              key={reunion.id}
              onClick={() => onSelectReunion(reunion.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${theme.meridian.borders.muted}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.meridian.surfaces.s3 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  {reunion.titulo}
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getEstadoColor(reunion.estado),
                    mt: 0.5,
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontFeatureSettings: "'tnum' 1",
                  color: 'text.secondary',
                  mt: 0.25,
                }}
              >
                {formatRange(reunion.fechaInicio, reunion.fechaFin)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
})
