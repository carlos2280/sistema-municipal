import { useQuery } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import type { AdminTicketFilters } from '../types/mesa-ayuda'

export const mesaAyudaKeys = {
  all: ['mesa-ayuda'] as const,
  dashboard: () => ['mesa-ayuda', 'dashboard'] as const,
  tickets: (filters?: AdminTicketFilters) =>
    ['mesa-ayuda', 'tickets', filters] as const,
  ticketDetail: (tenantSlug: string, ticketId: number) =>
    ['mesa-ayuda', 'ticket', tenantSlug, ticketId] as const,
  sla: () => ['mesa-ayuda', 'sla'] as const,
  tenants: () => ['mesa-ayuda', 'tenants'] as const,
  categorias: () => ['mesa-ayuda', 'categorias'] as const,
  prioridades: () => ['mesa-ayuda', 'prioridades'] as const,
}

export function useMesaAyudaDashboard() {
  return useQuery({
    queryKey: mesaAyudaKeys.dashboard(),
    queryFn: mesaAyuda.dashboard,
    staleTime: 60_000,
  })
}
