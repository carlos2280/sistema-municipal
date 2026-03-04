import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMenu } from '../../hook/useMenu';
import RecursiveMenu from './RecursiveMenu';

interface Props {
  collapsed: boolean;
}
const MainMenu = ({ collapsed = false }: Props) => {
  const { menu, nombreSistema } = useMenu();

  if (!menu || menu.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {!menu ? 'No hay módulos activos' : 'Sin ítems de menú para este sistema'}
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
