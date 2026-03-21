import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material/Select';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import EstadoBadge from '@/components/atoms/EstadoBadge';
import PrioridadBadge from '@/components/atoms/PrioridadBadge';
import SlaIndicator from '@/components/atoms/SlaIndicator';
import CategoriaDot from '@/components/atoms/CategoriaDot';
import ComentarioItem from '@/components/molecules/ComentarioItem';
import ComentarioForm from '@/components/molecules/ComentarioForm';
import HistorialTimeline from '@/components/molecules/HistorialTimeline';
import AsignarFuncionarioSelect from '@/components/molecules/AsignarFuncionarioSelect';
import type { EstadoTicket, TicketDetalle as TicketDetalleType } from '@/types/mesa-ayuda.types';
import { getEstadoLabel, getTransicionesDisponibles } from '@/utils/estadoTransiciones';

interface TicketDetailProps {
  ticket: TicketDetalleType | null;
  isLoading: boolean;
  onCambiarEstado: (estado: EstadoTicket, motivo?: string) => void;
  isChangingEstado: boolean;
  onAsignar: (asignadoId: number, asignadoNombre: string) => void;
  isAssigning: boolean;
  onAgregarComentario: (contenido: string, esInterno: boolean) => void;
  isAddingComentario: boolean;
}

function TicketDetail({
  ticket,
  isLoading,
  onCambiarEstado,
  isChangingEstado,
  onAsignar,
  isAssigning,
  onAgregarComentario,
  isAddingComentario,
}: TicketDetailProps) {
  const theme = useTheme();
  const [selectedEstado, setSelectedEstado] = useState('');

  const handleEstadoChange = useCallback((e: SelectChangeEvent<string>) => {
    setSelectedEstado(e.target.value);
  }, []);

  const handleCambiarEstado = useCallback(() => {
    if (selectedEstado) {
      onCambiarEstado(selectedEstado as EstadoTicket);
      setSelectedEstado('');
    }
  }, [selectedEstado, onCambiarEstado]);

  if (isLoading || !ticket) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  const transicionesDisponibles = getTransicionesDisponibles(ticket.estado as EstadoTicket);
  const fecha = new Date(ticket.createdAt).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '2fr 1fr' }, gap: 3 }}>
        {/* Columna principal */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <Card
            sx={{
              background: alpha(theme.meridian.surfaces.ground, 0.92),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.meridian.borders.muted}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>
                  #{ticket.numero}
                </Typography>
                <EstadoBadge estado={ticket.estado as EstadoTicket} />
                {ticket.prioridadNombre && (
                  <PrioridadBadge
                    nombre={ticket.prioridadNombre}
                    color={ticket.prioridadColor}
                  />
                )}
                <SlaIndicator
                  fechaLimite={ticket.fechaLimite}
                  fechaResolucion={ticket.fechaResolucion}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
                {ticket.titulo}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.descripcion}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.disabled">Solicitante</Typography>
                  <Typography variant="body2">{ticket.solicitanteNombre}</Typography>
                </Box>
                {ticket.asignadoNombre && (
                  <Box>
                    <Typography variant="caption" color="text.disabled">Asignado a</Typography>
                    <Typography variant="body2">{ticket.asignadoNombre}</Typography>
                  </Box>
                )}
                {ticket.categoriaNombre && (
                  <Box>
                    <Typography variant="caption" color="text.disabled">Categoria</Typography>
                    <CategoriaDot nombre={ticket.categoriaNombre} color={ticket.categoriaColor} />
                  </Box>
                )}
                {ticket.departamento && (
                  <Box>
                    <Typography variant="caption" color="text.disabled">Departamento</Typography>
                    <Typography variant="body2">{ticket.departamento}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.disabled">Creado</Typography>
                  <Typography variant="body2">{fecha}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card
            sx={{
              background: alpha(theme.meridian.surfaces.ground, 0.92),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.meridian.borders.muted}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Comentarios ({ticket.comentarios.length})
              </Typography>

              {ticket.comentarios.map((comentario) => (
                <ComentarioItem key={comentario.id} comentario={comentario} />
              ))}

              <ComentarioForm
                onSubmit={onAgregarComentario}
                isSubmitting={isAddingComentario}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Columna lateral */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Cambiar estado */}
          {transicionesDisponibles.length > 0 && (
            <Card
              sx={{
                background: alpha(theme.meridian.surfaces.ground, 0.92),
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme.meridian.borders.muted}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Cambiar Estado
                </Typography>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel>Nuevo estado</InputLabel>
                  <Select
                    value={selectedEstado}
                    label="Nuevo estado"
                    onChange={handleEstadoChange}
                  >
                    {transicionesDisponibles.map((est) => (
                      <MenuItem key={est} value={est}>
                        {getEstadoLabel(est)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={handleCambiarEstado}
                  disabled={!selectedEstado || isChangingEstado}
                >
                  Cambiar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Asignar */}
          <Card
            sx={{
              background: alpha(theme.meridian.surfaces.ground, 0.92),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.meridian.borders.muted}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Asignacion
              </Typography>
              <AsignarFuncionarioSelect
                onAsignar={onAsignar}
                isAssigning={isAssigning}
                asignadoActual={ticket.asignadoNombre}
              />
            </CardContent>
          </Card>

          {/* Historial */}
          <Card
            sx={{
              background: alpha(theme.meridian.surfaces.ground, 0.92),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.meridian.borders.muted}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Historial
              </Typography>
              <HistorialTimeline historial={ticket.historial} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </motion.div>
  );
}

export default TicketDetail;
