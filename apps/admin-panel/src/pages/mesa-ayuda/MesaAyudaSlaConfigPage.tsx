import {
  useActualizarPrioridad,
  useMesaAyudaPrioridades,
} from '@/hooks/useMesaAyudaPrioridades'
import type { AdminPrioridad } from '@/types/mesa-ayuda'
import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { PrioridadColorSelect } from './components/PrioridadColorSelect'
import { PrioridadNombreField } from './components/PrioridadNombreField'
import { PrioridadSlaField } from './components/PrioridadSlaField'

const rowSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  color: z.string().min(1, 'Requerido'),
  slaHoras: z.number().int().min(1, 'Mín. 1h').max(720, 'Máx. 720h'),
})

type RowFormValues = z.infer<typeof rowSchema>

interface PrioridadRowProps {
  prioridad: AdminPrioridad
  colors: string[]
  onSave: (id: number, data: RowFormValues) => void
  isSaving: boolean
}

function PrioridadRow({
  prioridad,
  colors,
  onSave,
  isSaving,
}: PrioridadRowProps) {
  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<RowFormValues>({
    resolver: zodResolver(rowSchema),
    defaultValues: {
      nombre: prioridad.nombre,
      color: prioridad.color,
      slaHoras: prioridad.slaHoras,
    },
  })

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {prioridad.nivel}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="mono">{prioridad.codigo}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <PrioridadNombreField
              field={field}
              error={errors.nombre?.message}
            />
          )}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <PrioridadColorSelect field={field} colors={colors} />
          )}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <Controller
          name="slaHoras"
          control={control}
          render={({ field }) => (
            <PrioridadSlaField field={field} error={errors.slaHoras?.message} />
          )}
        />
      </TableCell>
      <TableCell>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit((v) => onSave(prioridad.id, v))}
          disabled={!isDirty || isSaving}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function MesaAyudaSlaConfigPage() {
  const theme = useTheme()
  const { data: prioridades = [], isLoading, error } = useMesaAyudaPrioridades()
  const actualizarPrioridad = useActualizarPrioridad()

  // Colores semánticos del theme — sin hex hardcodeados
  const colors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.warning.light,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
  ]

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (error)
    return (
      <Alert severity="error">
        Error al cargar prioridades: {error.message}
      </Alert>
    )

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Mesa de Ayuda — Configuración SLA
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tiempos objetivo de resolución por prioridad
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Los cambios aplican a tickets nuevos. Los tickets existentes conservan
        su fecha límite original.
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
              colors={colors}
              onSave={(id, data) => actualizarPrioridad.mutate({ id, data })}
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

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: 'block' }}
      >
        Las prioridades no se pueden crear ni eliminar — solo se puede modificar
        nombre, color y tiempo SLA.
      </Typography>
    </Box>
  )
}
