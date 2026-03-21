import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import TicketDetail from '@/components/organisms/TicketDetail';
import { useTicketDetalle } from '@/hooks/useTicketDetalle';
import { useState } from 'react';

/**
 * Pagina standalone de detalle de ticket.
 * Usada cuando el shell la monta como ruta independiente.
 * El ticketId se toma de un prompt simple (en MVP).
 */
function DetalleTicketPage() {
  const theme = useTheme();
  const [ticketId, setTicketId] = useState<number>(0);
  const [inputValue, setInputValue] = useState('');

  const {
    ticket,
    isLoading,
    cambiarEstado,
    isChangingEstado,
    asignar,
    isAssigning,
    agregarComentario,
    isAddingComentario,
  } = useTicketDetalle(ticketId);

  if (!ticketId) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
          Buscar Ticket
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="ID del ticket"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${theme.meridian.borders.muted}`,
              background: 'transparent',
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
            }}
          />
          <button
            type="button"
            onClick={() => {
              const id = Number(inputValue);
              if (id > 0) setTicketId(id);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Buscar
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          cursor: 'pointer',
          mb: 2,
          display: 'block',
          '&:hover': { color: theme.palette.text.secondary },
        }}
        onClick={() => setTicketId(0)}
      >
        ← Buscar otro ticket
      </Typography>

      <TicketDetail
        ticket={ticket}
        isLoading={isLoading}
        onCambiarEstado={cambiarEstado}
        isChangingEstado={isChangingEstado}
        onAsignar={asignar}
        isAssigning={isAssigning}
        onAgregarComentario={agregarComentario}
        isAddingComentario={isAddingComentario}
      />
    </Box>
  );
}

export default DetalleTicketPage;
