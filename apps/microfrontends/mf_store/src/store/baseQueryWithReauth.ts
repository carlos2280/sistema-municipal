import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { loggedOut, tokenReceived } from "./features/authSlice";

const mutex = new Mutex();

const VITE_API_URL = import.meta.env.VITE_API_URL;
const baseQuery = fetchBaseQuery({
	baseUrl: `${VITE_API_URL}/api/v1`,
	credentials: "include",
});

export const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	await mutex.waitForUnlock();
	let result = await baseQuery(args, api, extraOptions);

	if (result.error?.status === 401) {
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				const refreshResult = await baseQuery(
					{ url: "/autorizacion/refresh-token", method: "POST" },
					api,
					extraOptions,
				);

				if (refreshResult.data) {
					api.dispatch(
						tokenReceived(refreshResult.data as { accessToken: string }),
					); // debes asegurarte que `refreshResult.data` tenga el nuevo token
					// Reintentar la consulta original
					result = await baseQuery(args, api, extraOptions);
				} else {
					api.dispatch(loggedOut());
				}
			} finally {
				release();
			}
		} else {
			await mutex.waitForUnlock();
			result = await baseQuery(args, api, extraOptions);
		}
	}

	return result;
};
