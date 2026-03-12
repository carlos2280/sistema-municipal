import {
  type EstadoInvitacion,
  type Reunion,
  type ReunionConInvitaciones,
  chatApi,
  useAppDispatch,
  useCancelarReunionMutation,
  useCrearReunionMutation,
  useEditarReunionMutation,
  useIniciarReunionMutation,
  useListarReunionesQuery,
  useRsvpReunionMutation,
} from 'mf_store/store'
import { useCallback, useEffect } from 'react'
import type {
  CreateReunionInput,
  MeetingCancelledPayload,
  MeetingCreatedPayload,
  MeetingRsvpPayload,
  MeetingStartingPayload,
  MeetingUpdatedPayload,
  UpdateReunionInput,
} from '../types/meeting.types'
import { useSocket } from './useSocket'

interface UseMeetingsOptions {
  conversacionId: number
  onReminder?: (reunion: Reunion, minutosRestantes: number) => void
  onStarting?: (reunion: Reunion, llamadaId: number) => void
}

interface UseMeetingsReturn {
  reuniones: Reunion[]
  isLoading: boolean
  crearReunion: (data: CreateReunionInput) => Promise<ReunionConInvitaciones>
  editarReunion: (id: number, data: UpdateReunionInput) => Promise<Reunion>
  cancelarReunion: (id: number) => Promise<void>
  responderInvitacion: (id: number, estado: EstadoInvitacion) => Promise<void>
  iniciarReunion: (id: number) => Promise<{ token: string; livekitUrl: string; roomName: string }>
}

export function useMeetings({
  conversacionId,
  onReminder,
  onStarting,
}: UseMeetingsOptions): UseMeetingsReturn {
  const { data: reuniones = [], isLoading } = useListarReunionesQuery(conversacionId)
  const { socket } = useSocket()
  const dispatch = useAppDispatch() as (action: { type: string; payload?: unknown }) => void

  const [crearMutation] = useCrearReunionMutation()
  const [editarMutation] = useEditarReunionMutation()
  const [cancelarMutation] = useCancelarReunionMutation()
  const [rsvpMutation] = useRsvpReunionMutation()
  const [iniciarMutation] = useIniciarReunionMutation()

  // ─── Socket events ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return

    const handleCreated = (payload: MeetingCreatedPayload) => {
      if (payload.conversacionId === conversacionId) {
        dispatch(chatApi.util.invalidateTags([{ type: 'Reuniones' as const, id: conversacionId }]))
      }
    }

    const handleUpdated = (payload: MeetingUpdatedPayload) => {
      if (payload.conversacionId === conversacionId) {
        dispatch(chatApi.util.invalidateTags([{ type: 'Reuniones' as const, id: payload.reunion.id }]))
      }
    }

    const handleCancelled = (payload: MeetingCancelledPayload) => {
      if (payload.conversacionId === conversacionId) {
        dispatch(chatApi.util.invalidateTags([{ type: 'Reuniones' as const, id: payload.reunionId }]))
      }
    }

    const handleRsvp = (payload: MeetingRsvpPayload) => {
      // Actualizar cache de la reunión específica para todos los dispositivos
      dispatch(chatApi.util.invalidateTags([{ type: 'Reuniones' as const, id: payload.reunionId }]))
    }

    const handleReminder = (payload: { reunion: Reunion; minutosRestantes: number }) => {
      onReminder?.(payload.reunion, payload.minutosRestantes)
    }

    const handleStarting = (payload: MeetingStartingPayload) => {
      onStarting?.(payload.reunion, payload.llamadaId)
      // Invalidar cache para que todos los dispositivos refetchen la reunión
      // con el llamadaId actualizado (necesario para que "Unirse" funcione)
      dispatch(chatApi.util.invalidateTags([{ type: 'Reuniones' as const, id: payload.reunion.id }]))
    }

    socket.on('meeting:created', handleCreated)
    socket.on('meeting:updated', handleUpdated)
    socket.on('meeting:cancelled', handleCancelled)
    socket.on('meeting:rsvp', handleRsvp)
    socket.on('meeting:reminder', handleReminder)
    socket.on('meeting:starting', handleStarting)

    return () => {
      socket.off('meeting:created', handleCreated)
      socket.off('meeting:updated', handleUpdated)
      socket.off('meeting:cancelled', handleCancelled)
      socket.off('meeting:rsvp', handleRsvp)
      socket.off('meeting:reminder', handleReminder)
      socket.off('meeting:starting', handleStarting)
    }
  }, [socket, conversacionId, onReminder, onStarting])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const crearReunion = useCallback(
    async (data: CreateReunionInput): Promise<ReunionConInvitaciones> => {
      return crearMutation({ conversacionId, ...data }).unwrap()
    },
    [crearMutation, conversacionId]
  )

  const editarReunion = useCallback(
    async (id: number, data: UpdateReunionInput): Promise<Reunion> => {
      return editarMutation({ id, ...data }).unwrap()
    },
    [editarMutation]
  )

  const cancelarReunion = useCallback(
    async (id: number): Promise<void> => {
      await cancelarMutation(id).unwrap()
    },
    [cancelarMutation]
  )

  const responderInvitacion = useCallback(
    async (id: number, estado: EstadoInvitacion): Promise<void> => {
      await rsvpMutation({ id, estado }).unwrap()
    },
    [rsvpMutation]
  )

  const iniciarReunion = useCallback(
    async (id: number) => {
      const response = await iniciarMutation(id).unwrap()
      return response.llamada
    },
    [iniciarMutation]
  )

  return {
    reuniones,
    isLoading,
    crearReunion,
    editarReunion,
    cancelarReunion,
    responderInvitacion,
    iniciarReunion,
  }
}
