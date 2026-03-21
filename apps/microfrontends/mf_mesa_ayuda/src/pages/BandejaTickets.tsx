import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import TicketFilters from '@/components/molecules/TicketFilters';
import TicketStatsBar from '@/components/molecules/TicketStatsBar';
import TicketList from '@/components/organisms/TicketList';
import TicketForm from '@/components/organisms/TicketForm';
import { useTickets } from '@/hooks/useTickets';
import DetalleTicket from './DetalleTicket';

function BandejaTickets() {
  const theme = useTheme();
  const {
    tickets,
    totalPages,
    currentPage,
    isLoading,
    stats,
    statsLoading,
    filters,
    updateFilters,
    clearFilters,
    goToPage,
  } = useTickets();

  const [view, setView] = useState<'bandeja' | 'detalle' | 'nuevo'>('bandeja');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleTicketClick = useCallback((ticketId: number) => {
    setSelectedTicketId(ticketId);
    setView('detalle');
  }, []);

  const handleBack = useCallback(() => {
    setView('bandeja');
    setSelectedTicketId(null);
  }, []);

  const handleNuevo = useCallback(() => {
    setView('nuevo');
  }, []);

  const handleCreated = useCallback(() => {
    setView('bandeja');
  }, []);

  if (view === 'detalle' && selectedTicketId) {
    return <DetalleTicket ticketId={selectedTicketId} onBack={handleBack} />;
  }

  if (view === 'nuevo') {
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
          onClick={handleBack}
        >
          ← Volver a bandeja
        </Typography>
        <TicketForm onSuccess={handleCreated} onCancel={handleBack} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
        >
          Mesa de Ayuda
        </Typography>

        <TicketStatsBar stats={stats} isLoading={statsLoading} />

        <Box sx={{ mb: 2 }}>
          <TicketFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClear={clearFilters}
          />
        </Box>

        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={goToPage}
          onTicketClick={handleTicketClick}
        />

        <Fab
          color="primary"
          onClick={handleNuevo}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
          }}
        >
          <Plus size={24} />
        </Fab>
      </Box>
    </motion.div>
  );
}

export default BandejaTickets;
