import { baseApi } from "./baseApi";

export type MfaPolicy = "required" | "optional" | "disabled";

export interface UsuarioMfaStatus {
  id: number;
  email: string;
  nombreCompleto: string;
  mfaEnabled: boolean;
  mfaVerified: boolean;
}

export const configuracionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMfaPolicy: builder.query<MfaPolicy, void>({
      query: () => "configuracion/mfa-policy",
      providesTags: ["ConfiguracionMfa"],
      transformResponse: (res: { data: { mfaPolicy: MfaPolicy } }) =>
        res.data.mfaPolicy,
    }),

    updateMfaPolicy: builder.mutation<void, MfaPolicy>({
      query: (mfaPolicy) => ({
        url: "configuracion/mfa-policy",
        method: "PATCH",
        body: { mfaPolicy },
      }),
      invalidatesTags: ["ConfiguracionMfa"],
    }),

    getUsuariosMfa: builder.query<UsuarioMfaStatus[], void>({
      query: () => "identidad/configuracion/usuarios-mfa",
      providesTags: ["UsuariosMfa"],
      transformResponse: (res: { data: UsuarioMfaStatus[] }) => res.data,
    }),

    resetUsuarioMfa: builder.mutation<void, number>({
      query: (usuarioId) => ({
        url: `identidad/configuracion/usuarios/${usuarioId}/reset-mfa`,
        method: "POST",
      }),
      invalidatesTags: ["UsuariosMfa"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMfaPolicyQuery,
  useUpdateMfaPolicyMutation,
  useGetUsuariosMfaQuery,
  useResetUsuarioMfaMutation,
} = configuracionApi;
