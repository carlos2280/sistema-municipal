import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import TicketFilters from '@/components/molecules/TicketFilters';
import TicketStatsBar from '@/components/molecules/TicketStatsBar';
import TicketList from '@/components/organisms/TicketList';
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

  const [view, setView] = useState<'bandeja' | 'detalle'>('bandeja');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleTicketClick = useCallback((ticketId: number) => {
    setSelectedTicketId(ticketId);
    setView('detalle');
  }, []);

  const handleBack = useCallback(() => {
    setView('bandeja');
    setSelectedTicketId(null);
  }, []);

  if (view === 'detalle' && selectedTicketId) {
    return <DetalleTicket ticketId={selectedTicketId} onBack={handleBack} />;
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

      </Box>
    </motion.div>
  );
}

export default BandejaTickets;
