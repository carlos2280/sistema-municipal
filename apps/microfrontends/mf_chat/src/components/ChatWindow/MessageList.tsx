import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { Mensaje } from 'mf_store/store'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'

const MESSAGES_PER_PAGE = 50

interface MessageListProps {
  mensajes: Mensaje[]
  currentUserId?: number
  typingUsers?: string[]
}

// Función para formatear fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Hoy'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer'
  }
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

// Función para formatear hora
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Agrupar mensajes por fecha
function groupMessagesByDate(mensajes: Mensaje[]): Record<string, Mensaje[]> {
  return mensajes.reduce(
    (acc, msg) => {
      const fecha = formatDate(msg.createdAt)
      if (!acc[fecha]) {
        acc[fecha] = []
      }
      acc[fecha].push(msg)
      return acc
    },
    {} as Record<string, Mensaje[]>
  )
}

export function MessageList({
  mensajes,
  currentUserId,
  typingUsers = [],
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE)

  // Resetear visible count cuando cambia la conversación (mensajes se vacían)
  const prevLengthRef = useRef(mensajes.length)
  useEffect(() => {
    if (mensajes.length < prevLengthRef.current) {
      setVisibleCount(MESSAGES_PER_PAGE)
    }
    prevLengthRef.current = mensajes.length
  }, [mensajes.length])

  // Scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes.length])

  // Solo renderizar los últimos N mensajes para evitar degradación del DOM
  const visibleMensajes = useMemo(() => {
    if (mensajes.length <= visibleCount) return mensajes
    return mensajes.slice(mensajes.length - visibleCount)
  }, [mensajes, visibleCount])

  const hasHiddenMessages = mensajes.length > visibleCount

  const messagesByDate = groupMessagesByDate(visibleMensajes)

  if (mensajes.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography color="text.secondary">
          No hay mensajes aún. ¡Inicia la conversación!
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        px: 2.5,
        py: 2,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {hasHiddenMessages && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setVisibleCount((prev) => prev + MESSAGES_PER_PAGE)}
            sx={{ fontSize: 12, textTransform: 'none' }}
          >
            Cargar mensajes anteriores
          </Button>
        </Box>
      )}

      {Object.entries(messagesByDate).map(([fecha, msgs]) => (
        <Box key={fecha}>
          {/* Date Divider */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                bgcolor: 'background.paper',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              {fecha}
            </Typography>
          </Box>

          {/* Messages */}
          {msgs.map((msg) => (
            <MessageBubble
              key={msg.id}
              contenido={msg.contenido}
              esPropio={msg.remitenteId === currentUserId}
              hora={formatTime(msg.createdAt)}
              remitente={msg.remitente?.nombreCompleto}
              archivo={
                msg.archivos?.[0]
                  ? {
                      nombre: msg.archivos[0].nombre,
                      tamanio: `${(msg.archivos[0].tamanio / 1024 / 1024).toFixed(1)} MB`,
                    }
                  : undefined
              }
            />
          ))}
        </Box>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 1, py: 0.5 }}>
          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            Escribiendo...
          </Typography>
        </Box>
      )}

      <div ref={bottomRef} />
    </Box>
  )
}
