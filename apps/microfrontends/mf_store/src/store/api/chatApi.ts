import { baseApi } from "./baseApi";

// ============ TIPOS ============

export interface Usuario {
	id: number;
	nombreCompleto: string;
	email: string;
	avatarUrl?: string;
}

export interface Participante {
	id: number;
	usuarioId: number;
	conversacionId: number;
	rol: "admin" | "miembro";
	silenciado: boolean;
	ultimaLectura?: string;
	usuario: Usuario;
}

export interface UltimoMensaje {
	id: number;
	contenido: string;
	tipo: string;
	createdAt: string;
	remitente: {
		id: number;
		nombreCompleto: string;
	};
}

export interface Conversacion {
	id: number;
	tipo: "directa" | "grupo";
	nombre?: string;
	descripcion?: string;
	avatarUrl?: string;
	activo: boolean;
	creadorId: number;
	sistema?: boolean;
	departamentoId?: number;
	createdAt: string;
	updatedAt: string;
	participantes: Participante[];
	ultimoMensaje?: UltimoMensaje;
	mensajesNoLeidos: number;
}

export interface Archivo {
	id: number;
	nombre: string;
	tipo: string;
	tamanio: number;
	url: string;
	thumbnailUrl?: string;
}

export interface Mensaje {
	id: number;
	conversacionId: number;
	remitenteId: number;
	contenido: string;
	tipo: "texto" | "archivo" | "imagen" | "sistema";
	replyToId?: number;
	editado: boolean;
	eliminado: boolean;
	createdAt: string;
	updatedAt: string;
	remitente: Usuario;
	archivos?: Archivo[];
}

export interface MensajesResponse {
	mensajes: Mensaje[];
	nextCursor?: string;
}

// ============ REQUESTS ============

export interface CrearConversacionDirectaRequest {
	destinatarioId: number;
}

export interface CrearGrupoRequest {
	nombre: string;
	descripcion?: string;
	participantes: number[];
}

export interface ObtenerMensajesRequest {
	conversacionId: number;
	cursor?: string;
}

export interface CrearMensajeRequest {
	conversacionId: number;
	contenido: string;
	tipo?: "texto" | "archivo" | "imagen";
	replyToId?: number;
}

export interface EditarMensajeRequest {
	id: number;
	contenido: string;
}

export interface BuscarUsuariosRequest {
	q?: string;
	limit?: number;
}

// ============ API ============

export const chatApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Usuarios
		buscarUsuarios: builder.query<Usuario[], BuscarUsuariosRequest>({
			query: ({ q = "", limit = 20 }) => {
				const params = new URLSearchParams();
				if (q) params.append("q", q);
				params.append("limit", limit.toString());
				return `chat/usuarios?${params.toString()}`;
			},
			transformResponse: (response: { success: boolean; data: Usuario[] }) =>
				response.data,
		}),

		// Conversaciones
		obtenerConversaciones: builder.query<Conversacion[], void>({
			query: () => "chat/conversaciones",
			transformResponse: (response: { success: boolean; data: Conversacion[] }) =>
				response.data,
			providesTags: ["Conversaciones"],
		}),

		obtenerConversacion: builder.query<Conversacion, number>({
			query: (id) => `chat/conversaciones/${id}`,
			transformResponse: (response: {
				success: boolean;
				data: Conversacion;
			}) => response.data,
			providesTags: (_result, _error, id) => [
				{ type: "Conversaciones", id },
			],
		}),

		crearConversacionDirecta: builder.mutation<
			Conversacion,
			CrearConversacionDirectaRequest
		>({
			query: (data) => ({
				url: "chat/conversaciones/directa",
				method: "POST",
				body: data,
			}),
			transformResponse: (response: {
				success: boolean;
				data: Conversacion;
			}) => response.data,
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data: newConversacion } = await queryFulfilled;
					dispatch(
						chatApi.util.updateQueryData(
							"obtenerConversaciones",
							undefined,
							(draft) => {
								if (!draft.find((c) => c.id === newConversacion.id)) {
									draft.unshift(newConversacion);
								}
							},
						),
					);
				} catch {
					// Error handled by mutation caller
				}
			},
			invalidatesTags: ["Conversaciones"],
		}),

		crearGrupo: builder.mutation<Conversacion, CrearGrupoRequest>({
			query: (data) => ({
				url: "chat/conversaciones/grupo",
				method: "POST",
				body: data,
			}),
			transformResponse: (response: {
				success: boolean;
				data: Conversacion;
			}) => response.data,
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data: newConversacion } = await queryFulfilled;
					dispatch(
						chatApi.util.updateQueryData(
							"obtenerConversaciones",
							undefined,
							(draft) => {
								if (!draft.find((c) => c.id === newConversacion.id)) {
									draft.unshift(newConversacion);
								}
							},
						),
					);
				} catch {
					// Error handled by mutation caller
				}
			},
			invalidatesTags: ["Conversaciones"],
		}),

		// Mensajes
		obtenerMensajes: builder.query<MensajesResponse, ObtenerMensajesRequest>({
			query: ({ conversacionId, cursor }) => {
				const params = cursor ? `?cursor=${cursor}` : "";
				return `chat/conversaciones/${conversacionId}/mensajes${params}`;
			},
			transformResponse: (response: {
				success: boolean;
				data: Mensaje[];
				nextCursor?: number | string;
			}): MensajesResponse => ({
				mensajes: response.data,
				nextCursor: response.nextCursor?.toString(),
			}),
			providesTags: (_result, _error, { conversacionId }) => [
				{ type: "Mensajes", id: conversacionId },
			],
		}),

		crearMensaje: builder.mutation<Mensaje, CrearMensajeRequest>({
			query: ({ conversacionId, ...body }) => ({
				url: `chat/conversaciones/${conversacionId}/mensajes`,
				method: "POST",
				body,
			}),
			invalidatesTags: (_result, _error, { conversacionId }) => [
				{ type: "Mensajes", id: conversacionId },
				"Conversaciones", // Para actualizar el último mensaje
			],
		}),

		editarMensaje: builder.mutation<Mensaje, EditarMensajeRequest>({
			query: ({ id, contenido }) => ({
				url: `chat/mensajes/${id}`,
				method: "PUT",
				body: { contenido },
			}),
			invalidatesTags: ["Mensajes"],
		}),

		eliminarMensaje: builder.mutation<void, number>({
			query: (id) => ({
				url: `chat/mensajes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Mensajes"],
		}),

		// Participantes
		obtenerParticipantes: builder.query<Participante[], number>({
			query: (conversacionId) =>
				`chat/conversaciones/${conversacionId}/participantes`,
			transformResponse: (response: {
				success: boolean;
				data: Participante[];
			}) => response.data,
			providesTags: (_result, _error, id) => [
				{ type: "Participantes", id },
			],
		}),

		agregarParticipante: builder.mutation<
			void,
			{ conversacionId: number; usuarioId: number }
		>({
			query: ({ conversacionId, usuarioId }) => ({
				url: `chat/conversaciones/${conversacionId}/participantes`,
				method: "POST",
				body: { usuarioId },
			}),
			invalidatesTags: (_result, _error, { conversacionId }) => [
				{ type: "Participantes", id: conversacionId },
				"Conversaciones",
			],
		}),

		eliminarParticipante: builder.mutation<
			void,
			{ conversacionId: number; usuarioId: number }
		>({
			query: ({ conversacionId, usuarioId }) => ({
				url: `chat/conversaciones/${conversacionId}/participantes/${usuarioId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { conversacionId }) => [
				{ type: "Participantes", id: conversacionId },
				"Conversaciones",
			],
		}),

		// Renombrar grupo
		renombrarGrupo: builder.mutation<
			void,
			{ conversacionId: number; nombre: string }
		>({
			query: ({ conversacionId, nombre }) => ({
				url: `chat/conversaciones/${conversacionId}/nombre`,
				method: "PATCH",
				body: { nombre },
			}),
			invalidatesTags: ["Conversaciones"],
		}),

		// Grupos del sistema
		sincronizarGruposSistema: builder.mutation<
			{ created: number[]; updated: number[] },
			void
		>({
			query: () => ({
				url: "chat/grupos-sistema/sync",
				method: "POST",
			}),
			transformResponse: (response: {
				success: boolean;
				data: { created: number[]; updated: number[] };
			}) => response.data,
			invalidatesTags: ["Conversaciones"],
		}),
	}),
	overrideExisting: false,
});

// ============ HOOKS EXPORTADOS ============

export const {
	// Usuarios
	useBuscarUsuariosQuery,
	useLazyBuscarUsuariosQuery,
	// Conversaciones
	useObtenerConversacionesQuery,
	useObtenerConversacionQuery,
	useLazyObtenerConversacionQuery,
	useCrearConversacionDirectaMutation,
	useCrearGrupoMutation,
	// Mensajes
	useObtenerMensajesQuery,
	useLazyObtenerMensajesQuery,
	useCrearMensajeMutation,
	useEditarMensajeMutation,
	useEliminarMensajeMutation,
	// Participantes
	useObtenerParticipantesQuery,
	useAgregarParticipanteMutation,
	useEliminarParticipanteMutation,
	// Grupos
	useRenombrarGrupoMutation,
	useSincronizarGruposSistemaMutation,
} = chatApi;
