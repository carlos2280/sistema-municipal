import { MeetingsPanel } from '@/components/meeting/organisms/MeetingsPanel'
import { useConversaciones, useOnlineUsers } from '@/hooks'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConversationItem } from '../atoms/ConversationItem'

interface ChatPanelProps {
  activeConversationId?: number
  onSelectConversation?: (id: number) => void
  onSelectReunion?: (reunionId: number) => void
  onClose?: () => void
  currentUserId?: number
  onNewChat?: (event: React.MouseEvent<HTMLElement>) => void
}

function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
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
  onSelectReunion,
  onClose,
  currentUserId,
  onNewChat,
}: ChatPanelProps) {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const { conversaciones, isLoading, error } = useConversaciones()
  const { isUserOnline } = useOnlineUsers()

  const mappedConversations = useMemo(() => {
    return conversaciones.map((conv) => {
      let nombre = conv.nombre || 'Sin nombre'
      let online = false
      let otherUserId: number | undefined

      if (conv.tipo === 'directa' && conv.participantes.length > 0) {
        const otherParticipant = conv.participantes.find(
          (p) => p.usuarioId !== currentUserId,
        )
        if (otherParticipant) {
          nombre = otherParticipant.usuario.nombreCompleto
          otherUserId = otherParticipant.usuarioId
          online = isUserOnline(otherUserId)
        }
      }

      let ultimoMensajePreview = 'Sin mensajes'
      if (conv.ultimoMensaje) {
        const msg = conv.ultimoMensaje
        let preview = msg.contenido
        if (msg.tipo === 'imagen') preview = 'Imagen'
        else if (msg.tipo === 'archivo') preview = 'Archivo'
        else if (msg.tipo === 'sistema') preview = msg.contenido

        if (conv.tipo === 'grupo' && msg.remitente) {
          const firstName = msg.remitente.nombreCompleto.split(' ')[0]
          ultimoMensajePreview = `${firstName}: ${preview}`
        } else {
          ultimoMensajePreview = preview
        }
      }

      return {
        id: conv.id,
        nombre,
        ultimoMensaje: ultimoMensajePreview,
        hora: conv.ultimoMensaje
          ? formatMessageTime(conv.ultimoMensaje.createdAt)
          : '',
        noLeidos: conv.mensajesNoLeidos,
        online,
        tipo: conv.tipo,
        sistema: conv.sistema ?? false,
      }
    })
  }, [conversaciones, currentUserId, isUserOnline])

  const totalUnread = mappedConversations.reduce(
    (acc, conv) => acc + conv.noLeidos,
    0,
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
        bgcolor: theme.meridian.surfaces.s1,
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
          borderBottom: `1px solid ${theme.meridian.borders.default}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MessageSquare size={22} color={theme.palette.primary.main} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
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
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontFeatureSettings: "'tnum' 1",
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
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'text.secondary' }}
            >
              <X size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.meridian.borders.default}`,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
              px: 2,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '13px',
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
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Calendar size={16} />
                <span>Reuniones</span>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Search — MERIDIAN spec input */}
      {tabValue !== 3 && (
        <Box sx={{ p: 2 }}>
          <Box
            component="div"
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
              placeholder="Buscar conversación..."
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
      )}

      {/* Contenido principal */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tabValue === 3 ? (
          <MeetingsPanel
            currentUserId={currentUserId}
            onSelectConversation={onSelectConversation}
            onSelectReunion={onSelectReunion}
          />
        ) : isLoading ? (
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
          /* MERIDIAN empty state: icon + text + action */
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
            {searchTerm ? (
              <>
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
                  Sin resultados para esta búsqueda
                </Typography>
              </>
            ) : (
              <>
                <MessageCircle
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
                  No tienes conversaciones aún
                </Typography>
              </>
            )}
          </Box>
        ) : (
          filteredConversations.map((conv, index) => (
            <ConversationItem
              key={conv.id}
              id={conv.id}
              nombre={conv.nombre}
              ultimoMensaje={conv.ultimoMensaje}
              hora={conv.hora}
              noLeidos={conv.noLeidos}
              online={conv.online}
              tipo={conv.tipo}
              sistema={conv.sistema}
              isActive={activeConversationId === conv.id}
              onClick={() => handleConversationClick(conv.id)}
              staggerIndex={index}
            />
          ))
        )}
      </Box>
    </Box>
  )
}
