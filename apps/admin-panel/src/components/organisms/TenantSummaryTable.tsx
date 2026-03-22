import { SlaProgressBar } from '@/components/molecules/SlaProgressBar'
import type { TenantResumen } from '@/types/mesa-ayuda'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import { useMemo } from 'react'

interface TenantSummaryTableProps {
  data: TenantResumen[]
  isLoading?: boolean
}

export function TenantSummaryTable({
  data,
  isLoading = false,
}: TenantSummaryTableProps) {
  const theme = useTheme()

  const columns = useMemo<MRT_ColumnDef<TenantResumen>[]>(
    () => [
      {
        accessorKey: 'tenantNombre',
        header: 'Municipalidad',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'tenantSlug',
        header: 'Slug',
        size: 130,
      },
      {
        accessorKey: 'totalTickets',
        header: 'Total',
        size: 90,
      },
      {
        accessorKey: 'abiertos',
        header: 'Abiertos',
        size: 90,
      },
      {
        accessorKey: 'vencidosSla',
        header: 'Vencidos SLA',
        size: 110,
        Cell: ({ cell }) => {
          const val = cell.getValue<number>()
          return (
            <Typography
              variant="body2"
              color={val > 0 ? 'error.main' : 'text.primary'}
              fontWeight={val > 0 ? 700 : 400}
            >
              {val}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'slaCompliance',
        header: 'SLA Compliance',
        size: 180,
        Cell: ({ cell }) => (
          <SlaProgressBar compliance={cell.getValue<number>()} />
        ),
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading },
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
    initialState: { density: 'compact' },
    localization: {
      noRecordsToDisplay: 'Sin datos',
      search: 'Buscar municipalidad',
    },
  })

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  )
}
