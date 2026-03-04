import { baseApi } from "./baseApi";

// ============================================================================
// Types — espejo del OrgDireccion del backend
// ============================================================================

export interface OrgUsuario {
  id: number;
  nombre: string;
  email: string;
}

export interface OrgOficina {
  id: number;
  nombre: string;
  responsable: string;
  usuarios: OrgUsuario[];
}

export interface OrgDepartamento {
  id: number;
  nombre: string;
  responsable: string;
  oficinas: OrgOficina[];
}

export interface OrgDireccion {
  id: number;
  nombre: string;
  responsable: string;
  departamentos: OrgDepartamento[];
}

// ============================================================================
// API
// ============================================================================

export const identidadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganigrama: builder.query<OrgDireccion[], void>({
      query: () => "identidad/organigrama",
      providesTags: ["Organigrama"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrganigramaQuery } = identidadApi;
