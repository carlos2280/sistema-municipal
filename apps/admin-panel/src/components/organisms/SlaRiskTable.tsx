import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { type MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrioridadChip } from '@/components/atoms/PrioridadChip'
import { TenantBadge } from '@/components/atoms/TenantBadge'
import type { SlaTicketEnRiesgo, SlaTicketVencido } from '@/types/mesa-ayuda'

type SlaRiskType = 'vencidos' | 'enRiesgo'
type SlaTicket = SlaTicketVencido | SlaTicketEnRiesgo

interface SlaRiskTableProps {
  tickets: SlaTicket[]
  type: SlaRiskType
}

export function SlaRiskTable({ tickets, type }: SlaRiskTableProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  const columns = useMemo<MRT_ColumnDef<SlaTicket>[]>(
    () => [
      {
        accessorKey: 'numero',
        header: 'Número',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        id: 'municipalidad',
        header: 'Municipalidad',
        size: 160,
        Cell: ({ row }) => {
          const nombre = row.original.tenantNombre ?? row.original.tenantSlug
          return <TenantBadge nombre={nombre} />
        },
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
        id: 'prioridad',
        header: 'Prioridad',
        size: 120,
        Cell: ({ row }) => (
          <PrioridadChip
            nombre={row.original.prioridadNombre}
            color={row.original.prioridadColor ?? 'warning'}
          />
        ),
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
          const horas =
            type === 'vencidos'
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
    enableHiding: false,
    enableFullScreenToggle: false,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: '1px solid',
        borderColor: theme.meridian.borders.default,
        borderRadius: 2,
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => navigate(`/mesa-ayuda/tickets/${row.original.ticketId}`),
      sx: {
        cursor: 'pointer',
        backgroundColor:
          type === 'vencidos' ? alpha(theme.palette.error.main, 0.06) : undefined,
        '&:hover': {
          backgroundColor: alpha(theme.palette.error.main, 0.1),
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
        },
      },
    }),
    initialState: { density: 'compact' },
    localization: {
      noRecordsToDisplay: 'Sin tickets',
      search: 'Buscar',
    },
  })

  return <MaterialReactTable table={table} />
}
