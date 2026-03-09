import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	selectResolvedTenantSlug,
	useAppSelector,
	useLoginSistemasMutation,
} from "mf_store/store";
import type { UseFormReturn } from "react-hook-form";
import type { TSchemaCredenciales } from "../../../types/login.zod";
import type { SistemaOption } from "../types";

/**
 * Watches areaId changes and fetches sistemas accordingly.
 * Single Responsibility: area → sistemas data fetching.
 */
export const useAreaSistemas = (methods: UseFormReturn<TSchemaCredenciales>) => {
	const tenantSlug = useAppSelector(selectResolvedTenantSlug) ?? "default";
	const [sistemas, setSistemas] = useState<SistemaOption[]>([]);
	const [loginSistemas] = useLoginSistemasMutation();
	const previousAreaIdRef = useRef<number | undefined>();

	useEffect(() => {
		const subscription = methods.watch(async (values) => {
			const { correo, contrasena, areaId } = values;

			if (areaId && areaId !== previousAreaIdRef.current && correo && contrasena) {
				previousAreaIdRef.current = areaId;

				try {
					const payload = await loginSistemas({
						correo,
						contrasena,
						areaId,
						tenantSlug,
					}).unwrap();
					setSistemas(payload);
					methods.setValue("sistemaId", undefined, {
						shouldValidate: true,
						shouldDirty: true,
					});
				} catch {
					toast.error("Error al obtener los sistemas");
					setSistemas([]);
					methods.setValue("sistemaId", undefined, {
						shouldValidate: true,
						shouldDirty: true,
					});
				}
			}
		});

		return () => subscription.unsubscribe();
	}, [loginSistemas, methods, tenantSlug]);

	return sistemas;
};
