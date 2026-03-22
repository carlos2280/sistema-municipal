import { useGetTicketStatsQuery } from 'mf_store/store';

export function useTicketStats() {
  const { data, isLoading, isFetching, refetch } = useGetTicketStatsQuery();

  const stats = data ?? {
    total: 0,
    abiertos: 0,
    enProgreso: 0,
    enEspera: 0,
    resueltos: 0,
    cerrados: 0,
    vencidosSla: 0,
  };

  return {
    stats,
    isLoading,
    isFetching,
    refetch,
  };
}
