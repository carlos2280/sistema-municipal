import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import CategoriaManager from '@/components/organisms/CategoriaManager';

function GestionCategorias() {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
      >
        Gestion de Categorias
      </Typography>

      <CategoriaManager />
    </Box>
  );
}

export default GestionCategorias;
