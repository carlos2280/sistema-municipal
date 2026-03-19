import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ArrowLeft, PanelRightClose, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ContactItem } from '../atoms/ContactItem'

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
        u.email.toLowerCase().includes(term),
    )
  }, [usuarios, searchTerm])

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
          <UserPlus size={22} color={theme.palette.primary.main} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            Nuevo Chat
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

      {/* MERIDIAN search input */}
      <Box sx={{ p: 2, px: 2.5 }}>
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
              handleSearchChange(e.target.value)
            }
            placeholder="Buscar contacto..."
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
