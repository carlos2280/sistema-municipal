import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mesaAyuda } from '../lib/api'
import type { CreateCategoriaInput, UpdateCategoriaInput } from '../types/mesa-ayuda'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

export function useMesaAyudaCategorias() {
  return useQuery({
    queryKey: mesaAyudaKeys.categorias(),
    queryFn: mesaAyuda.categorias.list,
    staleTime: 120_000,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoriaInput) => mesaAyuda.categorias.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.categorias() })
    },
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaInput }) =>
      mesaAyuda.categorias.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.categorias() })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => mesaAyuda.categorias.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mesaAyudaKeys.categorias() })
    },
  })
}
