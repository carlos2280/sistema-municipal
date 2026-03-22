import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import type { UpdatePrioridadInput } from '../types/mesa-ayuda'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

export function useMesaAyudaPrioridades() {
  return useQuery({
    queryKey: mesaAyudaKeys.prioridades(),
    queryFn: mesaAyuda.prioridades.list,
    staleTime: 120_000,
  })
}

export function useActualizarPrioridad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePrioridadInput }) =>
      mesaAyuda.prioridades.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.prioridades() })
    },
  })
}
