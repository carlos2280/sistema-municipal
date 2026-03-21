import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { type MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useMemo } from 'react'
import type { SlaTicketEnRiesgo, SlaTicketVencido } from '@/types/mesa-ayuda'

type SlaRiskType = 'vencidos' | 'enRiesgo'
type SlaTicket = SlaTicketVencido | SlaTicketEnRiesgo

interface SlaRiskTableProps {
  tickets: SlaTicket[]
  type: SlaRiskType
}

export function SlaRiskTable({ tickets, type }: SlaRiskTableProps) {
  const theme = useTheme()

  const columns = useMemo<MRT_ColumnDef<SlaTicket>[]>(
    () => [
      {
        accessorKey: 'numero',
        header: 'Número',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'tenantSlug',
        header: 'Municipalidad',
        size: 140,
      },
      {
        accessorKey: 'titulo',
        header: 'Título',
        size: 260,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 240 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'prioridadNombre',
        header: 'Prioridad',
        size: 110,
      },
      {
        accessorKey: 'fechaLimite',
        header: 'Fecha límite',
        size: 140,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>()
          return val ? (
            <Typography variant="body2">
              {format(parseISO(val), 'd MMM yyyy HH:mm', { locale: es })}
            </Typography>
          ) : null
        },
      },
      {
        header: type === 'vencidos' ? 'Horas vencido' : 'Horas restantes',
        size: 140,
        Cell: ({ row }) => {
          const ticket = row.original
          const horas = type === 'vencidos'
            ? (ticket as SlaTicketVencido).horasVencido
            : (ticket as SlaTicketEnRiesgo).horasRestantes
          return (
            <Chip
              label={`${horas}h`}
              size="small"
              color={type === 'vencidos' ? 'error' : 'warning'}
              sx={{ fontWeight: 700 }}
            />
          )
        },
      },
    ],
    [type, theme],
  )

  const table = useMaterialReactTable({
    columns,
    data: tickets,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableColumnVisibility: false,
    enableFullScreenToggle: false,
    muiTablePaperProps: { variant: 'outlined', elevation: 0 },
    initialState: { density: 'compact' },
    localization: {
      noRecordsToDisplay: 'Sin tickets',
      search: 'Buscar',
    },
  })

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  )
}
