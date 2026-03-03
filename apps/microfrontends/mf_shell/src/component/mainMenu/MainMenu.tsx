import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMenu } from '../../hook/useMenu';
import RecursiveMenu from './RecursiveMenu';

interface Props {
  collapsed: boolean;
}
const MainMenu = ({ collapsed = false }: Props) => {
  const { menu, nombreSistema } = useMenu();

  if (!menu) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No hay módulos activos
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <RecursiveMenu
        items={menu}
        nombreSistema={nombreSistema}
        collapsed={!collapsed}
      />
    </div>
  );
};

export default MainMenu;
