import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  ArrowLeft,
  Camera,
  PanelRightClose,
  Search,
  UsersRound,
} from 'lucide-react'
import { useState, useMemo } from 'react'

interface Usuario {
  id: number
  nombreCompleto: string
  email: string
}

interface NewGroupPanelProps {
  usuarios: Usuario[]
  isLoading: boolean
  onCreateGroup: (nombre: string, participantes: number[]) => void
  onBack: () => void
  onClose?: () => void
  isCreating?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    '#10B981',
    '#7928CA',
    '#F59E0B',
    '#6366F1',
    '#EF4444',
    '#EC4899',
    '#2563EB',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function NewGroupPanel({
  usuarios,
  isLoading,
  onCreateGroup,
  onBack,
  onClose,
  isCreating = false,
}: NewGroupPanelProps) {
  const theme = useTheme()
  const [groupName, setGroupName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const usuariosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return usuarios
    const term = searchTerm.toLowerCase()
    return usuarios.filter(
      (u) =>
        u.nombreCompleto.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [usuarios, searchTerm])

  const toggleParticipant = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedIds.size > 0) {
      onCreateGroup(groupName.trim(), Array.from(selectedIds))
    }
  }

  const canCreate = groupName.trim().length > 0 && selectedIds.size > 0

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          px: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UsersRound size={22} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Crear Grupo
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              width: 32,
              height: 32,
            }}
          >
            <ArrowLeft size={18} />
          </IconButton>
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                width: 32,
                height: 32,
              }}
            >
              <PanelRightClose size={18} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Form Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Photo Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px dashed',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Camera size={28} color={theme.palette.text.secondary} />
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}
          >
            Agregar foto del grupo
          </Typography>
        </Box>

        {/* Name Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Nombre del grupo
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Ej: Equipo Contabilidad"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.action.hover,
              },
            }}
          />
        </Box>

        {/* Participants Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Participants Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Participantes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedIds.size} seleccionados
            </Typography>
          </Box>

          {/* Search Participants */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar participantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.action.hover,
              },
            }}
          />

          {/* Participants List */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : usuariosFiltrados.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  No se encontraron usuarios
                </Typography>
              </Box>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <Box
                  key={usuario.id}
                  onClick={() => toggleParticipant(usuario.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: selectedIds.has(usuario.id)
                      ? 'primary.light'
                      : 'transparent',
                  }}
                >
                  {/* Avatar */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: getAvatarColor(usuario.nombreCompleto),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {getInitials(usuario.nombreCompleto)}
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {usuario.nombreCompleto}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {usuario.email}
                    </Typography>
                  </Box>

                  {/* Checkbox */}
                  <Checkbox
                    size="small"
                    checked={selectedIds.has(usuario.id)}
                    onChange={() => toggleParticipant(usuario.id)}
                    sx={{ p: 0 }}
                  />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Create Button */}
      <Box sx={{ p: 2.5, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!canCreate || isCreating}
          onClick={handleCreate}
          startIcon={
            isCreating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <UsersRound size={18} />
            )
          }
          sx={{
            py: 1.5,
            fontWeight: 600,
          }}
        >
          {isCreating ? 'Creando...' : 'Crear Grupo'}
        </Button>
      </Box>
    </Box>
  )
}
