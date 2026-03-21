import {
  useGetTicketQuery,
  useChangeTicketEstadoMutation,
  useAssignTicketMutation,
  useAddComentarioMutation,
  useDeleteComentarioMutation,
} from 'mf_store/store';
import type { EstadoTicket } from '@/types/mesa-ayuda.types';

export function useTicketDetalle(ticketId: number) {
  const ticketQuery = useGetTicketQuery(ticketId, { skip: !ticketId });
  const [changeEstado, changeEstadoState] = useChangeTicketEstadoMutation();
  const [assignTicket, assignState] = useAssignTicketMutation();
  const [addComentario, addComentarioState] = useAddComentarioMutation();
  const [deleteComentario] = useDeleteComentarioMutation();

  const cambiarEstado = async (estado: EstadoTicket, motivo?: string) => {
    await changeEstado({ id: ticketId, estado, motivo });
  };

  const asignar = async (asignadoId: number, asignadoNombre: string) => {
    await assignTicket({ id: ticketId, asignadoId, asignadoNombre });
  };

  const agregarComentario = async (contenido: string, esInterno: boolean) => {
    await addComentario({ ticketId, contenido, esInterno });
  };

  const eliminarComentario = async (comentarioId: number) => {
    await deleteComentario({ ticketId, comentarioId });
  };

  return {
    ticket: ticketQuery.data ?? null,
    isLoading: ticketQuery.isLoading,
    isFetching: ticketQuery.isFetching,
    cambiarEstado,
    isChangingEstado: changeEstadoState.isLoading,
    asignar,
    isAssigning: assignState.isLoading,
    agregarComentario,
    isAddingComentario: addComentarioState.isLoading,
    eliminarComentario,
    refetch: ticketQuery.refetch,
  };
}
