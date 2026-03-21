import { useQuery } from '@tanstack/react-query'
import type { MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState } from 'material-react-table'
import { mesaAyuda } from '../lib/api'
import type { AdminTicketFilters, EstadoTicket, PrioridadCodigo } from '../types/mesa-ayuda'
import { mesaAyudaKeys } from './useMesaAyudaDashboard'

interface UseMesaAyudaTicketsMrtParams {
  pagination: MRT_PaginationState
  sorting: MRT_SortingState
  columnFilters: MRT_ColumnFiltersState
  globalFilter: string
}

function buildFiltersFromMrt(params: UseMesaAyudaTicketsMrtParams): AdminTicketFilters {
  const { pagination, sorting, columnFilters, globalFilter } = params

  const filters: AdminTicketFilters = {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  }

  if (globalFilter) filters.search = globalFilter

  for (const cf of columnFilters) {
    if (cf.id === 'estado' && cf.value) filters.estado = cf.value as EstadoTicket
    if (cf.id === 'prioridadNombre' && cf.value) filters.prioridad = cf.value as PrioridadCodigo
    if (cf.id === 'categoriaNombre' && cf.value) filters.categoria = cf.value as string
    if (cf.id === 'tenantNombre' && cf.value) filters.tenantSlug = cf.value as string
  }

  if (sorting.length > 0) {
    filters.sortBy = sorting[0].id
    filters.sortOrder = sorting[0].desc ? 'desc' : 'asc'
  }

  return filters
}

// Overload 1: MRT server-side params
export function useMesaAyudaTickets(params: UseMesaAyudaTicketsMrtParams): ReturnType<typeof useQuery>
// Overload 2: Simple filters (retrocompatibilidad)
export function useMesaAyudaTickets(filters?: AdminTicketFilters): ReturnType<typeof useQuery>

export function useMesaAyudaTickets(
  paramsOrFilters?: UseMesaAyudaTicketsMrtParams | AdminTicketFilters,
) {
  const isMrtParams = paramsOrFilters != null && 'pagination' in paramsOrFilters

  const filters: AdminTicketFilters = isMrtParams
    ? buildFiltersFromMrt(paramsOrFilters as UseMesaAyudaTicketsMrtParams)
    : (paramsOrFilters as AdminTicketFilters | undefined) ?? {}

  return useQuery({
    queryKey: mesaAyudaKeys.tickets(filters),
    queryFn: () => mesaAyuda.tickets(filters),
  })
}
