import {
	useCambiarContrasenaTemporalMutation,
	useContrasenaTemporalQuery,
} from "mf_store/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	type TSchemaFormContrasenaTemporal,
	schemaFormContrasenaTemporal,
} from "../types/contrasenaTemporal";
import { skipToken } from "../utils/skipToken";
import useHookFormSchema from "./useHookFormSchema";

const useContrasenaTemporal = (token?: string) => {
	const navigate = useNavigate();
	const { methods } = useHookFormSchema<TSchemaFormContrasenaTemporal>({
		schema: schemaFormContrasenaTemporal,
		defaultValues: {},
		mode: "onChange",
	});

	const { data, isLoading, isError, error } = useContrasenaTemporalQuery(
		token ? { token } : skipToken,
	);

	const [cambiarContrasenaTemporal] = useCambiarContrasenaTemporalMutation();

	useEffect(() => {
		if (data?.email) {
			methods.setValue("correo", data.email);
		}
	}, [data?.email, methods]);

	const handleSubmit = async (data: TSchemaFormContrasenaTemporal) => {
		try {
			if (!token) throw new Error("Token no disponible");

			// Creamos una promesa que demora al menos 1 segundo
			const delay = new Promise((resolve) => setTimeout(resolve, 1000));

			const cambiarPromise = cambiarContrasenaTemporal({
				body: {
					correo: data.correo,
					contrasenaTemporal: data.contrasenaTemporal,
					contrasenaNueva: data.contrasenaNueva,
				},
				token,
			}).unwrap();
			// Esperamos ambas: la API y al menos 1 segundo de delay
			const promise = Promise.all([cambiarPromise, delay]);

			toast.promise(promise, {
				loading: "Validando credenciales...",
				success: () => {
					setTimeout(() => navigate("/login"), 1000);
					return {
						message: "Contraseña actualizada con éxito",
						description: "Redirigiendo...",
					};
				},
				error: () => ({
					message: "Error al validar las credenciales.",
				}),
			});

			await promise;
		} catch (error) {
			toast.error("Error al validar las credenciales.");
		}
	};

	return {
		methods,
		handleSubmit,
		data,
		isLoading,
		isError,
		error,
	};
};

export default useContrasenaTemporal;
