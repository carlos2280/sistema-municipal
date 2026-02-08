/**
 * App.tsx - Solo para desarrollo standalone de mf_chat
 *
 * Este componente se usa cuando ejecutas `pnpm dev` en mf_chat directamente.
 * Muestra el ChatDrawer abierto para poder desarrollar y probar los componentes.
 *
 * Cuando mf_chat se consume desde otro MF (shell), estos componentes
 * heredan el tema y contexto del host - NO usan este App.tsx.
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { MessageSquare } from 'lucide-react'
import { ChatDrawer } from './components/ChatDrawer/ChatDrawer'
import { ChatButton } from './components/shared/ChatButton'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        mf_chat - Desarrollo Standalone
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Este es el entorno de desarrollo del módulo de chat.
        Los componentes heredan el tema de mf_ui.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <Typography variant="subtitle2">ChatButton:</Typography>
        <ChatButton unreadCount={3} onClick={() => setDrawerOpen(true)} />
      </Box>

      <Button
        variant="contained"
        startIcon={<MessageSquare size={18} />}
        onClick={() => setDrawerOpen(true)}
      >
        Abrir Chat Drawer
      </Button>

      <ChatDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  )
}

export default App
