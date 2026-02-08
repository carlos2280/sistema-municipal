import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ArrowLeft, PanelRightClose, Search, UserPlus } from 'lucide-react'
import { useState, useMemo } from 'react'
import { ContactItem } from './ContactItem'

interface Usuario {
  id: number
  nombreCompleto: string
  email: string
}

interface NewChatPanelProps {
  usuarios: Usuario[]
  isLoading: boolean
  onSelectUsuario: (usuarioId: number) => void
  onBack: () => void
  onClose?: () => void
  onSearch: (term: string) => void
  usuariosOnline?: number[]
}

export function NewChatPanel({
  usuarios,
  isLoading,
  onSelectUsuario,
  onBack,
  onClose,
  onSearch,
  usuariosOnline = [],
}: NewChatPanelProps) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const usuariosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return usuarios
    const term = searchTerm.toLowerCase()
    return usuarios.filter(
      (u) =>
        u.nombreCompleto.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [usuarios, searchTerm])

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
          <UserPlus size={22} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Nuevo Chat
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

      {/* Search */}
      <Box sx={{ p: 2, px: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar contacto..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
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
              '& fieldset': { borderColor: theme.palette.divider },
            },
          }}
        />
      </Box>

      {/* Contacts List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
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
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {searchTerm
                ? 'No se encontraron contactos'
                : 'No hay contactos disponibles'}
            </Typography>
          </Box>
        ) : (
          usuariosFiltrados.map((usuario) => (
            <ContactItem
              key={usuario.id}
              id={usuario.id}
              nombre={usuario.nombreCompleto}
              email={usuario.email}
              online={usuariosOnline.includes(usuario.id)}
              onClick={() => onSelectUsuario(usuario.id)}
            />
          ))
        )}
      </Box>
    </Box>
  )
}
