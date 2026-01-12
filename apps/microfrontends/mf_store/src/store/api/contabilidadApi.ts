import { baseApi } from "./baseApi";

interface DataPlanCuenta {
	id: number;
	anoContable?: number;
	codigo: string;
	nombre: string;
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
	Contracuenta: string;
	nombre: string;
	tipoCuentaId: number;
	subgrupoId?: number | null;
	parentId?: number | null;
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
		crearPlanesCuenta: builder.mutation<void, CrearPlanesCuentaRequest>({
			query: (data) => ({
				url: "contabilidad/plan-cuentas",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["PlanCuentas"],
		}),
	}),
	overrideExisting: false,
});

export const {
	useGetBalanceGeneralQuery,
	useGetLibroMayorQuery,
	useObtenerArbolCompletoQuery,
	useCrearPlanesCuentaMutation,
} = contabilidadApi;
