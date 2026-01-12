import { createApi } from "@reduxjs/toolkit/query/react";
import type {
	Areas,
	ContrasenaTemporal,
	Login,
	UsuarioConMenuResponse,
} from "../../types/login";
import { baseQueryRefresh } from "../api/baseApi";
import { loggedOut, tokenReceived } from "../features/authSlice";

export type ResponseCambioContrasena = {
	success: boolean;
	mensaje: string;
	email: string;
};
export const authApi = createApi({
	reducerPath: "authApi", // Nombre único para este slice de API
	baseQuery: baseQueryRefresh, // Usa directamente el baseQuery sin reauth
	tagTypes: ["Auth"], // Tags para gestión de cache
	endpoints: (builder) => ({
		loginAreas: builder.mutation<Areas[], Omit<Login, "areaId" | "sistemaId">>({
			query: (body) => ({
				url: "/autorizacion/areas",
				method: "POST",
				body,
			}),
		}),
		loginSistemas: builder.mutation<Areas[], Login>({
			query: (body) => ({
				url: "/autorizacion/sistemas",
				method: "POST",
				body,
			}),
		}),

		login: builder.mutation<UsuarioConMenuResponse, Login>({
			query: (body) => ({
				url: "/autorizacion/login",
				method: "POST",
				body,
			}),
			async onQueryStarted(args, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(
						tokenReceived({
							accessToken: "cookie",
							sistemaId: args.sistemaId,
							areaId: args.areaId,
						}),
					);
				} catch {
					dispatch(loggedOut());
				}
			},
		}),

		verficarToken: builder.query<void, void>({
			query: () => "/autorizacion/verficar-token",
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					// Recuperar sistemaId y areaId del localStorage
					const sistemaId = localStorage.getItem("sistemaId");
					const areaId = localStorage.getItem("areaId");

					dispatch(
						tokenReceived({
							accessToken: "cookie",
							sistemaId: sistemaId ? Number(sistemaId) : undefined,
							areaId: areaId ? Number(areaId) : undefined,
						}),
					);
				} catch {
					dispatch(loggedOut());
				}
			},
		}),

		contrasenaTemporal: builder.query<
			ResponseCambioContrasena,
			{ token: string }
		>({
			query: ({ token }) => `/autorizacion/contrasena-temporal?token=${token}`,
		}),

		cambiarContrasenaTemporal: builder.mutation<
			ResponseCambioContrasena,
			{ body: ContrasenaTemporal; token: string }
		>({
			query: ({ body, token }) => ({
				url: "/autorizacion/cambiar-contrasena-temporal",
				method: "POST",
				body,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}),
		}),
	}),
});

export const {
	useLoginAreasMutation,
	useLoginMutation,
	useLoginSistemasMutation,
	useVerficarTokenQuery,
	useContrasenaTemporalQuery,
	useCambiarContrasenaTemporalMutation,
} = authApi;
