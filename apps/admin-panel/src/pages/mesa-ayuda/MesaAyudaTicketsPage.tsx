import { TicketsTable } from '@/components/organisms'
import { useMesaAyudaTickets } from '@/hooks/useMesaAyudaTickets'
import type { AdminTicket, AdminTicketListResponse } from '@/types/mesa-ayuda'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type {
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MesaAyudaTicketsPage() {
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading, error } = useMesaAyudaTickets({
    pagination,
    sorting,
    columnFilters,
    globalFilter,
  })

  if (error) {
    return (
      <Alert severity="error">
        Error al cargar tickets:{' '}
        {error instanceof Error ? error.message : 'Error desconocido'}
      </Alert>
    )
  }

  const response = data as AdminTicketListResponse | undefined
  const tickets: AdminTicket[] = response?.tickets ?? []
  const rowCount = response?.total ?? 0

  function handleRowClick(ticket: AdminTicket) {
    navigate(`/mesa-ayuda/tickets/${ticket.tenantSlug}/${ticket.id}`)
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Mesa de Ayuda — Todos los Tickets
      </Typography>

      <TicketsTable
        data={tickets}
        isLoading={isLoading}
        rowCount={rowCount}
        pagination={pagination}
        sorting={sorting}
        columnFilters={columnFilters}
        globalFilter={globalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onRowClick={handleRowClick}
      />
    </Box>
  )
}
