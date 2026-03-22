import Box from '@mui/material/Box';
import BandejaTickets from '../pages/BandejaTickets';

function AppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2 }}>
      <BandejaTickets />
    </Box>
  );
}

export default AppLayout;
