import Chip from '@mui/material/Chip';
import type { EstadoTicket } from '@/types/mesa-ayuda.types';
import { getEstadoColor, getEstadoLabel } from '@/utils/estadoTransiciones';

interface EstadoBadgeProps {
  estado: EstadoTicket;
  size?: 'small' | 'medium';
}

function EstadoBadge({ estado, size = 'small' }: EstadoBadgeProps) {
  return (
    <Chip
      label={getEstadoLabel(estado)}
      color={getEstadoColor(estado)}
      size={size}
      variant="filled"
      sx={{ fontWeight: 600, letterSpacing: '0.02em' }}
    />
  );
}

export default EstadoBadge;
