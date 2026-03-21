import { baseApi } from "../base/baseApi";

interface Ticket {
  id: number;
  numero: string;
  titulo: string;
  descripcion: string;
  estado: string;
  categoriaId: number;
  categoriaNombre: string | null;
  categoriaColor: string | null;
  prioridadId: number;
  prioridadNombre: string | null;
  prioridadColor: string | null;
  prioridadNivel: number | null;
  solicitanteId: number;
  solicitanteNombre: string;
  solicitanteEmail: string | null;
  asignadoId: number | null;
  asignadoNombre: string | null;
  departamento: string | null;
  fechaLimite: string | null;
  fechaResolucion: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketDetalle extends Ticket {
  categoriaIcono: string | null;
  comentarios: Comentario[];
  historial: HistorialEstado[];
}

interface Comentario {
  id: number;
  ticketId: number;
  autorId: number;
  autorNombre: string;
  contenido: string;
  esInterno: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HistorialEstado {
  id: number;
  ticketId: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivo: string | null;
  ejecutadoPor: number;
  createdAt: string;
}

interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  color: string;
  orden: number;
  activo: boolean;
}

interface Prioridad {
  id: number;
  codigo: string;
  nombre: string;
  color: string;
  nivel: number;
  slaHoras: number;
}

interface TicketStats {
  total: number;
  abiertos: number;
  enProgreso: number;
  enEspera: number;
  resueltos: number;
  cerrados: number;
  vencidosSla: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TicketFilters {
  estado?: string;
  categoriaId?: number;
  prioridadId?: number;
  asignadoId?: number;
  q?: string;
  page?: number;
  limit?: number;
}

interface CreateTicketPayload {
  titulo: string;
  descripcion: string;
  categoriaId: number;
  prioridadId: number;
  departamento?: string;
}

interface UpdateTicketPayload {
  id: number;
  titulo?: string;
  descripcion?: string;
  categoriaId?: number;
  prioridadId?: number;
  departamento?: string | null;
}

interface CreateCategoriaPayload {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string;
  color?: string;
  orden?: number;
}

interface UpdateCategoriaPayload {
  id: number;
  nombre?: string;
  descripcion?: string | null;
  icono?: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}

export const mesaAyudaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tickets
    getTickets: builder.query<PaginatedResponse<Ticket>, TicketFilters>({
      query: (params) => ({
        url: "mesa-ayuda/tickets",
        params,
      }),
      providesTags: ["Ticket"],
    }),

    getTicket: builder.query<TicketDetalle, number>({
      query: (id) => `mesa-ayuda/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),

    createTicket: builder.mutation<Ticket, CreateTicketPayload>({
      query: (data) => ({
        url: "mesa-ayuda/tickets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Ticket", "TicketStats"],
    }),

    updateTicket: builder.mutation<Ticket, UpdateTicketPayload>({
      query: ({ id, ...body }) => ({
        url: `mesa-ayuda/tickets/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ticket", id },
        "Ticket",
      ],
    }),

    changeTicketEstado: builder.mutation<
      Ticket,
      { id: number; estado: string; motivo?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `mesa-ayuda/tickets/${id}/estado`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ticket", id },
        "Ticket",
        "TicketStats",
      ],
    }),

    assignTicket: builder.mutation<
      Ticket,
      { id: number; asignadoId: number; asignadoNombre: string }
    >({
      query: ({ id, ...body }) => ({
        url: `mesa-ayuda/tickets/${id}/asignar`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ticket", id },
        "Ticket",
      ],
    }),

    deleteTicket: builder.mutation<void, number>({
      query: (id) => ({
        url: `mesa-ayuda/tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ticket", "TicketStats"],
    }),

    getTicketStats: builder.query<TicketStats, void>({
      query: () => "mesa-ayuda/tickets/stats",
      providesTags: ["TicketStats"],
    }),

    // Comentarios
    getComentarios: builder.query<Comentario[], number>({
      query: (ticketId) => `mesa-ayuda/tickets/${ticketId}/comentarios`,
      providesTags: (_result, _error, ticketId) => [
        { type: "Comentario", id: ticketId },
      ],
    }),

    addComentario: builder.mutation<
      Comentario,
      { ticketId: number; contenido: string; esInterno: boolean }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `mesa-ayuda/tickets/${ticketId}/comentarios`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: "Comentario", id: ticketId },
        { type: "Ticket", id: ticketId },
      ],
    }),

    deleteComentario: builder.mutation<
      void,
      { ticketId: number; comentarioId: number }
    >({
      query: ({ ticketId, comentarioId }) => ({
        url: `mesa-ayuda/tickets/${ticketId}/comentarios/${comentarioId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: "Comentario", id: ticketId },
      ],
    }),

    // Categorias
    getCategorias: builder.query<Categoria[], void>({
      query: () => "mesa-ayuda/categorias",
      providesTags: ["CategoriaMesaAyuda"],
    }),

    createCategoria: builder.mutation<Categoria, CreateCategoriaPayload>({
      query: (data) => ({
        url: "mesa-ayuda/categorias",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CategoriaMesaAyuda"],
    }),

    updateCategoria: builder.mutation<Categoria, UpdateCategoriaPayload>({
      query: ({ id, ...body }) => ({
        url: `mesa-ayuda/categorias/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CategoriaMesaAyuda"],
    }),

    deleteCategoria: builder.mutation<void, number>({
      query: (id) => ({
        url: `mesa-ayuda/categorias/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CategoriaMesaAyuda"],
    }),

    // Prioridades
    getPrioridades: builder.query<Prioridad[], void>({
      query: () => "mesa-ayuda/prioridades",
      providesTags: ["Prioridad"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useChangeTicketEstadoMutation,
  useAssignTicketMutation,
  useDeleteTicketMutation,
  useGetTicketStatsQuery,
  useGetComentariosQuery,
  useAddComentarioMutation,
  useDeleteComentarioMutation,
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
  useGetPrioridadesQuery,
} = mesaAyudaApi;
