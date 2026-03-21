import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EstadoChip, PrioridadChip, SlaIndicator, TenantBadge } from '@/components/atoms'
import {
  AsignarDialog,
  CambiarCategoriaDialog,
  CambiarEstadoDialog,
  CambiarPrioridadDialog,
  ComentarioForm,
  ComentarioItem,
  TicketTimelineItem,
} from '@/components/molecules'
import {
  useAgregarComentario,
  useAsignarTicket,
  useCambiarCategoria,
  useCambiarEstado,
  useCambiarPrioridad,
} from '@/hooks/useMesaAyudaTicketActions'
import { useMesaAyudaCategorias } from '@/hooks/useMesaAyudaCategorias'
import { useMesaAyudaPrioridades } from '@/hooks/useMesaAyudaPrioridades'
import { useMesaAyudaTicketDetail } from '@/hooks/useMesaAyudaTicketDetail'
import type {
  AgregarComentarioInput,
  AsignarTicketInput,
  CambiarCategoriaInput,
  CambiarEstadoInput,
  CambiarPrioridadInput,
} from '@/types/mesa-ayuda'

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', py: 0.75 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: 140, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  )
}

function formatDateTime(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
}

export default function MesaAyudaTicketDetailPage() {
  const { tenantSlug = '', ticketId = '0' } = useParams()
  const navigate = useNavigate()
  const id = Number(ticketId)

  const [estadoOpen, setEstadoOpen] = useState(false)
  const [asignarOpen, setAsignarOpen] = useState(false)
  const [prioridadOpen, setPrioridadOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const { data: ticket, isLoading, error } = useMesaAyudaTicketDetail(tenantSlug, id)
  const { data: categorias = [] } = useMesaAyudaCategorias()
  const { data: prioridades = [] } = useMesaAyudaPrioridades()

  const cambiarEstado = useCambiarEstado()
  const asignarTicket = useAsignarTicket()
  const cambiarPrioridad = useCambiarPrioridad()
  const cambiarCategoria = useCambiarCategoria()
  const agregarComentario = useAgregarComentario()

  const isMutating =
    cambiarEstado.isPending ||
    asignarTicket.isPending ||
    cambiarPrioridad.isPending ||
    cambiarCategoria.isPending ||
    agregarComentario.isPending

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Error al cargar ticket: {error.message}</Alert>
  }

  if (!ticket) return null

  function handleCambiarEstado(data: CambiarEstadoInput) {
    cambiarEstado.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => setEstadoOpen(false) })
  }

  function handleAsignar(data: AsignarTicketInput) {
    asignarTicket.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => setAsignarOpen(false) })
  }

  function handleCambiarPrioridad(data: CambiarPrioridadInput) {
    cambiarPrioridad.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => setPrioridadOpen(false) })
  }

  function handleCambiarCategoria(data: CambiarCategoriaInput) {
    cambiarCategoria.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => setCategoriaOpen(false) })
  }

  function handleAgregarComentario(data: AgregarComentarioInput) {
    agregarComentario.mutate({ tenantSlug, ticketId: id, data })
  }

  const prioridadActual = prioridades.find((p) => p.codigo === ticket.prioridadCodigo)

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/mesa-ayuda/tickets')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/mesa-ayuda')}
          >
            Mesa de Ayuda
          </Link>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/mesa-ayuda/tickets')}
          >
            Tickets
          </Link>
          <Typography color="text.secondary">{ticket.tenantNombre}</Typography>
          <Typography color="text.primary" fontWeight={600}>
            {ticket.numero}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Card header con acciones */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    {ticket.numero} — {ticket.titulo}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <EstadoChip estado={ticket.estado} />
                    <PrioridadChip
                      codigo={ticket.prioridadCodigo}
                      nombre={ticket.prioridadNombre}
                      color={ticket.prioridadColor}
                    />
                    <SlaIndicator
                      fechaLimite={ticket.fechaLimite ?? null}
                      estado={ticket.estado}
                    />
                    <TenantBadge nombre={ticket.tenantNombre} slug={ticket.tenantSlug} />
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Toolbar de acciones */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEstadoOpen(true)}
                  disabled={isMutating || ticket.estado === 'cerrado'}
                >
                  Cambiar Estado
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAsignarOpen(true)}
                  disabled={isMutating}
                >
                  Asignar
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  disabled={isMutating}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={!!menuAnchor}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null)
                      setPrioridadOpen(true)
                    }}
                  >
                    Cambiar Prioridad
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null)
                      setCategoriaOpen(true)
                    }}
                  >
                    Cambiar Categoría
                  </MenuItem>
                </Menu>
              </Stack>
            </CardContent>
          </Card>

          {/* Card descripción */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Descripción
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.descripcion}
              </Typography>
            </CardContent>
          </Card>

          {/* Card comentarios */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Comentarios ({ticket.comentarios.length})
              </Typography>
              {ticket.comentarios.map((comentario) => (
                <ComentarioItem key={comentario.id} comentario={comentario} />
              ))}
              {ticket.comentarios.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No hay comentarios aún
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <ComentarioForm
                onSubmit={handleAgregarComentario}
                isLoading={agregarComentario.isPending}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Información
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <InfoRow label="Categoría" value={ticket.categoriaNombre} />
              <InfoRow label="Prioridad" value={ticket.prioridadNombre} />
              <InfoRow label="Solicitante" value={ticket.solicitante} />
              <InfoRow label="Email" value={ticket.emailSolicitante} />
              <InfoRow
                label="Asignado"
                value={ticket.asignado ?? 'Sin asignar'}
              />
              <InfoRow
                label="Fecha límite SLA"
                value={ticket.fechaLimite ? formatDateTime(ticket.fechaLimite) : 'Sin SLA'}
              />
              <InfoRow
                label="Fecha resolución"
                value={ticket.fechaResolucion ? formatDateTime(ticket.fechaResolucion) : '—'}
              />
              <InfoRow label="Creado" value={formatDateTime(ticket.createdAt)} />
              <InfoRow label="Actualizado" value={formatDateTime(ticket.updatedAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Historial de Estados
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {ticket.historial.map((item, index) => (
                <TicketTimelineItem
                  key={item.id}
                  historial={item}
                  isLast={index === ticket.historial.length - 1}
                />
              ))}
              {ticket.historial.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Sin historial
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <CambiarEstadoDialog
        open={estadoOpen}
        onClose={() => setEstadoOpen(false)}
        estadoActual={ticket.estado}
        onSubmit={handleCambiarEstado}
        isLoading={cambiarEstado.isPending}
      />

      <AsignarDialog
        open={asignarOpen}
        onClose={() => setAsignarOpen(false)}
        onSubmit={handleAsignar}
        isLoading={asignarTicket.isPending}
        asignadoActual={ticket.asignado}
      />

      <CambiarPrioridadDialog
        open={prioridadOpen}
        onClose={() => setPrioridadOpen(false)}
        onSubmit={handleCambiarPrioridad}
        isLoading={cambiarPrioridad.isPending}
        prioridades={prioridades}
        prioridadActualId={prioridadActual?.id}
      />

      <CambiarCategoriaDialog
        open={categoriaOpen}
        onClose={() => setCategoriaOpen(false)}
        onSubmit={handleCambiarCategoria}
        isLoading={cambiarCategoria.isPending}
        categorias={categorias}
        categoriaActualId={ticket.categoriaId}
      />
    </Box>
  )
}
