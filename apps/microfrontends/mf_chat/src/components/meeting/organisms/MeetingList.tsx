import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ArrowLeft, Calendar, X } from 'lucide-react'
import { memo } from 'react'
import { useListarReunionesQuery } from 'mf_store/store'

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
  const h2 = new Date(fin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fecha} · ${h1}–${h2}`
}

const ESTADO_COLOR: Record<string, string> = {
  programada: '#2563EB',
  activa: '#16A34A',
  completada: '#6B7280',
  cancelada: '#DC2626',
}

export const MeetingList = memo(function MeetingList({
  conversacionId,
  onSelectReunion,
  onBack,
  onClose,
}: MeetingListProps) {
  const { data: reuniones = [], isLoading } = useListarReunionesQuery(conversacionId)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {onBack && (
          <IconButton size="small" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowLeft size={18} />
          </IconButton>
        )}
        <Typography sx={{ fontWeight: 600, fontSize: 15, flex: 1 }}>
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
            <Typography color="text.secondary" fontSize={13}>Cargando...</Typography>
          </Box>
        ) : reuniones.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Calendar size={32} strokeWidth={1.5} />
            <Typography fontSize={13}>No hay reuniones programadas</Typography>
          </Box>
        ) : (
          reuniones.map((reunion) => (
            <Box
              key={reunion.id}
              onClick={() => onSelectReunion(reunion.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{reunion.titulo}</Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: ESTADO_COLOR[reunion.estado] ?? '#6B7280',
                    mt: 0.5,
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                {formatRange(reunion.fechaInicio, reunion.fechaFin)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
})
