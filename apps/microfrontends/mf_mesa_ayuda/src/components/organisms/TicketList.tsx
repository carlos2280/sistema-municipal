import TicketCard from '@/components/molecules/TicketCard'
import type { Ticket } from '@/types/mesa-ayuda.types'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'

interface TicketListProps {
  tickets: Ticket[]
  isLoading: boolean
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  onTicketClick: (ticketId: number) => void
}

function TicketList({
  tickets,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  onTicketClick,
}: TicketListProps) {
  const theme = useTheme()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={`skeleton-${i.toString()}`}
            variant="rounded"
            height={100}
          />
        ))}
      </Box>
    )
  }

  if (tickets.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Typography variant="body1" color="text.disabled">
          No se encontraron tickets
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={onTicketClick}
            />
          ))}
        </AnimatePresence>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.secondary,
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default TicketList
