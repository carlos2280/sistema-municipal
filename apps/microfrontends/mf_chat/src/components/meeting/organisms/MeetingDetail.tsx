import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mic,
  Monitor,
  Users,
  Video,
  X,
} from 'lucide-react'
import {
  type EstadoInvitacion,
  type TipoReunion,
  useCancelarReunionMutation,
  useObtenerConversacionQuery,
  useObtenerReunionQuery,
  useRsvpReunionMutation,
} from 'mf_store/store'
import { UserAvatar } from 'mf_ui/components'
import { memo, useCallback, useState } from 'react'

interface MeetingDetailProps {
  reunionId: number
  currentUserId?: number
  onBack: () => void
  onClose?: () => void
  onIniciar?: (reunionId: number) => void
  onJoin?: (llamadaId: number) => void
}

const TIPO_ICON: Record<TipoReunion, React.ReactNode> = {
  video: <Video size={16} />,
  voz: <Mic size={16} />,
  presencial: <MapPin size={16} />,
}

const RSVP_COLOR: Record<
  EstadoInvitacion,
  'default' | 'success' | 'error' | 'warning'
> = {
  pendiente: 'default',
  aceptada: 'success',
  rechazada: 'error',
  tentativa: 'warning',
}

const RSVP_LABEL: Record<EstadoInvitacion, string> = {
  aceptada: 'Aceptó',
  rechazada: 'Rechazó',
  tentativa: 'Tal vez',
  pendiente: 'Sin responder',
}

const ESTADO_ORDER: EstadoInvitacion[] = [
  'aceptada',
  'tentativa',
  'pendiente',
  'rechazada',
]

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const MeetingDetail = memo(function MeetingDetail({
  reunionId,
  currentUserId,
  onBack,
  onClose,
  onIniciar,
  onJoin,
}: MeetingDetailProps) {
  const theme = useTheme()
  const { data: reunion, isLoading } = useObtenerReunionQuery(reunionId)
  const [rsvpMutation, { isLoading: isRsvping }] = useRsvpReunionMutation()
  const [cancelarMutation, { isLoading: isCancelling }] =
    useCancelarReunionMutation()
  const [editandoRsvp, setEditandoRsvp] = useState(false)

  const { data: conversacion } = useObtenerConversacionQuery(
    reunion?.conversacionId ?? 0,
    {
      skip: !reunion?.conversacionId,
    },
  )

  const participantesMap: Record<number, string> = {}
  for (const p of conversacion?.participantes ?? []) {
    if (p.usuario?.nombreCompleto) {
      participantesMap[p.usuarioId] = p.usuario.nombreCompleto
    }
  }

  const esOrganizador = reunion?.organizadorId === currentUserId
  const miInvitacion = reunion?.invitaciones.find(
    (i) => i.usuarioId === currentUserId,
  )

  /** Mapeo RSVP → color semántico del theme */
  const getRsvpDotColor = useCallback(
    (estado: EstadoInvitacion): string => {
      const map: Record<EstadoInvitacion, string> = {
        aceptada: theme.palette.success.main,
        rechazada: theme.palette.error.main,
        tentativa: theme.palette.warning.main,
        pendiente: theme.palette.text.disabled,
      }
      return map[estado]
    },
    [theme],
  )

  const handleRsvp = useCallback(
    async (estado: EstadoInvitacion) => {
      await rsvpMutation({ id: reunionId, estado }).unwrap()
      setEditandoRsvp(false)
    },
    [rsvpMutation, reunionId],
  )

  const handleCancelar = useCallback(async () => {
    await cancelarMutation(reunionId).unwrap()
    onBack()
  }, [cancelarMutation, reunionId, onBack])

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Cargando...</Typography>
      </Box>
    )
  }

  if (!reunion) return null

  const puedeIniciar =
    esOrganizador &&
    reunion.estado === 'programada' &&
    reunion.tipo !== 'presencial'

  const puedeUnirse = reunion.estado === 'activa' && !!reunion.llamadaId
  const inactiva =
    reunion.estado === 'cancelada' || reunion.estado === 'completada'

  const invitacionesOrdenadas = [...reunion.invitaciones].sort((a, b) => {
    if (a.usuarioId === reunion.organizadorId) return -1
    if (b.usuarioId === reunion.organizadorId) return 1
    return ESTADO_ORDER.indexOf(a.estado) - ESTADO_ORDER.indexOf(b.estado)
  })

  const mostrarBotonesRsvp =
    !inactiva &&
    !esOrganizador &&
    (miInvitacion?.estado === 'pendiente' || editandoRsvp)

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
        <IconButton size="small" onClick={onBack} sx={{ mr: 1 }}>
          <ArrowLeft size={18} />
        </IconButton>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            fontFamily: '"Bricolage Grotesque", sans-serif',
            flex: 1,
          }}
        >
          Detalle de reunión
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Título + estado */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '17px',
                fontFamily: '"Bricolage Grotesque", sans-serif',
                lineHeight: 1.3,
              }}
            >
              {reunion.titulo}
            </Typography>
          </Box>
          <Chip
            label={reunion.estado}
            size="small"
            color={
              reunion.estado === 'programada'
                ? 'primary'
                : reunion.estado === 'activa'
                  ? 'success'
                  : reunion.estado === 'cancelada'
                    ? 'error'
                    : 'default'
            }
          />
        </Box>

        {/* Descripción */}
        {reunion.descripcion && (
          <Typography
            sx={{
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              color: 'text.secondary',
              mb: 2,
            }}
          >
            {reunion.descripcion}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={16} />
            <Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                }}
              >
                {formatFecha(reunion.fechaInicio)}
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontFeatureSettings: "'tnum' 1",
                  color: 'text.secondary',
                }}
              >
                {formatHora(reunion.fechaInicio)} –{' '}
                {formatHora(reunion.fechaFin)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {TIPO_ICON[reunion.tipo]}
            <Typography
              sx={{
                fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {reunion.tipo === 'video'
                ? 'Videollamada'
                : reunion.tipo === 'voz'
                  ? 'Llamada de voz'
                  : 'Presencial'}
            </Typography>
          </Box>

          {reunion.ubicacion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={16} />
              <Typography
                sx={{
                  fontSize: '13px',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {reunion.ubicacion}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Participantes */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Users size={15} />
            <Typography
              sx={{
                fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
              }}
            >
              Participantes
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                fontFamily: '"Space Grotesk", sans-serif',
                fontFeatureSettings: "'tnum' 1",
                color: 'text.secondary',
              }}
            >
              ({reunion.invitaciones.length})
            </Typography>
          </Box>

          {invitacionesOrdenadas.map((inv) => {
            const nombre =
              inv.nombreUsuario ??
              participantesMap[inv.usuarioId] ??
              `Usuario ${inv.usuarioId}`
            const esMiFila = inv.usuarioId === currentUserId
            const esOrg = inv.usuarioId === reunion.organizadorId

            return (
              <Box
                key={inv.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 0.75,
                  px: esMiFila ? 1 : 0,
                  borderRadius: esMiFila ? 1 : 0,
                  bgcolor: esMiFila
                    ? theme.meridian.surfaces.s3
                    : 'transparent',
                  mb: 0.25,
                }}
              >
                {/* Avatar — reutiliza UserAvatar de mf_ui */}
                <UserAvatar
                  name={nombre}
                  size="xs"
                  color={esOrg ? theme.palette.primary.main : undefined}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: esMiFila ? 600 : 400,
                    }}
                    noWrap
                  >
                    {nombre}
                    {esOrg && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '11px',
                          fontFamily: '"DM Sans", sans-serif',
                          color: 'text.secondary',
                          ml: 0.5,
                        }}
                      >
                        (organizador)
                      </Typography>
                    )}
                  </Typography>
                </Box>

                {/* Estado RSVP con punto de color semántico */}
                {!esOrg && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: getRsvpDotColor(inv.estado),
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '11px',
                        fontFamily: '"DM Sans", sans-serif',
                        color: 'text.secondary',
                      }}
                    >
                      {RSVP_LABEL[inv.estado]}
                    </Typography>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>

        {/* Mi respuesta actual + Cambiar */}
        {!esOrganizador &&
          miInvitacion &&
          !editandoRsvp &&
          miInvitacion.estado !== 'pendiente' &&
          !inactiva && (
            <Box
              sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Chip
                label={RSVP_LABEL[miInvitacion.estado]}
                size="small"
                color={RSVP_COLOR[miInvitacion.estado]}
              />
              <Button
                size="small"
                onClick={() => setEditandoRsvp(true)}
                sx={{ fontSize: 12 }}
              >
                Cambiar mi respuesta
              </Button>
            </Box>
          )}

        {/* Botones RSVP */}
        {mostrarBotonesRsvp && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleRsvp('aceptada')}
              disabled={isRsvping}
            >
              Aceptar
            </Button>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleRsvp('tentativa')}
              disabled={isRsvping}
            >
              Tal vez
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleRsvp('rechazada')}
              disabled={isRsvping}
            >
              Rechazar
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer actions */}
      {reunion.estado !== 'cancelada' && reunion.estado !== 'completada' && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.meridian.borders.default}`,
            display: 'flex',
            gap: 1,
          }}
        >
          {esOrganizador && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCancelar}
              disabled={isCancelling}
            >
              Cancelar reunión
            </Button>
          )}
          {puedeIniciar && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Monitor size={14} />}
              onClick={() => onIniciar?.(reunionId)}
              sx={{ ml: 'auto' }}
            >
              Iniciar
            </Button>
          )}
          {puedeUnirse && reunion.llamadaId && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<Monitor size={14} />}
              // biome-ignore lint/style/noNonNullAssertion: button solo se muestra cuando llamadaId existe
              onClick={() => onJoin?.(reunion.llamadaId!)}
              sx={{ ml: 'auto' }}
            >
              Unirse
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
})
