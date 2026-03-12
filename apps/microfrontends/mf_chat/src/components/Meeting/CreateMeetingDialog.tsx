import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { memo, useCallback, useState } from 'react'
import type { CreateReunionInput, TipoReunion } from '../../types/meeting.types'
import { type GrupoOption, type SelectedParticipant, ParticipantSelector } from './ParticipantSelector'

interface ConvOption {
  id: number
  nombre: string
  tipo: 'directa' | 'grupo'
}

interface CreateMeetingDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: CreateReunionInput, conversacionId?: number) => Promise<void>
  isLoading?: boolean
  /** Cuando se provee, muestra un selector de conversación en el formulario */
  conversaciones?: ConvOption[]
  /** Id del usuario organizador — activa el ParticipantSelector */
  organizadorId?: number
  /** Nombre del organizador para el chip no-removible */
  organizadorNombre?: string
  /** Grupos del usuario con sus miembros para el selector */
  grupos?: GrupoOption[]
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultStart(): Date {
  const d = new Date()
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  if (d.getMinutes() === 0) d.setHours(d.getHours() + 1)
  return d
}

export const CreateMeetingDialog = memo(function CreateMeetingDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  conversaciones,
  organizadorId,
  organizadorNombre,
  grupos,
}: CreateMeetingDialogProps) {
  const start = defaultStart()
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<TipoReunion>('video')
  const [fechaInicio, setFechaInicio] = useState(toLocalDatetimeValue(start))
  const [fechaFin, setFechaFin] = useState(toLocalDatetimeValue(end))
  const [ubicacion, setUbicacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedConvId, setSelectedConvId] = useState<number | ''>(
    conversaciones?.[0]?.id ?? ''
  )
  const [participants, setParticipants] = useState<SelectedParticipant[]>([])

  const handleClose = useCallback(() => {
    setError(null)
    setSelectedConvId(conversaciones?.[0]?.id ?? '')
    setParticipants([])
    onClose()
  }, [onClose, conversaciones])

  const handleConfirm = useCallback(async () => {
    if (!titulo.trim()) {
      setError('El título es requerido')
      return
    }
    if (conversaciones && !selectedConvId) {
      setError('Selecciona una conversación o grupo')
      return
    }
    if (participants.length > 49) {
      setError('Máximo 50 participantes por reunión')
      return
    }
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      setError('Fechas inválidas')
      return
    }
    if (fin <= inicio) {
      setError('La hora de fin debe ser posterior a la de inicio')
      return
    }
    setError(null)
    try {
      const data: CreateReunionInput = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        tipo,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
        ubicacion: ubicacion.trim() || undefined,
      }
      // Solo incluir participantesIds si el selector está disponible y hay selección explícita
      if (organizadorId !== undefined && participants.length > 0) {
        data.participantesIds = participants.map((p) => p.id)
      }
      await onConfirm(data, conversaciones ? Number(selectedConvId) : undefined)
      setTitulo('')
      setDescripcion('')
      setTipo('video')
      setUbicacion('')
      setParticipants([])
      onClose()
    } catch {
      setError('Error al crear la reunión. Inténtalo de nuevo.')
    }
  }, [titulo, descripcion, tipo, fechaInicio, fechaFin, ubicacion, conversaciones, selectedConvId, participants, organizadorId, onConfirm, onClose])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>
        Programar reunión
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
          {conversaciones && conversaciones.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel>Conversación / Grupo *</InputLabel>
              <Select
                value={selectedConvId}
                label="Conversación / Grupo *"
                onChange={(e) => setSelectedConvId(Number(e.target.value))}
              >
                {conversaciones.map((conv) => (
                  <MenuItem key={conv.id} value={conv.id}>
                    {conv.tipo === 'grupo' ? '👥 ' : '💬 '}
                    {conv.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Título *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            inputProps={{ maxLength: 200 }}
          />

          {organizadorId !== undefined && (
            <ParticipantSelector
              organizadorId={organizadorId}
              organizadorNombre={organizadorNombre}
              value={participants}
              onChange={setParticipants}
              grupos={grupos}
            />
          )}

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              label="Tipo"
              onChange={(e) => setTipo(e.target.value as TipoReunion)}
            >
              <MenuItem value="video">📹 Videollamada</MenuItem>
              <MenuItem value="voz">🎙️ Llamada de voz</MenuItem>
              <MenuItem value="presencial">📍 Presencial</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Inicio *"
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fin *"
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {tipo === 'presencial' && (
            <TextField
              label="Ubicación / Sala"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              size="small"
              fullWidth
              placeholder="ej. Sala de reuniones 3er piso"
              inputProps={{ maxLength: 500 }}
            />
          )}

          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} size="small">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isLoading}
          size="small"
        >
          {isLoading ? 'Creando...' : 'Crear reunión'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})
