import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Clock, AlertTriangle } from 'lucide-react';

interface SlaIndicatorProps {
  fechaLimite: string | null;
  fechaResolucion: string | null;
}

function SlaIndicator({ fechaLimite, fechaResolucion }: SlaIndicatorProps) {
  const theme = useTheme();

  if (!fechaLimite) {
    return null;
  }

  const limite = new Date(fechaLimite);
  const ahora = fechaResolucion ? new Date(fechaResolucion) : new Date();
  const diffMs = limite.getTime() - ahora.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const vencido = diffMs < 0;

  const label = vencido
    ? 'Vencido'
    : diffHours < 1
      ? 'Menos de 1h'
      : `${diffHours}h restantes`;

  const color = vencido
    ? theme.palette.error.main
    : diffHours <= 4
      ? theme.palette.warning.main
      : theme.palette.success.main;

  const IconComponent = vencido ? AlertTriangle : Clock;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconComponent size={14} color={color} />
      <Typography
        variant="caption"
        sx={{ color, fontWeight: 600 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default SlaIndicator;
