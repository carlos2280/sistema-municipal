import { CallModal, IncomingCallDialog } from '@/components/call/organisms'
import { MeetingDetail, MeetingList } from '@/components/meeting/organisms'
import { ChatErrorBoundary } from '@/components/organisms/ChatErrorBoundary'
import { useCall, useConversaciones, useOnlineUsers } from '@/hooks'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  type Theme,
  ThemeProvider,
  alpha,
  useTheme,
} from '@mui/material/styles'
import { MessageSquarePlus, Users } from 'lucide-react'
import {
  selectUsuarioId,
  useAppSelector,
  useBuscarUsuariosQuery,
  useCrearConversacionDirectaMutation,
  useCrearGrupoMutation,
  useIniciarReunionMutation,
  useLazyObtenerTokenLlamadaQuery,
} from 'mf_store/store'
import { useCallback, useMemo, useState } from 'react'
import { ChatPanel } from './ChatPanel'
import { ChatWindow } from './ChatWindow'
import { MembersPanel } from './MembersPanel'
import { NewChatPanel } from './NewChatPanel'
import { NewGroupPanel } from './NewGroupPanel'

type ViewType =
  | 'conversations'
  | 'chat'
  | 'newChat'
  | 'newGroup'
  | 'members'
  | 'meetings'
  | 'meetingDetail'

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
  const [activeReunionId, setActiveReunionId] = useState<number | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  // RTK Query hooks
  const shouldFetchUsuarios = view === 'newChat' || view === 'newGroup'
  const { data: usuarios = [], isLoading: isLoadingUsuarios } =
    useBuscarUsuariosQuery(
      { q: searchTerm, limit: 50 },
      { skip: !shouldFetchUsuarios },
    )

  const { onlineUsers } = useOnlineUsers()
  const onlineUsersArray = useMemo(() => Array.from(onlineUsers), [onlineUsers])

  const {
    callState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    joinCallDirect,
  } = useCall()
  const [fetchToken] = useLazyObtenerTokenLlamadaQuery()

  const [crearConversacionDirecta, { isLoading: isCreatingDirecta }] =
    useCrearConversacionDirectaMutation()
  const [crearGrupo, { isLoading: isCreatingGrupo }] = useCrearGrupoMutation()
  const [iniciarReunionMutation] = useIniciarReunionMutation()

  const isCreating = isCreatingDirecta || isCreatingGrupo

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id)
    setView('chat')
  }

  const { conversaciones } = useConversaciones()

  const activeConversacion = useMemo(
    () => conversaciones.find((c) => c.id === activeConversationId),
    [conversaciones, activeConversationId],
  )

  const isActiveGroupAdmin = useMemo(() => {
    if (!activeConversacion || activeConversacion.tipo !== 'grupo') return false
    const participante = activeConversacion.participantes.find(
      (p) => p.usuarioId === currentUserId,
    )
    return participante?.rol === 'admin'
  }, [activeConversacion, currentUserId])

  const handleBack = () => {
    if (view === 'members') {
      setView('chat')
    } else if (view === 'meetingDetail') {
      setActiveReunionId(undefined)
      setView(activeConversationId ? 'meetings' : 'conversations')
    } else if (view === 'meetings') {
      setView('chat')
    } else if (view === 'chat') {
      setActiveConversationId(undefined)
      setView('conversations')
    } else if (view === 'newChat' || view === 'newGroup') {
      setView('conversations')
    }
  }

  const handleShowMeetings = useCallback(() => {
    setView('meetings')
  }, [])

  const handleSelectReunion = useCallback((reunionId: number) => {
    setActiveReunionId(reunionId)
    setView('meetingDetail')
  }, [])

  const handleIniciarReunion = useCallback(
    async (reunionId: number) => {
      try {
        const result = await iniciarReunionMutation(reunionId).unwrap()
        const { llamada } = result
        joinCallDirect(
          llamada.id,
          llamada.token,
          llamada.livekitUrl,
          llamada.roomName,
        )
      } catch {
        // error manejado por RTK Query
      }
    },
    [iniciarReunionMutation, joinCallDirect],
  )

  const handleShowMembers = () => {
    setView('members')
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
      } catch {
        // error manejado por RTK Query
      }
    },
    [crearConversacionDirecta],
  )

  const handleCreateGroup = useCallback(
    async (nombre: string, participantes: number[]) => {
      try {
        const result = await crearGrupo({ nombre, participantes }).unwrap()
        setActiveConversationId(result.id)
        setView('chat')
      } catch {
        // error manejado por RTK Query
      }
    },
    [crearGrupo],
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleVoiceCall = useCallback(
    (conversacionId: number) => {
      initiateCall(conversacionId, 'voz')
    },
    [initiateCall],
  )

  const handleVideoCall = useCallback(
    (conversacionId: number) => {
      initiateCall(conversacionId, 'video')
    },
    [initiateCall],
  )

  const handleJoinCall = useCallback(
    async (llamadaId: number, _token?: string) => {
      try {
        const data = await fetchToken(llamadaId).unwrap()
        joinCallDirect(llamadaId, data.token, data.livekitUrl, data.roomName)
      } catch {
        // error manejado por RTK Query
      }
    },
    [fetchToken, joinCallDirect],
  )

  const renderContent = () => {
    switch (view) {
      case 'meetingDetail':
        return activeReunionId ? (
          <MeetingDetail
            reunionId={activeReunionId}
            currentUserId={currentUserId ?? undefined}
            onBack={handleBack}
            onClose={onClose}
            onIniciar={handleIniciarReunion}
            onJoin={handleJoinCall}
          />
        ) : null

      case 'meetings':
        return activeConversationId ? (
          <MeetingList
            conversacionId={activeConversationId}
            currentUserId={currentUserId ?? undefined}
            onSelectReunion={handleSelectReunion}
            onBack={handleBack}
            onClose={onClose}
          />
        ) : null

      case 'members':
        return activeConversationId ? (
          <MembersPanel
            conversacionId={activeConversationId}
            currentUserId={currentUserId ?? undefined}
            esSistema={activeConversacion?.sistema ?? false}
            esAdmin={isActiveGroupAdmin}
            nombreGrupo={activeConversacion?.nombre ?? undefined}
            onBack={handleBack}
            onClose={onClose}
          />
        ) : null

      case 'chat':
        return activeConversationId ? (
          <ChatWindow
            conversacionId={activeConversationId}
            currentUserId={currentUserId ?? undefined}
            onBack={handleBack}
            onClose={onClose}
            onShowMembers={handleShowMembers}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
            onShowMeetings={handleShowMeetings}
            onJoinCall={handleJoinCall}
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

      default:
        return (
          <ChatPanel
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onSelectReunion={handleSelectReunion}
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
        width: { xs: '100vw', sm: DRAWER_WIDTH },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'text.primary',
      }}
    >
      {renderContent()}

      <CallModal callState={callState} onEndCall={endCall} />

      <IncomingCallDialog
        callState={callState}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

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
            width: { xs: '100vw', sm: DRAWER_WIDTH },
            boxSizing: 'border-box',
            // MERIDIAN glassmorphism
            background: alpha(theme.meridian.surfaces.ground, 0.92),
            backdropFilter: 'blur(24px) saturate(1.4)',
            borderLeft: `1px solid ${theme.meridian.borders.default}`,
            color: theme.palette.text.primary,
          },
        },
      }}
      transitionDuration={{
        enter: 250,
        exit: 200,
      }}
    >
      <ThemeProvider theme={theme}>
        <ChatErrorBoundary>{drawerContent}</ChatErrorBoundary>
      </ThemeProvider>
    </Drawer>
  )
}

export default ChatDrawer
