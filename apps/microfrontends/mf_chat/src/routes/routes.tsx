import type { RouteObject } from 'react-router-dom'
import { ChatPage } from '../pages/ChatPage'
import { VideoCallPage } from '../pages/VideoCallPage'

/**
 * Rutas expuestas por mf_chat para consumo desde mf_shell
 */
export const chatRoutes: RouteObject[] = [
  {
    path: 'chat',
    element: <ChatPage />,
  },
  {
    path: 'chat/:conversacionId',
    element: <ChatPage />,
  },
  {
    path: 'videocall/:callId',
    element: <VideoCallPage />,
  },
]

export default chatRoutes
