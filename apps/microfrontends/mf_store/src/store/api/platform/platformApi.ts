import type { ActiveModule } from "@/store/features/subscriptionsSlice";
import { baseApi } from "../base/baseApi";

export const platformApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getModulosActivos: builder.query<ActiveModule[], void>({
			query: () => "/platform/tenant/modules",
		}),
	}),
	overrideExisting: false,
});

export const { useGetModulosActivosQuery } = platformApi;
