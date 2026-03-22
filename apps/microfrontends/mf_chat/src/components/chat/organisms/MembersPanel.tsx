import { useOnlineUsers } from '@/hooks'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
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
  Users as UsersIcon,
  X,
} from 'lucide-react'
import {
  useEliminarParticipanteMutation,
  useObtenerParticipantesQuery,
  useRenombrarGrupoMutation,
} from 'mf_store/store'
import { UserAvatar } from 'mf_ui/components'
import { useCallback, useMemo, useState } from 'react'

interface MembersPanelProps {
  conversacionId: number
  currentUserId?: number
  esSistema: boolean
  esAdmin: boolean
  nombreGrupo?: string
  onBack: () => void
  onClose?: () => void
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
        p.usuario.email.toLowerCase().includes(term),
    )
  }, [participantes, searchTerm])

  const handleRemoveClick = useCallback((usuarioId: number, nombre: string) => {
    setConfirmDialog({ open: true, usuarioId, nombre })
  }, [])

  const handleConfirmRemove = useCallback(async () => {
    try {
      await eliminarParticipante({
        conversacionId,
        usuarioId: confirmDialog.usuarioId,
      }).unwrap()
    } catch {
      // error manejado por RTK Query
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
    } catch {
      // error manejado por RTK Query
    }
  }, [conversacionId, editedName, nombreGrupo, renombrarGrupo])

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: theme.meridian.surfaces.s1,
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
          borderBottom: `1px solid ${theme.meridian.borders.default}`,
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
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            Miembros
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"Space Grotesk", sans-serif',
              fontFeatureSettings: "'tnum' 1",
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            ({participantes.length})
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
            borderBottom: `1px solid ${theme.meridian.borders.default}`,
          }}
        >
          {isEditingName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="input"
                value={editedName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditedName(e.target.value)
                }
                autoFocus
                disabled={isRenaming}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') {
                    setIsEditingName(false)
                    setEditedName(nombreGrupo || '')
                  }
                }}
                sx={{
                  flex: 1,
                  height: 40,
                  px: 1.5,
                  backgroundColor: theme.meridian.surfaces.s3,
                  border: `1px solid ${theme.meridian.borders.default}`,
                  borderRadius: `${theme.shape.borderRadius}px`,
                  fontSize: '13.5px',
                  fontFamily: '"DM Sans", sans-serif',
                  color: theme.palette.text.primary,
                  outline: 'none',
                  '&:focus': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.meridian.surfaces.s4,
                  },
                }}
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
              <Typography
                sx={{
                  fontSize: '14px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                }}
              >
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

      {/* MERIDIAN search input */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 40,
            px: 1.5,
            backgroundColor: theme.meridian.surfaces.s3,
            border: `1px solid ${theme.meridian.borders.default}`,
            borderRadius: `${theme.shape.borderRadius}px`,
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.meridian.surfaces.s4,
            },
          }}
        >
          <Search size={16} color={theme.palette.text.secondary} />
          <Box
            component="input"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Buscar miembro..."
            sx={{
              flex: 1,
              ml: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '13.5px',
              fontFamily: '"DM Sans", sans-serif',
              color: theme.palette.text.primary,
              '&::placeholder': {
                color: theme.palette.text.disabled,
              },
            }}
          />
        </Box>
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
          /* MERIDIAN empty state */
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
            }}
          >
            <UsersIcon
              size={32}
              color={theme.palette.text.disabled}
              strokeWidth={1.5}
            />
            <Typography
              sx={{
                fontSize: '13.5px',
                fontFamily: '"DM Sans", sans-serif',
                color: 'text.secondary',
              }}
            >
              {searchTerm ? 'No se encontraron miembros' : 'No hay miembros'}
            </Typography>
          </Box>
        ) : (
          filteredParticipantes.map((p) => {
            const online = isUserOnline(p.usuarioId)
            const isCurrentUser = p.usuarioId === currentUserId
            const canRemove = esAdmin && !esSistema && !isCurrentUser

            return (
              <Box
                key={p.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: theme.meridian.surfaces.s3,
                  },
                }}
              >
                {/* Avatar — reutiliza UserAvatar de mf_ui */}
                <UserAvatar
                  name={p.usuario.nombreCompleto}
                  size="md"
                  status={online ? 'online' : 'offline'}
                />

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
                        fontSize: '13px',
                        fontFamily: '"DM Sans", sans-serif',
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
                          fontSize: '10px',
                          fontFamily: '"DM Mono", monospace',
                          textTransform: 'uppercase',
                          '& .MuiChip-icon': { fontSize: 10 },
                          '& .MuiChip-label': { px: 0.5 },
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontFamily: '"DM Sans", sans-serif',
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
                      handleRemoveClick(p.usuarioId, p.usuario.nombreCompleto)
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
