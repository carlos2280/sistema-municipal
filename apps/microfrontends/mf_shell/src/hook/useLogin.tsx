import { useLoginAreasMutation, useLoginMutation } from "mf_store/store";
import { useState } from "react";
import { toast } from "sonner";
import type { TSchemaAreas } from "../types/areas.zod";
import {
	type TSchemaCredenciales,
	schemaCredenciales,
} from "../types/login.zod";
import useHookFormSchema from "./useHookFormSchema";

export const useLogin = () => {
	const [areas, setAreas] = useState<TSchemaAreas[]>([]);

	const { methods } = useHookFormSchema<TSchemaCredenciales>({
		schema: schemaCredenciales,
		defaultValues: {},
		mode: "onChange",
	});

	const [loginAreas] = useLoginAreasMutation();
	const [login] = useLoginMutation();

	const handleLoginAreas = async () => {
		const isValid = await methods.trigger(["correo", "contrasena"]);
		if (!isValid) return;

		const { correo, contrasena } = methods.getValues();

		try {
			const response = await loginAreas({ correo, contrasena }).unwrap();

			if (response.length === 1) {
				methods.setValue("areaId", response[0].id);

				const data = {
					correo,
					contrasena,
					areaId: response[0].id,
					sistemaId: 1,
				};
				await handleLogin(data);
			} else {
				setAreas(response); // Muestra el select
			}
		} catch (error) {
			console.error("Error al obtener áreas:", error);
			toast.error("Ocurrio un error con sus credenciales.");
		}
	};

	const handleLogin = async (data: TSchemaCredenciales) => {
		try {
			if (data?.areaId && data.sistemaId && data.correo && data.contrasena) {
				const response = await login(data).unwrap();
				localStorage.setItem("user", JSON.stringify(response.usuario));
				localStorage.setItem("token", response.token);
			}

			// Redirige a dashboard principal
			// window.location.href = '/';
		} catch (error) {
			console.log(error);
			toast.error("Ocurrio un error con sus credenciales.");
		}
	};

	return {
		methods,
		areas,
		handleLogin,
		handleLoginAreas,
	};
};

export default useLogin;
