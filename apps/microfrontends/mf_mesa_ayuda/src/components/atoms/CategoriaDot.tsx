import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface CategoriaDotProps {
  nombre: string;
  color: string | null;
}

function CategoriaDot({ nombre, color }: CategoriaDotProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color ?? theme.palette.primary.main,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {nombre}
      </Typography>
    </Box>
  );
}

export default CategoriaDot;
