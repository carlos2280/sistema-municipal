import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import EstadoBadge from '@/components/atoms/EstadoBadge';
import PrioridadBadge from '@/components/atoms/PrioridadBadge';
import SlaIndicator from '@/components/atoms/SlaIndicator';
import CategoriaDot from '@/components/atoms/CategoriaDot';
import type { EstadoTicket, Ticket } from '@/types/mesa-ayuda.types';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticketId: number) => void;
}

function TicketCard({ ticket, onClick }: TicketCardProps) {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: alpha(theme.meridian.surfaces.ground, 0.92),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${theme.meridian.borders.muted}`,
          borderRadius: 2,
          '&:hover': {
            borderColor: theme.meridian.borders.strong,
            boxShadow: theme.meridian.shadows.md,
          },
          transition: 'all 0.2s ease',
        }}
      >
        <CardActionArea onClick={() => onClick(ticket.id)}>
          <CardContent sx={{ p: 2 }}>
            {/* Header: numero + badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.disabled, fontWeight: 700 }}
              >
                #{ticket.numero}
              </Typography>
              <EstadoBadge estado={ticket.estado as EstadoTicket} />
              {ticket.prioridadNombre && (
                <PrioridadBadge
                  nombre={ticket.prioridadNombre}
                  color={ticket.prioridadColor}
                />
              )}
            </Box>

            {/* Titulo */}
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ticket.titulo}
            </Typography>

            {/* Footer: categoria, SLA, solicitante, asignado */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {ticket.categoriaNombre && (
                  <CategoriaDot
                    nombre={ticket.categoriaNombre}
                    color={ticket.categoriaColor}
                  />
                )}
                <SlaIndicator
                  fechaLimite={ticket.fechaLimite}
                  fechaResolucion={ticket.fechaResolucion}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {ticket.solicitanteNombre}
                </Typography>
                {ticket.asignadoNombre && (
                  <Typography variant="caption" color="text.disabled">
                    → {ticket.asignadoNombre}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

export default TicketCard;
