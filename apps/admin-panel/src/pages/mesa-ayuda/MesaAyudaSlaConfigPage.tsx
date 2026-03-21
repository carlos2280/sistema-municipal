import SaveIcon from '@mui/icons-material/Save'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useActualizarPrioridad, useMesaAyudaPrioridades } from '@/hooks/useMesaAyudaPrioridades'
import type { AdminPrioridad } from '@/types/mesa-ayuda'

const COLORES_DISPONIBLES = [
  '#e53935', // rojo — critica
  '#fb8c00', // naranja — alta
  '#fdd835', // amarillo — media
  '#43a047', // verde — baja
  '#1e88e5', // azul
  '#8e24aa', // morado
]

const rowSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  color: z.string().min(1, 'Requerido'),
  slaHoras: z.number().int().min(1, 'Mín. 1h').max(720, 'Máx. 720h'),
})

type RowFormValues = z.infer<typeof rowSchema>

interface PrioridadRowProps {
  prioridad: AdminPrioridad
  onSave: (id: number, data: RowFormValues) => void
  isSaving: boolean
}

function PrioridadRow({ prioridad, onSave, isSaving }: PrioridadRowProps) {
  const { control, handleSubmit, formState: { isDirty, errors } } = useForm<RowFormValues>({
    resolver: zodResolver(rowSchema),
    defaultValues: {
      nombre: prioridad.nombre,
      color: prioridad.color,
      slaHoras: prioridad.slaHoras,
    },
  })

  function handleValid(values: RowFormValues) {
    onSave(prioridad.id, values)
  }

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {prioridad.nivel}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontFamily="monospace">
          {prioridad.codigo}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          )}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              size="small"
              fullWidth
              renderValue={(val: string) => (
                <Chip
                  label={val}
                  size="small"
                  sx={{ backgroundColor: val, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}
                />
              )}
            >
              {COLORES_DISPONIBLES.map((c) => (
                <MenuItem key={c} value={c}>
                  <Chip
                    label={c}
                    size="small"
                    sx={{ backgroundColor: c, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}
                  />
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <Controller
          name="slaHoras"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
              size="small"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 720 } }}
              error={!!errors.slaHoras}
              helperText={errors.slaHoras?.message}
            />
          )}
        />
      </TableCell>
      <TableCell>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit(handleValid)}
          disabled={!isDirty || isSaving}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function MesaAyudaSlaConfigPage() {
  const { data: prioridades = [], isLoading, error } = useMesaAyudaPrioridades()
  const actualizarPrioridad = useActualizarPrioridad()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">Error al cargar prioridades: {error.message}</Alert>
    )
  }

  function handleSave(id: number, data: RowFormValues) {
    actualizarPrioridad.mutate({ id, data })
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Mesa de Ayuda — Configuración SLA
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tiempos objetivo de resolución por prioridad
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los cambios aplican a tickets nuevos. Los tickets existentes conservan su fecha límite original.
      </Alert>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nivel</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>SLA Horas</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prioridades.map((prioridad: AdminPrioridad) => (
            <PrioridadRow
              key={prioridad.id}
              prioridad={prioridad}
              onSave={handleSave}
              isSaving={actualizarPrioridad.isPending}
            />
          ))}
          {prioridades.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No hay prioridades configuradas
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Las prioridades no se pueden crear ni eliminar — solo se puede modificar nombre, color y tiempo SLA.
      </Typography>
    </Box>
  )
}
