import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageSquare, Plus, Search, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useConversaciones, useOnlineUsers } from '../../hooks'
import { ConversationItem } from './ConversationItem'

interface ChatPanelProps {
  activeConversationId?: number
  onSelectConversation?: (id: number) => void
  onClose?: () => void
  currentUserId?: number
  onNewChat?: (event: React.MouseEvent<HTMLElement>) => void
}

// Función para formatear la hora del último mensaje
function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    if (diffDays === 1) {
      return 'Ayer'
    }
    if (diffDays < 7) {
      return formatDistanceToNow(date, { locale: es, addSuffix: false })
    }
    return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export function ChatPanel({
  activeConversationId,
  onSelectConversation,
  onClose,
  currentUserId,
  onNewChat,
}: ChatPanelProps) {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const { conversaciones, isLoading, error } = useConversaciones()
  const { isUserOnline } = useOnlineUsers()

  // Transformar conversaciones al formato del componente
  const mappedConversations = useMemo(() => {
    return conversaciones.map((conv) => {
      // Para conversaciones directas, obtener el nombre del otro participante
      let nombre = conv.nombre || 'Sin nombre'
      let online = false
      let otherUserId: number | undefined

      if (conv.tipo === 'directa' && conv.participantes.length > 0) {
        const otherParticipant = conv.participantes.find(
          (p) => p.usuarioId !== currentUserId
        )
        if (otherParticipant) {
          nombre = otherParticipant.usuario.nombreCompleto
          otherUserId = otherParticipant.usuarioId
          online = isUserOnline(otherUserId)
        }
      }

      return {
        id: conv.id,
        nombre,
        ultimoMensaje: conv.ultimoMensaje?.contenido || 'Sin mensajes',
        hora: conv.ultimoMensaje
          ? formatMessageTime(conv.ultimoMensaje.createdAt)
          : '',
        noLeidos: conv.mensajesNoLeidos,
        online,
        tipo: conv.tipo,
      }
    })
  }, [conversaciones, currentUserId, isUserOnline])

  // Calcular total de mensajes no leídos
  const totalUnread = mappedConversations.reduce(
    (acc, conv) => acc + conv.noLeidos,
    0
  )

  const filteredConversations = mappedConversations.filter((conv) => {
    const matchesSearch = conv.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && conv.tipo === 'directa') ||
      (tabValue === 2 && conv.tipo === 'grupo')
    return matchesSearch && matchesTab
  })

  const handleConversationClick = (id: number) => {
    onSelectConversation?.(id)
  }

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
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MessageSquare size={22} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Chat
          </Typography>
          {totalUnread > 0 && (
            <Badge
              badgeContent={totalUnread}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: 11,
                  height: 20,
                  minWidth: 20,
                },
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={onNewChat}
            sx={{ color: 'text.secondary' }}
          >
            <Plus size={20} />
          </IconButton>
          {onClose && (
            <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
              <X size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
              px: 2,
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MessageSquare size={16} />
                <span>Todos</span>
              </Box>
            }
          />
          <Tab label="Mensajes" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Users size={16} />
                <span>Grupos</span>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar conversación..."
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

      {/* Conversation List */}
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
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {searchTerm
                ? 'No se encontraron conversaciones'
                : 'No tienes conversaciones aún'}
            </Typography>
          </Box>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              id={conv.id}
              nombre={conv.nombre}
              ultimoMensaje={conv.ultimoMensaje}
              hora={conv.hora}
              noLeidos={conv.noLeidos}
              online={conv.online}
              tipo={conv.tipo}
              isActive={activeConversationId === conv.id}
              onClick={() => handleConversationClick(conv.id)}
            />
          ))
        )}
      </Box>
    </Box>
  )
}
