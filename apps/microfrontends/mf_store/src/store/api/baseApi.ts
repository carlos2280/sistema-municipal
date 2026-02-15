import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";

const VITE_API_URL = import.meta.env.VITE_API_URL;
console.log(VITE_API_URL);
export const baseQueryRefresh = fetchBaseQuery({
	baseUrl: `${VITE_API_URL}/api/v1/`,
	credentials: "include",
});

export const baseApi = createApi({
	reducerPath: "api", // Esta propiedad define el key del reducer
	baseQuery: baseQueryWithReauth,
	endpoints: () => ({}),
	tagTypes: ["autorizacion", "User", "PlanCuentas", "Conversaciones", "Mensajes", "Participantes", "Llamadas"], // Agrega tus tag types aquí
});
