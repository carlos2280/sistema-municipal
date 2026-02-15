import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  ArrowLeft,
  Building2,
  Check,
  Pencil,
  Search,
  Shield,
  UserMinus,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  useObtenerParticipantesQuery,
  useEliminarParticipanteMutation,
  useRenombrarGrupoMutation,
} from 'mf_store/store'
import { useOnlineUsers } from '../../hooks'

interface MembersPanelProps {
  conversacionId: number
  currentUserId?: number
  esSistema: boolean
  esAdmin: boolean
  nombreGrupo?: string
  onBack: () => void
  onClose?: () => void
}

function getAvatarColor(name: string): string {
  const colors = [
    '#7C3AED',
    '#2563EB',
    '#059669',
    '#DC2626',
    '#D97706',
    '#7C3AED',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MembersPanel({
  conversacionId,
  currentUserId,
  esSistema,
  esAdmin,
  nombreGrupo,
  onBack,
  onClose,
}: MembersPanelProps) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    usuarioId: number
    nombre: string
  }>({ open: false, usuarioId: 0, nombre: '' })
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(nombreGrupo || '')

  const { data: participantes = [], isLoading } =
    useObtenerParticipantesQuery(conversacionId)
  const [eliminarParticipante, { isLoading: isRemoving }] =
    useEliminarParticipanteMutation()
  const [renombrarGrupo, { isLoading: isRenaming }] =
    useRenombrarGrupoMutation()
  const { isUserOnline } = useOnlineUsers()

  const filteredParticipantes = useMemo(() => {
    if (!searchTerm) return participantes
    const term = searchTerm.toLowerCase()
    return participantes.filter(
      (p) =>
        p.usuario.nombreCompleto.toLowerCase().includes(term) ||
        p.usuario.email.toLowerCase().includes(term)
    )
  }, [participantes, searchTerm])

  const handleRemoveClick = useCallback(
    (usuarioId: number, nombre: string) => {
      setConfirmDialog({ open: true, usuarioId, nombre })
    },
    []
  )

  const handleConfirmRemove = useCallback(async () => {
    try {
      await eliminarParticipante({
        conversacionId,
        usuarioId: confirmDialog.usuarioId,
      }).unwrap()
    } catch (error) {
      console.error('Error al eliminar participante:', error)
    }
    setConfirmDialog({ open: false, usuarioId: 0, nombre: '' })
  }, [conversacionId, confirmDialog.usuarioId, eliminarParticipante])

  const handleSaveName = useCallback(async () => {
    const trimmed = editedName.trim()
    if (!trimmed || trimmed === nombreGrupo) {
      setIsEditingName(false)
      setEditedName(nombreGrupo || '')
      return
    }
    try {
      await renombrarGrupo({ conversacionId, nombre: trimmed }).unwrap()
      setIsEditingName(false)
    } catch (error) {
      console.error('Error al renombrar grupo:', error)
    }
  }, [conversacionId, editedName, nombreGrupo, renombrarGrupo])

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onBack}
            sx={{ color: 'text.secondary' }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            Miembros ({participantes.length})
          </Typography>
        </Box>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <X size={20} />
          </IconButton>
        )}
      </Box>

      {/* Nombre del grupo editable (solo grupos normales + admin) */}
      {!esSistema && esAdmin && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {isEditingName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                size="small"
                fullWidth
                autoFocus
                disabled={isRenaming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') {
                    setIsEditingName(false)
                    setEditedName(nombreGrupo || '')
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 14 } }}
              />
              <IconButton
                size="small"
                onClick={handleSaveName}
                disabled={isRenaming}
                color="primary"
              >
                <Check size={18} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => {
                setEditedName(nombreGrupo || '')
                setIsEditingName(true)
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {nombreGrupo}
              </Typography>
              <Pencil size={14} />
            </Box>
          )}
        </Box>
      )}

      {/* Banner para grupos del sistema */}
      {esSistema && (
        <Alert
          severity="info"
          icon={<Building2 size={18} />}
          sx={{ mx: 2, mt: 1.5, '& .MuiAlert-message': { fontSize: 12 } }}
        >
          Los miembros se gestionan automaticamente por departamento
        </Alert>
      )}

      {/* Buscar miembro */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar miembro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.action.hover,
              '& fieldset': { borderColor: theme.palette.divider },
            },
          }}
        />
      </Box>

      {/* Lista de miembros */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : filteredParticipantes.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {searchTerm
                ? 'No se encontraron miembros'
                : 'No hay miembros'}
            </Typography>
          </Box>
        ) : (
          filteredParticipantes.map((p) => {
            const online = isUserOnline(p.usuarioId)
            const isCurrentUser = p.usuarioId === currentUserId
            const canRemove =
              esAdmin && !esSistema && !isCurrentUser

            return (
              <Box
                key={p.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: theme.palette.action.hover },
                }}
              >
                {/* Avatar */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getAvatarColor(
                        p.usuario.nombreCompleto
                      ),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {getInitials(p.usuario.nombreCompleto)}
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: online ? 'success.main' : 'grey.400',
                      border: `2px solid ${theme.palette.background.paper}`,
                    }}
                  />
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.usuario.nombreCompleto}
                      {isCurrentUser && ' (Tú)'}
                    </Typography>
                    {p.rol === 'admin' && (
                      <Chip
                        icon={<Shield size={10} />}
                        label="Admin"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          '& .MuiChip-icon': { fontSize: 10 },
                          '& .MuiChip-label': { px: 0.5 },
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.usuario.email}
                  </Typography>
                </Box>

                {/* Acción eliminar */}
                {canRemove && (
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleRemoveClick(
                        p.usuarioId,
                        p.usuario.nombreCompleto
                      )
                    }
                    disabled={isRemoving}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' },
                    }}
                  >
                    <UserMinus size={16} />
                  </IconButton>
                )}
              </Box>
            )
          })
        )}
      </Box>

      {/* Dialog de confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, usuarioId: 0, nombre: '' })
        }
      >
        <DialogTitle>Eliminar miembro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar a {confirmDialog.nombre} del grupo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, usuarioId: 0, nombre: '' })
            }
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            disabled={isRemoving}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
