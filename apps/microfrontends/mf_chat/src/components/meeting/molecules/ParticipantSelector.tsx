import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLazyBuscarUsuariosQuery } from 'mf_store/store'

export interface SelectedParticipant {
  id: number
  nombre: string
}

export interface GrupoOption {
  id: number
  nombre: string
  miembros: SelectedParticipant[]
}

type AutocompleteOption =
  | { kind: 'usuario'; id: number; nombre: string }
  | { kind: 'grupo'; id: number; nombre: string; miembros: SelectedParticipant[] }

interface ParticipantSelectorProps {
  organizadorId: number
  organizadorNombre?: string
  value: SelectedParticipant[]
  onChange: (participants: SelectedParticipant[]) => void
  grupos?: GrupoOption[]
}

export function ParticipantSelector({
  organizadorId,
  organizadorNombre = 'Tú (organizador)',
  value,
  onChange,
  grupos = [],
}: ParticipantSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [buscar, { data: usuariosBuscados = [], isFetching }] = useLazyBuscarUsuariosQuery()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (inputValue.length < 2) return
    debounceRef.current = setTimeout(() => {
      buscar({ q: inputValue, limit: 20 })
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, buscar])

  // Build autocomplete options: users from search + groups
  const usuarioOptions: AutocompleteOption[] = usuariosBuscados
    .filter((u) => u.id !== organizadorId && !value.some((p) => p.id === u.id))
    .map((u) => ({ kind: 'usuario', id: u.id, nombre: u.nombreCompleto }))

  const grupoOptions: AutocompleteOption[] = grupos
    .filter((g) => g.miembros.length > 0)
    .map((g) => ({ kind: 'grupo', id: g.id, nombre: g.nombre, miembros: g.miembros }))

  const options: AutocompleteOption[] = [...usuarioOptions, ...grupoOptions]

  const handleChange = useCallback(
    (_: unknown, newValue: AutocompleteOption[]) => {
      const expanded: SelectedParticipant[] = []
      const seen = new Set<number>([organizadorId])

      for (const opt of newValue) {
        if (opt.kind === 'usuario') {
          if (!seen.has(opt.id)) {
            seen.add(opt.id)
            expanded.push({ id: opt.id, nombre: opt.nombre })
          }
        } else {
          // Expand group to individual members
          for (const m of opt.miembros) {
            if (!seen.has(m.id)) {
              seen.add(m.id)
              expanded.push({ id: m.id, nombre: m.nombre })
            }
          }
        }
      }

      onChange(expanded)
    },
    [organizadorId, onChange]
  )

  // Map current value back to AutocompleteOption[] for the Autocomplete
  const autocompleteValue: AutocompleteOption[] = value.map((p) => ({
    kind: 'usuario',
    id: p.id,
    nombre: p.nombre,
  }))

  return (
    <Box>
      {/* Organizador chip (non-removable) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        <Chip
          label={organizadorNombre}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontSize: 12 }}
        />
        {value.map((p) => (
          <Chip
            key={p.id}
            label={p.nombre}
            size="small"
            onDelete={() => onChange(value.filter((x) => x.id !== p.id))}
            sx={{ fontSize: 12 }}
          />
        ))}
      </Box>

      <Autocomplete<AutocompleteOption, true>
        multiple
        value={autocompleteValue}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, v, reason) => {
          if (reason !== 'reset') setInputValue(v)
        }}
        options={options}
        groupBy={(opt) => (opt.kind === 'usuario' ? 'Usuarios' : 'Grupos')}
        getOptionLabel={(opt) => opt.nombre}
        isOptionEqualToValue={(a, b) => a.kind === b.kind && a.id === b.id}
        filterOptions={(x) => x} // disable built-in filter — we handle via API
        loading={isFetching}
        noOptionsText={inputValue.length < 2 ? 'Escribe 2+ caracteres para buscar' : 'Sin resultados'}
        renderTags={() => null} // chips rendered above
        renderInput={(params) => (
          <TextField
            {...params}
            label="Participantes"
            size="small"
            placeholder="Buscar por nombre..."
            helperText={`${value.length + 1} participante${value.length + 1 !== 1 ? 's' : ''} seleccionado${value.length + 1 !== 1 ? 's' : ''}`}
          />
        )}
        renderOption={(props, opt) => (
          <li {...props} key={`${opt.kind}-${opt.id}`}>
            <Box>
              <Typography sx={{ fontSize: 13 }}>{opt.nombre}</Typography>
              {opt.kind === 'grupo' && (
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {(opt as Extract<AutocompleteOption, { kind: 'grupo' }>).miembros.length} miembros
                </Typography>
              )}
            </Box>
          </li>
        )}
      />
    </Box>
  )
}
