import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import TicketForm from '@/components/organisms/TicketForm';

interface NuevoTicketProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function NuevoTicket({ onSuccess, onCancel }: NuevoTicketProps) {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          cursor: 'pointer',
          mb: 2,
          display: 'block',
          '&:hover': { color: theme.palette.text.secondary },
        }}
        onClick={onCancel}
      >
        ← Volver a bandeja
      </Typography>

      <TicketForm onSuccess={onSuccess} onCancel={onCancel} />
    </Box>
  );
}

export default NuevoTicket;
