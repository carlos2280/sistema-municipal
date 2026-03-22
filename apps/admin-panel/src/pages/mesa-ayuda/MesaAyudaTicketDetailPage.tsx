import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SuccessSnackbar } from '@/components/shared/SuccessSnackbar'
import {
  AsignarDialog,
  CambiarCategoriaDialog,
  CambiarEstadoDialog,
  CambiarPrioridadDialog,
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
import { TicketComentariosCard } from './components/TicketComentariosCard'
import { TicketHeader } from './components/TicketHeader'
import { TicketInfoCard } from './components/TicketInfoCard'
import { TicketTimelineCard } from './components/TicketTimelineCard'

export default function MesaAyudaTicketDetailPage() {
  const { tenantSlug = '', ticketId = '0' } = useParams()
  const navigate = useNavigate()
  const id = Number(ticketId)

  const [estadoOpen, setEstadoOpen] = useState(false)
  const [asignarOpen, setAsignarOpen] = useState(false)
  const [prioridadOpen, setPrioridadOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: ticket, isLoading, error } = useMesaAyudaTicketDetail(tenantSlug, id)
  const { data: categorias = [] } = useMesaAyudaCategorias()
  const { data: prioridades = [] } = useMesaAyudaPrioridades()

  const cambiarEstado = useCambiarEstado()
  const asignarTicket = useAsignarTicket()
  const cambiarPrioridad = useCambiarPrioridad()
  const cambiarCategoria = useCambiarCategoria()
  const agregarComentario = useAgregarComentario()

  const isMutating = cambiarEstado.isPending || asignarTicket.isPending || cambiarPrioridad.isPending || cambiarCategoria.isPending || agregarComentario.isPending

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">Error al cargar ticket: {error.message}</Alert>
  if (!ticket) return null

  const onSuccess = (msg: string) => setSuccessMsg(msg)

  function handleCambiarEstado(data: CambiarEstadoInput) {
    cambiarEstado.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => { setEstadoOpen(false); onSuccess('Estado actualizado') } })
  }
  function handleAsignar(data: AsignarTicketInput) {
    asignarTicket.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => { setAsignarOpen(false); onSuccess('Ticket asignado') } })
  }
  function handleCambiarPrioridad(data: CambiarPrioridadInput) {
    cambiarPrioridad.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => { setPrioridadOpen(false); onSuccess('Prioridad actualizada') } })
  }
  function handleCambiarCategoria(data: CambiarCategoriaInput) {
    cambiarCategoria.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => { setCategoriaOpen(false); onSuccess('Categoría actualizada') } })
  }
  function handleAgregarComentario(data: AgregarComentarioInput) {
    agregarComentario.mutate({ tenantSlug, ticketId: id, data }, { onSuccess: () => onSuccess('Comentario agregado') })
  }

  const prioridadActual = prioridades.find((p) => p.codigo === ticket.prioridadCodigo)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/mesa-ayuda/tickets')} size="small"><ArrowBackIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/mesa-ayuda')}>Mesa de Ayuda</Link>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/mesa-ayuda/tickets')}>Tickets</Link>
          <Typography color="text.secondary">{ticket.tenantNombre}</Typography>
          <Typography color="text.primary" fontWeight={600}>{ticket.numero}</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TicketHeader ticket={ticket} isMutating={isMutating} onCambiarEstado={() => setEstadoOpen(true)} onAsignar={() => setAsignarOpen(true)} onCambiarPrioridad={() => setPrioridadOpen(true)} onCambiarCategoria={() => setCategoriaOpen(true)} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Descripción</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.descripcion}</Typography>
          </Box>
          <TicketComentariosCard comentarios={ticket.comentarios} isLoading={agregarComentario.isPending} onSubmit={handleAgregarComentario} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TicketInfoCard ticket={ticket} />
          <TicketTimelineCard historial={ticket.historial} />
        </Grid>
      </Grid>

      <CambiarEstadoDialog open={estadoOpen} onClose={() => setEstadoOpen(false)} estadoActual={ticket.estado} onSubmit={handleCambiarEstado} isLoading={cambiarEstado.isPending} />
      <AsignarDialog open={asignarOpen} onClose={() => setAsignarOpen(false)} onSubmit={handleAsignar} isLoading={asignarTicket.isPending} asignadoActual={ticket.asignado} />
      <CambiarPrioridadDialog open={prioridadOpen} onClose={() => setPrioridadOpen(false)} onSubmit={handleCambiarPrioridad} isLoading={cambiarPrioridad.isPending} prioridades={prioridades} prioridadActualId={prioridadActual?.id} />
      <CambiarCategoriaDialog open={categoriaOpen} onClose={() => setCategoriaOpen(false)} onSubmit={handleCambiarCategoria} isLoading={cambiarCategoria.isPending} categorias={categorias} categoriaActualId={ticket.categoriaId} />
      <SuccessSnackbar open={!!successMsg} message={successMsg} onClose={() => setSuccessMsg('')} />
    </Box>
  )
}
