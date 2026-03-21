import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import { useMemo } from 'react'
import { EstadoChip } from '@/components/atoms/EstadoChip'
import { PrioridadChip } from '@/components/atoms/PrioridadChip'
import { SlaIndicator } from '@/components/atoms/SlaIndicator'
import { TenantBadge } from '@/components/atoms/TenantBadge'
import type { AdminTicket } from '@/types/mesa-ayuda'

interface TicketsTableProps {
  data: AdminTicket[]
  isLoading: boolean
  rowCount: number
  pagination: MRT_PaginationState
  sorting: MRT_SortingState
  columnFilters: MRT_ColumnFiltersState
  globalFilter: string
  onPaginationChange: (updater: MRT_PaginationState | ((prev: MRT_PaginationState) => MRT_PaginationState)) => void
  onSortingChange: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  onColumnFiltersChange: (updater: MRT_ColumnFiltersState | ((prev: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)) => void
  onGlobalFilterChange: (value: string) => void
  onRowClick?: (ticket: AdminTicket) => void
}

export function TicketsTable({
  data,
  isLoading,
  rowCount,
  pagination,
  sorting,
  columnFilters,
  globalFilter,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onRowClick,
}: TicketsTableProps) {
  const columns = useMemo<MRT_ColumnDef<AdminTicket>[]>(
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
        accessorKey: 'tenantNombre',
        header: 'Municipalidad',
        size: 160,
        Cell: ({ row }) => (
          <TenantBadge nombre={row.original.tenantNombre} slug={row.original.tenantSlug} />
        ),
      },
      {
        accessorKey: 'titulo',
        header: 'Título',
        size: 280,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 130,
        Cell: ({ row }) => <EstadoChip estado={row.original.estado} />,
      },
      {
        accessorKey: 'prioridadNombre',
        header: 'Prioridad',
        size: 120,
        Cell: ({ row }) => (
          <PrioridadChip
            codigo={row.original.prioridadCodigo}
            nombre={row.original.prioridadNombre}
            color={row.original.prioridadColor}
          />
        ),
      },
      {
        accessorKey: 'categoriaNombre',
        header: 'Categoría',
        size: 130,
      },
      {
        accessorKey: 'solicitante',
        header: 'Solicitante',
        size: 150,
      },
      {
        accessorKey: 'asignado',
        header: 'Asignado',
        size: 140,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? <Typography variant="body2" color="text.disabled">—</Typography>,
      },
      {
        accessorKey: 'fechaLimite',
        header: 'SLA',
        size: 160,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <SlaIndicator
            fechaLimite={row.original.fechaLimite}
            estado={row.original.estado}
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Creado',
        size: 120,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>()
          return val ? (
            <Typography variant="body2">
              {format(parseISO(val), 'd MMM yyyy', { locale: es })}
            </Typography>
          ) : null
        },
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      isLoading,
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enableDensityToggle: true,
    enableHiding: true,
    enableFullScreenToggle: false,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      sx: { cursor: onRowClick ? 'pointer' : 'default' },
    }),
    muiTablePaperProps: { variant: 'outlined', elevation: 0 },
    initialState: { density: 'compact' },
    localization: {
      actions: 'Acciones',
      noRecordsToDisplay: 'No se encontraron tickets',
      rowsPerPage: 'Filas por página',
      search: 'Buscar',
      showHideColumns: 'Columnas',
      filterByColumn: 'Filtrar por {column}',
    },
  })

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  )
}
