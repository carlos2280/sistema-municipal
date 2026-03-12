import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { Calendar, MapPin, Mic, Plus, Video } from 'lucide-react'
import { memo, useState } from 'react'
import { useCrearReunionMutation, useProximasReunionesQuery } from 'mf_store/store'
import type { Reunion, TipoReunion } from 'mf_store/store'
import { useConversaciones } from '../../hooks'
import type { CreateReunionInput } from '../../types/meeting.types'
import { CreateMeetingDialog } from '../Meeting'

interface MeetingsPanelProps {
  currentUserId?: number
  onSelectConversation?: (id: number) => void
  onSelectReunion?: (reunionId: number) => void
}

const TIPO_ICON: Record<TipoReunion, React.ReactNode> = {
  video: <Video size={13} />,
  voz: <Mic size={13} />,
  presencial: <MapPin size={13} />,
}

const ESTADO_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
  programada: 'primary',
  activa: 'success',
  completada: 'default',
  cancelada: 'error',
}

function formatDateGroup(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const meetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((meetDay.getTime() - today.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays < 7)
    return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(reuniones: Reunion[]): [string, Reunion[]][] {
  const map = new Map<string, Reunion[]>()
  for (const r of reuniones) {
    const key = formatDateGroup(r.fechaInicio)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries())
}

export const MeetingsPanel = memo(function MeetingsPanel({
  currentUserId,
  onSelectConversation,
  onSelectReunion,
}: MeetingsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: proximas = [], isLoading } = useProximasReunionesQuery()
  const [crearMutation, { isLoading: isCreating }] = useCrearReunionMutation()
  const { conversaciones } = useConversaciones()

  const convOptions = conversaciones.map((conv) => {
    let nombre = conv.nombre ?? `Conversación ${conv.id}`
    if (conv.tipo === 'directa') {
      const other = conv.participantes?.find((p) => p.usuarioId !== currentUserId)
      if (other?.usuario?.nombreCompleto) nombre = other.usuario.nombreCompleto
    }
    return { id: conv.id, nombre, tipo: conv.tipo as 'directa' | 'grupo' }
  })

  const gruposParaSelector = conversaciones
    .filter((c) => c.tipo === 'grupo')
    .map((c) => ({
      id: c.id,
      nombre: c.nombre ?? `Grupo ${c.id}`,
      miembros: (c.participantes ?? [])
        .filter((p) => p.usuarioId !== currentUserId)
        .map((p) => ({
          id: p.usuarioId,
          nombre: p.usuario?.nombreCompleto ?? `Usuario ${p.usuarioId}`,
        })),
    }))
    .filter((g) => g.miembros.length > 0)

  const handleConfirm = async (data: CreateReunionInput, conversacionId?: number) => {
    if (!conversacionId) return
    await crearMutation({ conversacionId, ...data }).unwrap()
  }

  const grupos = groupByDate(proximas)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* CTA */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<Plus size={16} />}
          onClick={() => setDialogOpen(true)}
        >
          Programar reunión
        </Button>
      </Box>

      {/* Lista */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary" fontSize={13}>
              Cargando...
            </Typography>
          </Box>
        ) : proximas.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60%',
              gap: 1.5,
              color: 'text.secondary',
              p: 4,
            }}
          >
            <Calendar size={40} strokeWidth={1.2} />
            <Typography fontSize={14} fontWeight={500}>
              Sin reuniones próximas
            </Typography>
            <Typography fontSize={12} textAlign="center" color="text.disabled">
              Programa una reunión para coordinar con tu equipo
            </Typography>
          </Box>
        ) : (
          grupos.map(([label, items]) => (
            <Box key={label}>
              <Typography
                sx={{
                  px: 2,
                  py: 0.75,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  bgcolor: 'action.hover',
                }}
              >
                {label}
              </Typography>

              {items.map((reunion) => (
                <Box
                  key={reunion.id}
                  onClick={() =>
                    onSelectReunion
                      ? onSelectReunion(reunion.id)
                      : onSelectConversation?.(reunion.conversacionId)
                  }
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 13, flex: 1, pr: 1 }}>
                      {reunion.titulo}
                    </Typography>
                    <Chip
                      label={reunion.estado}
                      size="small"
                      color={ESTADO_COLOR[reunion.estado] ?? 'default'}
                      sx={{ fontSize: 10, height: 18 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: 'text.secondary',
                    }}
                  >
                    {TIPO_ICON[reunion.tipo]}
                    <Typography fontSize={12}>
                      {formatTime(reunion.fechaInicio)} – {formatTime(reunion.fechaFin)}
                    </Typography>
                  </Box>

                  {reunion.ubicacion && (
                    <Typography fontSize={11} color="text.disabled" sx={{ mt: 0.25 }}>
                      {reunion.ubicacion}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))
        )}
      </Box>

      <CreateMeetingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isCreating}
        conversaciones={convOptions}
        organizadorId={currentUserId}
        grupos={gruposParaSelector}
      />
    </Box>
  )
})
