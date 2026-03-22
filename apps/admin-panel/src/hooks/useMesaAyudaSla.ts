import { useQuery } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

export function useMesaAyudaSla() {
  return useQuery({
    queryKey: mesaAyudaKeys.sla(),
    queryFn: mesaAyuda.sla,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })
}
