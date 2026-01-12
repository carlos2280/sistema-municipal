import { baseApi } from "./baseApi";

// Tipos para los indicadores económicos
export interface IndicadorFinanciero {
	codigo: string;
	nombre: string;
	unidad_medida: string;
	fecha: string;
	valor: number;
}

export interface IndicadoresResponse {
	version: string;
	autor: string;
	fecha: string;
	uf: IndicadorFinanciero;
	ivp: IndicadorFinanciero;
	dolar: IndicadorFinanciero;
	dolar_intercambio: IndicadorFinanciero;
	euro: IndicadorFinanciero;
	ipc: IndicadorFinanciero;
	utm: IndicadorFinanciero;
	imacec: IndicadorFinanciero;
	tpm: IndicadorFinanciero;
	libra_cobre: IndicadorFinanciero;
	tasa_desempleo: IndicadorFinanciero;
	bitcoin: IndicadorFinanciero;
}

// Tipos simplificados para el frontend
export interface IndicadoresSimplificados {
	uf: number;
	usd: number;
	euro: number;
	utm: number;
	fecha: string;
}

export const indicadoresApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Obtener todos los indicadores desde API pública de mindicador.cl
		obtenerIndicadores: builder.query<IndicadoresSimplificados, void>({
			queryFn: async () => {
				try {
					// API pública de mindicador.cl (indicadores económicos de Chile)
					const response = await fetch("https://mindicador.cl/api");

					if (!response.ok) {
						throw new Error("Error al obtener indicadores");
					}

					const data: IndicadoresResponse = await response.json();

					// Simplificar la respuesta con solo los indicadores que necesitamos
					const indicadoresSimplificados: IndicadoresSimplificados = {
						uf: data.uf?.valor || 0,
						usd: data.dolar?.valor || 0,
						euro: data.euro?.valor || 0,
						utm: data.utm?.valor || 0,
						fecha: data.fecha || new Date().toISOString(),
					};

					return { data: indicadoresSimplificados };
				} catch (error) {
					return {
						error: {
							status: "FETCH_ERROR",
							error: String(error),
						},
					};
				}
			},
			// Cachear por 5 minutos (los indicadores se actualizan diariamente)
			keepUnusedDataFor: 300,
		}),

		// Obtener historial de un indicador específico
		obtenerHistorialIndicador: builder.query<
			IndicadorFinanciero[],
			{ codigo: string; year?: number }
		>({
			queryFn: async ({ codigo, year }) => {
				try {
					const url = year
						? `https://mindicador.cl/api/${codigo}/${year}`
						: `https://mindicador.cl/api/${codigo}`;

					const response = await fetch(url);

					if (!response.ok) {
						throw new Error(`Error al obtener historial de ${codigo}`);
					}

					const data = await response.json();

					return { data: data.serie || [] };
				} catch (error) {
					return {
						error: {
							status: "FETCH_ERROR",
							error: String(error),
						},
					};
				}
			},
			keepUnusedDataFor: 300,
		}),
	}),
	overrideExisting: false,
});

export const { useObtenerIndicadoresQuery, useObtenerHistorialIndicadorQuery } =
	indicadoresApi;
