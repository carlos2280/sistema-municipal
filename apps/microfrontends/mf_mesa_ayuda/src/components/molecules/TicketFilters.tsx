import type { TicketFilters as TicketFiltersType } from '@/types/mesa-ayuda.types'
import type { EstadoTicket } from '@/types/mesa-ayuda.types'
import { getEstadoLabel } from '@/utils/estadoTransiciones'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'
import { X } from 'lucide-react'
import { useGetCategoriasQuery, useGetPrioridadesQuery } from 'mf_store/store'
import { useCallback, useState } from 'react'

const ESTADOS: EstadoTicket[] = [
  'abierto',
  'en_progreso',
  'en_espera',
  'resuelto',
  'cerrado',
]

interface TicketFiltersProps {
  filters: TicketFiltersType
  onFilterChange: (filters: Partial<TicketFiltersType>) => void
  onClear: () => void
}

function TicketFilters({
  filters,
  onFilterChange,
  onClear,
}: TicketFiltersProps) {
  const theme = useTheme()
  const [searchText, setSearchText] = useState(filters.q ?? '')
  const { data: categorias } = useGetCategoriasQuery()
  const { data: prioridades } = useGetPrioridadesQuery()

  const handleEstadoChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      onFilterChange({ estado: e.target.value || undefined })
    },
    [onFilterChange],
  )

  const handleCategoriaChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const val = e.target.value
      onFilterChange({ categoriaId: val ? Number(val) : undefined })
    },
    [onFilterChange],
  )

  const handlePrioridadChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const val = e.target.value
      onFilterChange({ prioridadId: val ? Number(val) : undefined })
    },
    [onFilterChange],
  )

  const handleSearchSubmit = useCallback(() => {
    onFilterChange({ q: searchText || undefined })
  }, [onFilterChange, searchText])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearchSubmit()
      }
    },
    [handleSearchSubmit],
  )

  const hasActiveFilters =
    filters.estado || filters.categoriaId || filters.prioridadId || filters.q

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        p: 2,
        borderRadius: 2,
        background: alpha(theme.meridian.surfaces.ground, 0.92),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.meridian.borders.muted}`,
      }}
    >
      {/* Busqueda */}
      <TextField
        size="small"
        placeholder="Buscar tickets..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSearchSubmit}
        sx={{ minWidth: 200 }}
      />

      {/* Estado */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Estado</InputLabel>
        <Select
          value={filters.estado ?? ''}
          label="Estado"
          onChange={handleEstadoChange}
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS.map((est) => (
            <MenuItem key={est} value={est}>
              {getEstadoLabel(est)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Categoria */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Categoria</InputLabel>
        <Select
          value={filters.categoriaId?.toString() ?? ''}
          label="Categoria"
          onChange={handleCategoriaChange}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id.toString()}>
              {cat.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Prioridad */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Prioridad</InputLabel>
        <Select
          value={filters.prioridadId?.toString() ?? ''}
          label="Prioridad"
          onChange={handlePrioridadChange}
        >
          <MenuItem value="">Todas</MenuItem>
          {prioridades?.map((pri) => (
            <MenuItem key={pri.id} value={pri.id.toString()}>
              {pri.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Limpiar */}
      {hasActiveFilters && (
        <Button
          variant="text"
          size="small"
          startIcon={<X size={14} />}
          onClick={onClear}
          sx={{ color: theme.palette.text.secondary }}
        >
          Limpiar
        </Button>
      )}
    </Box>
  )
}

export default TicketFilters
