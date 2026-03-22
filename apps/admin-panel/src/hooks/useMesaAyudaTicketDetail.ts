import { useQuery } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

export function useMesaAyudaTicketDetail(
  tenantSlug: string,
  ticketId: number,
) {
  return useQuery({
    queryKey: mesaAyudaKeys.ticketDetail(tenantSlug, ticketId),
    queryFn: () => mesaAyuda.ticketDetail(tenantSlug, ticketId),
    enabled: !!tenantSlug && ticketId > 0,
    staleTime: 30_000,
  })
}
