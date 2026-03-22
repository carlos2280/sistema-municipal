import {
  useAddComentarioMutation,
  useDeleteComentarioMutation,
  useGetTicketQuery,
} from 'mf_store/store'

export function useTicketDetalle(ticketId: number) {
  const ticketQuery = useGetTicketQuery(ticketId, { skip: !ticketId })
  const [addComentario, addComentarioState] = useAddComentarioMutation()
  const [deleteComentario] = useDeleteComentarioMutation()

  const agregarComentario = async (contenido: string, esInterno: boolean) => {
    await addComentario({ ticketId, contenido, esInterno })
  }

  const eliminarComentario = async (comentarioId: number) => {
    await deleteComentario({ ticketId, comentarioId })
  }

  return {
    ticket: ticketQuery.data ?? null,
    isLoading: ticketQuery.isLoading,
    isFetching: ticketQuery.isFetching,
    agregarComentario,
    isAddingComentario: addComentarioState.isLoading,
    eliminarComentario,
    refetch: ticketQuery.refetch,
  }
}
