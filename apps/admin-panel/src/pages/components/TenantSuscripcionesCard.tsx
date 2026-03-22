import StatusChip from '@/components/shared/StatusChip'
import type { EstadoSuscripcion } from '@/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

interface Suscripcion {
  id: number
  estado: EstadoSuscripcion
  fechaInicio: string
  precioMensual?: string | number | null
  modulo: { id: number; nombre: string }
}

interface TenantSuscripcionesCardProps {
  subs: Suscripcion[] | undefined
  isLoading: boolean
  canAddModule: boolean
  onAddModule: () => void
  onChangeEstado: (subId: number, estado: EstadoSuscripcion) => void
}

export function TenantSuscripcionesCard({
  subs,
  isLoading,
  canAddModule,
  onAddModule,
  onChangeEstado,
}: TenantSuscripcionesCardProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Suscripciones
        </Typography>
        {canAddModule && (
          <Button variant="contained" size="small" onClick={onAddModule}>
            Activar Módulo
          </Button>
        )}
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Módulo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Precio Mensual</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subs?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.modulo.nombre}</TableCell>
                  <TableCell>
                    <StatusChip estado={s.estado} />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('es-CL').format(
                      new Date(s.fechaInicio),
                    )}
                  </TableCell>
                  <TableCell>
                    {s.precioMensual
                      ? `$${Number(s.precioMensual).toLocaleString('es-CL')}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => onChangeEstado(s.id, s.estado)}
                    >
                      Cambiar Estado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!subs || subs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Sin suscripciones activas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  )
}
