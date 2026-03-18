import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { Calendar, MapPin, Mic, Monitor, Video } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import {
  type EstadoInvitacion,
  type Reunion,
  type TipoReunion,
  useObtenerReunionQuery,
  useRsvpReunionMutation,
} from 'mf_store/store'

interface MeetingCardProps {
  reunionId: number
  currentUserId?: number
  onJoin?: (llamadaId: number, token?: string) => void
  onIniciar?: (reunionId: number) => void
}

const TIPO_ICON: Record<TipoReunion, React.ReactNode> = {
  video: <Video size={13} />,
  voz: <Mic size={13} />,
  presencial: <MapPin size={13} />,
}

const TIPO_LABEL: Record<TipoReunion, string> = {
  video: 'Videollamada',
  voz: 'Llamada de voz',
  presencial: 'Presencial',
}

const ESTADO_ACCENT: Record<Reunion['estado'], string> = {
  programada: '#1976d2',
  activa: '#2e7d32',
  completada: '#9e9e9e',
  cancelada: '#d32f2f',
}

const ESTADO_CHIP_COLOR: Record<Reunion['estado'], 'default' | 'primary' | 'success' | 'error'> = {
  programada: 'primary',
  activa: 'success',
  completada: 'default',
  cancelada: 'error',
}

const RSVP_DOT: Record<EstadoInvitacion, string> = {
  aceptada: '#2e7d32',
  rechazada: '#d32f2f',
  tentativa: '#ed6c02',
  pendiente: '#9e9e9e',
}

const RSVP_LABEL: Record<EstadoInvitacion, string> = {
  aceptada: 'Aceptaste',
  rechazada: 'Rechazaste',
  tentativa: 'Tal vez',
  pendiente: 'Sin responder',
}

function formatRange(inicio: string, fin: string): string {
  const d = new Date(inicio)
  const h1 = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const h2 = new Date(fin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return `${fecha} · ${h1} – ${h2}`
}

function formatCountdown(fechaInicio: string): string | null {
  const diff = new Date(fechaInicio).getTime() - Date.now()
  if (diff < 0 || diff > 24 * 60 * 60 * 1000) return null
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Comenzando ahora'
  if (mins < 60) return `En ${mins} min`
  return `En ${Math.round(mins / 60)}h`
}

export const MeetingCard = memo(function MeetingCard({
  reunionId,
  currentUserId,
  onJoin,
  onIniciar,
}: MeetingCardProps) {
  const { data: reunion } = useObtenerReunionQuery(reunionId)
  const [rsvpMutation, { isLoading: isRsvping }] = useRsvpReunionMutation()
  const [editandoRsvp, setEditandoRsvp] = useState(false)

  const miInvitacion = reunion?.invitaciones.find((i) => i.usuarioId === currentUserId)
  const esOrganizador = reunion?.organizadorId === currentUserId

  const handleRsvp = useCallback(
    async (estado: EstadoInvitacion) => {
      await rsvpMutation({ id: reunionId, estado }).unwrap()
      setEditandoRsvp(false)
    },
    [rsvpMutation, reunionId]
  )

  const handleJoin = useCallback(() => {
    if (reunion?.llamadaId) onJoin?.(reunion.llamadaId)
  }, [reunion, onJoin])

  const handleIniciar = useCallback(() => {
    onIniciar?.(reunionId)
  }, [onIniciar, reunionId])

  if (!reunion) return null

  const puedeIniciar = esOrganizador && reunion.estado === 'programada' && reunion.tipo !== 'presencial'
  const puedeUnirse = reunion.estado === 'activa' && !!reunion.llamadaId
  const cancelada = reunion.estado === 'cancelada'
  const completada = reunion.estado === 'completada'
  const inactiva = cancelada || completada
  const countdown = !inactiva ? formatCountdown(reunion.fechaInicio) : null
  const accentColor = ESTADO_ACCENT[reunion.estado]

  // BUG-01: excluir al organizador del conteo RSVP
  const invitadosReales = reunion.invitaciones.filter((i) => i.usuarioId !== reunion.organizadorId)
  const counts = {
    aceptada: invitadosReales.filter((i) => i.estado === 'aceptada').length,
    tentativa: invitadosReales.filter((i) => i.estado === 'tentativa').length,
    rechazada: invitadosReales.filter((i) => i.estado === 'rechazada').length,
    pendiente: invitadosReales.filter((i) => i.estado === 'pendiente').length,
  }

  const rsvpPendiente = miInvitacion?.estado === 'pendiente' && !esOrganizador && !inactiva
  const yaRespondio = miInvitacion && miInvitacion.estado !== 'pendiente' && !esOrganizador

  // Mostrar botones RSVP si está pendiente O si está cambiando respuesta
  const mostrarBotonesRsvp = (rsvpPendiente || (yaRespondio && editandoRsvp)) && !inactiva

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: cancelada ? 'divider' : 'primary.light',
        borderRadius: 2,
        overflow: 'hidden',
        my: 0.5,
        maxWidth: 320,
        opacity: inactiva ? 0.65 : 1,
        bgcolor: 'background.paper',
        boxShadow: inactiva ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* Accent strip */}
      <Box sx={{ height: 3, bgcolor: accentColor, opacity: inactiva ? 0.4 : 1 }} />

      <Box sx={{ p: 1.5 }}>
        {/* Header: tipo + titulo + estado */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.75 }}>
          <Box sx={{ color: accentColor, mt: '2px', flexShrink: 0 }}>
            {TIPO_ICON[reunion.tipo]}
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.3,
              flex: 1,
              color: inactiva ? 'text.disabled' : 'text.primary',
            }}
          >
            {reunion.titulo}
          </Typography>
          <Chip
            label={reunion.estado}
            size="small"
            color={ESTADO_CHIP_COLOR[reunion.estado]}
            sx={{ fontSize: 10, height: 18, flexShrink: 0 }}
          />
        </Box>

        {/* Fecha/hora + countdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <Calendar size={12} />
            <Typography sx={{ fontSize: 12 }}>
              {formatRange(reunion.fechaInicio, reunion.fechaFin)}
            </Typography>
          </Box>
          {countdown && (
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: reunion.estado === 'activa' ? 'success.main' : 'primary.main',
                bgcolor: reunion.estado === 'activa' ? 'success.50' : 'primary.50',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                flexShrink: 0,
                ml: 0.5,
              }}
            >
              {countdown}
            </Typography>
          )}
        </Box>

        {/* Tipo + ubicación */}
        <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 1 }}>
          {TIPO_LABEL[reunion.tipo]}
          {reunion.ubicacion ? ` · ${reunion.ubicacion}` : ''}
        </Typography>

        {/* RSVP dots — solo invitados reales (excluye organizador) */}
        {invitadosReales.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
            {(Object.entries(counts) as [EstadoInvitacion, number][])
              .filter(([, n]) => n > 0)
              .map(([estado, n]) => (
                <Box key={estado} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: RSVP_DOT[estado],
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{n}</Typography>
                </Box>
              ))}
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              · {invitadosReales.length} {invitadosReales.length === 1 ? 'invitado' : 'invitados'}
            </Typography>
          </Box>
        )}

        {/* Mi respuesta actual (si ya respondió y no está editando) */}
        {yaRespondio && !editandoRsvp && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: RSVP_DOT[miInvitacion!.estado],
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {RSVP_LABEL[miInvitacion!.estado]}
            </Typography>
            {!inactiva && (
              <Button
                size="small"
                sx={{ fontSize: 10, py: 0, px: 0.75, minWidth: 0, ml: 0.5, height: 20 }}
                onClick={() => setEditandoRsvp(true)}
              >
                Cambiar
              </Button>
            )}
          </Box>
        )}

        {/* RSVP buttons (pendiente o cambiando respuesta) */}
        {mostrarBotonesRsvp && (
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleRsvp('aceptada')}
              disabled={isRsvping}
              sx={{ fontSize: 11, py: 0.5, flex: 1, minWidth: 0 }}
            >
              Aceptar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => handleRsvp('tentativa')}
              disabled={isRsvping}
              sx={{ fontSize: 11, py: 0.5, flex: 1, minWidth: 0 }}
            >
              Tal vez
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleRsvp('rechazada')}
              disabled={isRsvping}
              sx={{ fontSize: 11, py: 0.5, flex: 1, minWidth: 0 }}
            >
              Rechazar
            </Button>
          </Box>
        )}

        {/* Acción principal: Iniciar / Unirse */}
        {puedeIniciar && (
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<Monitor size={13} />}
            onClick={handleIniciar}
            sx={{ fontSize: 12, py: 0.75, borderRadius: 1.5 }}
          >
            Iniciar reunión
          </Button>
        )}
        {puedeUnirse && (
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="small"
            startIcon={<Monitor size={13} />}
            onClick={handleJoin}
            sx={{ fontSize: 12, py: 0.75, borderRadius: 1.5 }}
          >
            Unirse a la reunión
          </Button>
        )}
      </Box>
    </Box>
  )
})
