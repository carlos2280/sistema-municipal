import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  ArrowLeft,
  Camera,
  PanelRightClose,
  Search,
  UsersRound,
} from 'lucide-react'
import { UserAvatar } from 'mf_ui/components'
import { useMemo, useState } from 'react'

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
        u.email.toLowerCase().includes(term),
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
        bgcolor: theme.meridian.surfaces.s1,
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
          borderBottom: `1px solid ${theme.meridian.borders.default}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UsersRound size={22} color={theme.palette.primary.main} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            Crear Grupo
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              border: `1px solid ${theme.meridian.borders.default}`,
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
                border: `1px solid ${theme.meridian.borders.default}`,
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
              border: `2px dashed ${theme.meridian.borders.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: theme.meridian.surfaces.s3,
              },
            }}
          >
            <Camera size={28} color={theme.palette.text.secondary} />
          </Box>
          <Typography
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              fontSize: '13.5px',
              fontFamily: '"DM Sans", sans-serif',
              cursor: 'pointer',
            }}
          >
            Agregar foto del grupo
          </Typography>
        </Box>

        {/* Name Section — MERIDIAN input */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '13.5px',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Nombre del grupo
          </Typography>
          <Box
            component="input"
            value={groupName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGroupName(e.target.value)
            }
            placeholder="Ej: Equipo Contabilidad"
            sx={{
              height: 40,
              px: 1.5,
              backgroundColor: theme.meridian.surfaces.s3,
              border: `1px solid ${theme.meridian.borders.default}`,
              borderRadius: `${theme.shape.borderRadius}px`,
              fontSize: '13.5px',
              fontFamily: '"DM Sans", sans-serif',
              color: theme.palette.text.primary,
              outline: 'none',
              '&::placeholder': {
                color: theme.palette.text.disabled,
              },
              '&:focus': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.meridian.surfaces.s4,
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '13.5px',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Participantes
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                fontFamily: '"Space Grotesk", sans-serif',
                fontFeatureSettings: "'tnum' 1",
                color: 'text.secondary',
              }}
            >
              {selectedIds.size} seleccionados
            </Typography>
          </Box>

          {/* Search Participants — MERIDIAN input */}
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
              placeholder="Buscar participantes..."
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

          {/* Participants List */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              border: `1px solid ${theme.meridian.borders.default}`,
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4,
                  gap: 1,
                }}
              >
                <Search
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
                    borderBottom: `1px solid ${theme.meridian.borders.muted}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: theme.meridian.surfaces.s3 },
                    bgcolor: selectedIds.has(usuario.id)
                      ? theme.meridian.surfaces.s3
                      : 'transparent',
                  }}
                >
                  {/* Avatar — reutiliza UserAvatar de mf_ui */}
                  <UserAvatar name={usuario.nombreCompleto} size="sm" />

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: '13px',
                        fontFamily: '"DM Sans", sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {usuario.nombreCompleto}
                    </Typography>
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
                      {usuario.email}
                    </Typography>
                  </Box>

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
