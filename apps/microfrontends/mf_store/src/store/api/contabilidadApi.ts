import { baseApi } from "./baseApi";

interface DataPlanCuenta {
	id: number;
	anoContable?: number;
	codigo: string;
	nombre: string;
	contraCuenta?: string;
	tipoCuentaId: number;
	subgrupoId?: number;
	parentId?: number;
	codigoIni?: string;
}

interface ApiCuenta {
	id: number;
	codigo: string;
	nombre: string;
	hijos: ApiCuenta[];
	tipoCuentaId: number;
	codigoIni?: string;
	idPlanCuenta: number;
	data: DataPlanCuenta;
}

interface ApiNodo {
	id: number;
	codigo: string;
	nombre: string;
	hijos: ApiNodo[];
	cuentas: ApiCuenta[];
	tipoCuentaId: number;
	codigoIni?: string;
}

interface CrearPlanesCuentaRequest {
	anoContable: number;
	codigo: string;
	contraCuenta: string;
	nombre: string;
	tipoCuentaId: number;
	subgrupoId?: number | null;
	parentId?: number | null;
}

interface PlanesCuentaResponse {
	id: number;
	anoContable: number;
	codigo: string;
	nombre: string;
	contraCuenta?: string;
	tipoCuentaId: number;
	subgrupoId?: number | null;
	parentId?: number | null;
}

interface ActualizarPlanesCuentaRequest {
	id: number;
	nombre?: string;
	contraCuenta?: string;
}

interface CuentaResumen {
	id: number;
	codigo: string;
	nombre: string;
}

interface VerificarCodigoRequest {
	anoContable: number;
	codigo: string;
}

interface VerificarCodigoResponse {
	existe: boolean;
	cuenta?: {
		id: number;
		codigo: string;
		nombre: string;
	};
}

export const contabilidadApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getBalanceGeneral: builder.query<{ total: number }, void>({
			query: () => "contabilidad/balance-general",
		}),
		getLibroMayor: builder.query<{ cuentas: string[] }, void>({
			query: () => "contabilidad/libro-mayor",
		}),
		obtenerArbolCompleto: builder.query<ApiNodo[], void>({
			query: () => "contabilidad/plan-cuentas/arbol-completo",
			providesTags: ["PlanCuentas"],
		}),
		crearPlanesCuenta: builder.mutation<PlanesCuentaResponse, CrearPlanesCuentaRequest>({
			query: (data) => ({
				url: "contabilidad/plan-cuentas",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["PlanCuentas"],
		}),
		actualizarPlanesCuenta: builder.mutation<void, ActualizarPlanesCuentaRequest>({
			query: ({ id, ...body }) => ({
				url: `contabilidad/plan-cuentas/${id}`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: ["PlanCuentas"],
		}),
		eliminarPlanesCuenta: builder.mutation<void, number>({
			query: (id) => ({
				url: `contabilidad/plan-cuentas/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["PlanCuentas"],
		}),
		// Verificar si un código de cuenta ya existe
		verificarCodigoExiste: builder.query<
			VerificarCodigoResponse,
			VerificarCodigoRequest
		>({
			query: ({ anoContable, codigo }) =>
				`contabilidad/plan-cuentas/verificar-codigo?anoContable=${anoContable}&codigo=${codigo}`,
			providesTags: ["PlanCuentas"],
		}),
		// Buscar cuentas por prefijo (para selector de contraCuenta)
		buscarCuentasPorPrefijo: builder.query<CuentaResumen[], string>({
			query: (prefijo) =>
				`contabilidad/plan-cuentas/buscar-por-prefijo?prefijo=${prefijo}`,
			providesTags: ["PlanCuentas"],
		}),
	}),
	overrideExisting: false,
});

export const {
	useGetBalanceGeneralQuery,
	useGetLibroMayorQuery,
	useObtenerArbolCompletoQuery,
	useCrearPlanesCuentaMutation,
	useActualizarPlanesCuentaMutation,
	useEliminarPlanesCuentaMutation,
	useLazyVerificarCodigoExisteQuery,
	useLazyBuscarCuentasPorPrefijoQuery,
} = contabilidadApi;

// Exportar tipos para uso externo
export type { VerificarCodigoResponse, CuentaResumen, PlanesCuentaResponse };
