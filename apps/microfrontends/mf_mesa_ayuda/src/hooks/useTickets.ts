import type { TicketFilters } from '@/types/mesa-ayuda.types'
import { useGetTicketStatsQuery, useGetTicketsQuery } from 'mf_store/store'
import { useCallback, useState } from 'react'

const DEFAULT_LIMIT = 20

export function useTickets() {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: DEFAULT_LIMIT,
  })

  const ticketsQuery = useGetTicketsQuery(filters)
  const statsQuery = useGetTicketStatsQuery()

  const updateFilters = useCallback((newFilters: Partial<TicketFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: DEFAULT_LIMIT })
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  return {
    tickets: ticketsQuery.data?.data ?? [],
    total: ticketsQuery.data?.total ?? 0,
    totalPages: ticketsQuery.data?.totalPages ?? 0,
    currentPage: filters.page ?? 1,
    isLoading: ticketsQuery.isLoading,
    isFetching: ticketsQuery.isFetching,
    stats: statsQuery.data ?? null,
    statsLoading: statsQuery.isLoading,
    filters,
    updateFilters,
    clearFilters,
    goToPage,
    refetch: ticketsQuery.refetch,
  }
}
