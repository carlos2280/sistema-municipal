import { useEffect, useState } from "react";
import {
	selectTenantResolved,
	tenantReceived,
	useAppDispatch,
	useAppSelector,
} from "mf_store/store";

type TenantResolverStatus = "loading" | "resolved" | "error";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useTenantResolver() {
	const dispatch = useAppDispatch();
	const alreadyResolved = useAppSelector(selectTenantResolved);
	const [status, setStatus] = useState<TenantResolverStatus>(
		alreadyResolved ? "resolved" : "loading",
	);

	useEffect(() => {
		if (alreadyResolved) {
			setStatus("resolved");
			return;
		}

		const resolve = async () => {
			const hostname = window.location.hostname;

			// Desarrollo local: resolver como tenant "default" sin llamar al endpoint
			if (hostname === "localhost" || hostname === "127.0.0.1") {
				dispatch(
					tenantReceived({
						tenantSlug: "default",
						nombre: undefined,
						logoUrl: null,
						tema: null,
					}),
				);
				setStatus("resolved");
				return;
			}

			try {
				const res = await fetch(
					`${API_URL}/api/v1/platform/resolve?host=${encodeURIComponent(hostname)}`,
				);

				if (!res.ok) {
					setStatus("error");
					return;
				}

				const data = await res.json();
				dispatch(
					tenantReceived({
						tenantSlug: data.slug,
						nombre: data.nombre,
						logoUrl: data.logoUrl,
						tema: data.tema,
					}),
				);
				setStatus("resolved");
			} catch {
				setStatus("error");
			}
		};

		resolve();
	}, [alreadyResolved, dispatch]);

	return { status };
}
