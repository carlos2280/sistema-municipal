import { CategoriaFormDialog } from '@/components/molecules/CategoriaFormDialog'
import type { AdminCategoria, CreateCategoriaInput } from '@/types/mesa-ayuda'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import { useMemo, useState } from 'react'

interface CategoriasTableProps {
  data: AdminCategoria[]
  isLoading?: boolean
  onCreateSubmit: (data: CreateCategoriaInput) => void
  onEditSubmit: (id: number, data: CreateCategoriaInput) => void
  onDelete: (id: number) => void
  isMutating?: boolean
}

export function CategoriasTable({
  data,
  isLoading = false,
  onCreateSubmit,
  onEditSubmit,
  onDelete,
  isMutating = false,
}: CategoriasTableProps) {
  const theme = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminCategoria | null>(null)

  const columns = useMemo<MRT_ColumnDef<AdminCategoria>[]>(
    () => [
      {
        accessorKey: 'orden',
        header: '#',
        size: 60,
      },
      {
        accessorKey: 'codigo',
        header: 'Código',
        size: 130,
        Cell: ({ cell }) => (
          <Typography variant="mono">{cell.getValue<string>()}</Typography>
        ),
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        size: 180,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'color',
        header: 'Color',
        size: 110,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            color={cell.getValue<string>() as 'primary'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'activo',
        header: 'Estado',
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'}
            color={cell.getValue<boolean>() ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setEditTarget(row.original)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(row.original.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [onDelete],
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
    initialState: {
      density: 'compact',
      sorting: [{ id: 'orden', desc: false }],
    },
    renderTopToolbarCustomActions: () => (
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setCreateOpen(true)}
      >
        Nueva categoría
      </Button>
    ),
    localization: {
      noRecordsToDisplay: 'No hay categorías',
      search: 'Buscar',
    },
  })

  return (
    <Box>
      <MaterialReactTable table={table} />

      <CategoriaFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => {
          onCreateSubmit(data)
          setCreateOpen(false)
        }}
        isLoading={isMutating}
      />

      <CategoriaFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(data) => {
          if (editTarget) {
            onEditSubmit(editTarget.id, data)
            setEditTarget(null)
          }
        }}
        isLoading={isMutating}
        categoria={editTarget}
      />
    </Box>
  )
}
