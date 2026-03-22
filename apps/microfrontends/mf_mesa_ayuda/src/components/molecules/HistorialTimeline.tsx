import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { HistorialEstado } from '@/types/mesa-ayuda.types';
import type { EstadoTicket } from '@/types/mesa-ayuda.types';
import { getEstadoLabel } from '@/utils/estadoTransiciones';

interface HistorialTimelineProps {
  historial: HistorialEstado[];
}

function HistorialTimeline({ historial }: HistorialTimelineProps) {
  const theme = useTheme();

  if (historial.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
        Sin historial de cambios
      </Typography>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {/* Linea vertical */}
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          top: 4,
          bottom: 4,
          width: 2,
          backgroundColor: theme.meridian.borders.muted,
        }}
      />

      {historial.map((item) => {
        const fecha = new Date(item.createdAt).toLocaleString('es-CL', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Box key={item.id} sx={{ position: 'relative', mb: 2 }}>
            {/* Dot */}
            <Box
              sx={{
                position: 'absolute',
                left: -19,
                top: 6,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                border: `2px solid ${theme.meridian.surfaces.ground}`,
              }}
            />

            <Box>
              <Typography variant="body2" color="text.primary">
                {item.estadoAnterior
                  ? `${getEstadoLabel(item.estadoAnterior as EstadoTicket)} → ${getEstadoLabel(item.estadoNuevo as EstadoTicket)}`
                  : `Creado como ${getEstadoLabel(item.estadoNuevo as EstadoTicket)}`}
              </Typography>
              {item.motivo && (
                <Typography variant="caption" color="text.secondary">
                  {item.motivo}
                </Typography>
              )}
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                {fecha}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default HistorialTimeline;
