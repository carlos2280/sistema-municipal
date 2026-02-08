import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { ThemeProvider, useTheme, type Theme } from '@mui/material/styles'
import { MessageSquarePlus, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  useBuscarUsuariosQuery,
  useCrearConversacionDirectaMutation,
  useCrearGrupoMutation,
  selectUsuarioId,
  useAppSelector,
} from 'mf_store/store'
import { useOnlineUsers } from '../../hooks'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { ChatWindow } from '../ChatWindow/ChatWindow'
import { NewChatPanel, NewGroupPanel } from '../NewChat'

type ViewType = 'conversations' | 'chat' | 'newChat' | 'newGroup'

interface ChatDrawerProps {
  open: boolean
  onClose: () => void
  theme?: Theme
}

const DRAWER_WIDTH = 420

export function ChatDrawer({
  open,
  onClose,
  theme: injectedTheme,
}: ChatDrawerProps) {
  const contextTheme = useTheme()
  const theme = injectedTheme || contextTheme
  const currentUserId = useAppSelector(selectUsuarioId)

  const [view, setView] = useState<ViewType>('conversations')
  const [activeConversationId, setActiveConversationId] = useState<
    number | undefined
  >()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  // RTK Query hooks
  const shouldFetchUsuarios = view === 'newChat' || view === 'newGroup'
  const { data: usuarios = [], isLoading: isLoadingUsuarios } =
    useBuscarUsuariosQuery({ q: searchTerm, limit: 50 }, { skip: !shouldFetchUsuarios })

  // Hook de usuarios online
  const { onlineUsers } = useOnlineUsers()
  const onlineUsersArray = useMemo(() => Array.from(onlineUsers), [onlineUsers])

  const [crearConversacionDirecta, { isLoading: isCreatingDirecta }] =
    useCrearConversacionDirectaMutation()
  const [crearGrupo, { isLoading: isCreatingGrupo }] = useCrearGrupoMutation()

  const isCreating = isCreatingDirecta || isCreatingGrupo

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id)
    setView('chat')
  }

  const handleBack = () => {
    if (view === 'chat') {
      setActiveConversationId(undefined)
      setView('conversations')
    } else if (view === 'newChat' || view === 'newGroup') {
      setView('conversations')
    }
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
  }

  const handleNewChat = () => {
    handleCloseMenu()
    setSearchTerm('')
    setView('newChat')
  }

  const handleNewGroup = () => {
    handleCloseMenu()
    setSearchTerm('')
    setView('newGroup')
  }

  const handleSelectUsuario = useCallback(
    async (usuarioId: number) => {
      try {
        const result = await crearConversacionDirecta({
          destinatarioId: usuarioId,
        }).unwrap()
        setActiveConversationId(result.id)
        setView('chat')
      } catch (error) {
        console.error('Error al crear conversación:', error)
      }
    },
    [crearConversacionDirecta]
  )

  const handleCreateGroup = useCallback(
    async (nombre: string, participantes: number[]) => {
      try {
        const result = await crearGrupo({ nombre, participantes }).unwrap()
        setActiveConversationId(result.id)
        setView('chat')
      } catch (error) {
        console.error('Error al crear grupo:', error)
      }
    },
    [crearGrupo]
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const renderContent = () => {
    switch (view) {
      case 'chat':
        return activeConversationId ? (
          <ChatWindow
            conversacionId={activeConversationId}
            currentUserId={currentUserId ?? undefined}
            onBack={handleBack}
            onClose={onClose}
          />
        ) : null

      case 'newChat':
        return (
          <NewChatPanel
            usuarios={usuarios}
            isLoading={isLoadingUsuarios || isCreating}
            onSelectUsuario={handleSelectUsuario}
            onBack={handleBack}
            onClose={onClose}
            onSearch={handleSearch}
            usuariosOnline={onlineUsersArray}
          />
        )

      case 'newGroup':
        return (
          <NewGroupPanel
            usuarios={usuarios}
            isLoading={isLoadingUsuarios}
            onCreateGroup={handleCreateGroup}
            onBack={handleBack}
            onClose={onClose}
            isCreating={isCreating}
          />
        )

      case 'conversations':
      default:
        return (
          <ChatPanel
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onClose={onClose}
            onNewChat={handleOpenMenu}
            currentUserId={currentUserId ?? undefined}
          />
        )
    }
  }

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      {renderContent()}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleNewChat}>
          <ListItemIcon>
            <MessageSquarePlus size={18} />
          </ListItemIcon>
          <ListItemText primary="Nuevo chat" secondary="Conversación directa" />
        </MenuItem>
        <MenuItem onClick={handleNewGroup}>
          <ListItemIcon>
            <Users size={18} />
          </ListItemIcon>
          <ListItemText primary="Nuevo grupo" secondary="Chat grupal" />
        </MenuItem>
      </Menu>
    </Box>
  )

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus
      slotProps={{
        paper: {
          sx: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        },
      }}
    >
      <ThemeProvider theme={theme}>{drawerContent}</ThemeProvider>
    </Drawer>
  )
}

export default ChatDrawer
