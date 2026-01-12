import { baseApi } from "./baseApi";

export const tesoreriaApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getRecaudaciones: builder.query<{ monto: number }[], void>({
			query: () => "tesoreria/recaudaciones",
		}),
		getPagosPendientes: builder.query<
			{ proveedor: string; monto: number }[],
			void
		>({
			query: () => "tesoreria/pagos-pendientes",
		}),
	}),
	overrideExisting: false,
});

export const { useGetRecaudacionesQuery, useGetPagosPendientesQuery } =
	tesoreriaApi;
