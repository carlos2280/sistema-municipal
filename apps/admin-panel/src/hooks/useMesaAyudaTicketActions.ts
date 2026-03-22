import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import type {
  AgregarComentarioInput,
  AsignarTicketInput,
  CambiarCategoriaInput,
  CambiarEstadoInput,
  CambiarPrioridadInput,
} from '../types/mesa-ayuda'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

interface TicketMutationContext {
  tenantSlug: string
  ticketId: number
}

export function useCambiarEstado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantSlug,
      ticketId,
      data,
    }: TicketMutationContext & { data: CambiarEstadoInput }) =>
      mesaAyuda.cambiarEstado(tenantSlug, ticketId, data),
    onSuccess: (_result, { tenantSlug, ticketId }) => {
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
      })
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.tickets() })
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.dashboard(),
      })
    },
  })
}

export function useAsignarTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantSlug,
      ticketId,
      data,
    }: TicketMutationContext & { data: AsignarTicketInput }) =>
      mesaAyuda.asignarTicket(tenantSlug, ticketId, data),
    onSuccess: (_result, { tenantSlug, ticketId }) => {
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
      })
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.tickets() })
    },
  })
}

export function useCambiarPrioridad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantSlug,
      ticketId,
      data,
    }: TicketMutationContext & { data: CambiarPrioridadInput }) =>
      mesaAyuda.cambiarPrioridad(tenantSlug, ticketId, data),
    onSuccess: (_result, { tenantSlug, ticketId }) => {
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
      })
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.tickets() })
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.sla() })
    },
  })
}

export function useCambiarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantSlug,
      ticketId,
      data,
    }: TicketMutationContext & { data: CambiarCategoriaInput }) =>
      mesaAyuda.cambiarCategoria(tenantSlug, ticketId, data),
    onSuccess: (_result, { tenantSlug, ticketId }) => {
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
      })
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.tickets() })
    },
  })
}

export function useAgregarComentario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantSlug,
      ticketId,
      data,
    }: TicketMutationContext & { data: AgregarComentarioInput }) =>
      mesaAyuda.agregarComentario(tenantSlug, ticketId, data),
    onSuccess: (_result, { tenantSlug, ticketId }) => {
      void queryClient.invalidateQueries({
        queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
      })
    },
  })
}
