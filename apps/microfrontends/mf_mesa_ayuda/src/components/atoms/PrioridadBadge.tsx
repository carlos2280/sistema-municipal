import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

interface PrioridadBadgeProps {
  nombre: string;
  color: string | null;
  size?: 'small' | 'medium';
}

function PrioridadBadge({ nombre, color, size = 'small' }: PrioridadBadgeProps) {
  const theme = useTheme();

  return (
    <Chip
      label={nombre}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 600,
        borderColor: color ?? theme.palette.divider,
        color: color ?? theme.palette.text.secondary,
      }}
    />
  );
}

export default PrioridadBadge;
