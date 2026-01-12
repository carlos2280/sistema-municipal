import {
	MenuApi,
	menuReceived,
	useAppDispatch,
	useLoginAreasMutation,
	useLoginMutation,
	useLoginSistemasMutation,
} from "mf_store/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { TSchemaAreas } from "../types/areas.zod";
import {
	type TSchemaCredenciales,
	schemaCredenciales,
} from "../types/login.zod";
import useHookFormSchema from "./useHookFormSchema"; // ya lo estás usando
export const useLoginFormFlow = () => {
	const dispatch = useAppDispatch();

	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [areas, setAreas] = useState<TSchemaAreas[]>([]);
	const [sistemas, setSistemas] = useState<{ id: number; nombre: string }[]>(
		[],
	);
	const { methods } = useHookFormSchema<TSchemaCredenciales>({
		schema: schemaCredenciales,
		defaultValues: {},
		mode: "onChange",
	});
	const [loginAreas] = useLoginAreasMutation();
	const [loginSistemas] = useLoginSistemasMutation();
	const [login] = useLoginMutation();
	useEffect(() => {
		let previousAreaId: number | undefined;

		const subscription = methods.watch(async (values) => {
			const { correo, contrasena, areaId } = values;

			// Solo continuar si el areaId cambió
			if (areaId && areaId !== previousAreaId && correo && contrasena) {
				previousAreaId = areaId;

				try {
					const payload = await loginSistemas({
						correo,
						contrasena,
						areaId,
					}).unwrap();
					setSistemas(payload);

					// Limpiar sistemaId solo si cambió areaId
					methods.setValue("sistemaId", undefined, {
						shouldValidate: true,
						shouldDirty: true,
					});
				} catch (error) {
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
	}, [loginSistemas, methods]);

	const handleNext = async () => {
		let isValid = false;
		const { correo, contrasena } = methods.getValues();
		switch (activeStep) {
			case 0:
				isValid = await methods.trigger(["correo", "contrasena"]);
				if (isValid) {
					try {
						const payload = await loginAreas({ correo, contrasena }).unwrap();
						setAreas(payload);
						setActiveStep((prev) => prev + 1);
					} catch (error) {
						toast.error("Ocurrio un error con sus credenciales.");
					}
				}
				break;
			case 1:
				await handleLogin();
				break;
			default:
				isValid = false;
				break;
		}
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

	const handleLogin = async () => {
		const isValid = await methods.trigger([
			"correo",
			"contrasena",
			"areaId",
			"sistemaId",
		]);

		if (!isValid) return;

		const { correo, contrasena, areaId, sistemaId } = methods.getValues();

		try {
			// 1. Login
			if (areaId && sistemaId && correo && contrasena) {
				await login({ correo, contrasena, areaId, sistemaId }).unwrap();
			}

			// 2. Obtener el menú del sistema

			const menuResponse = await dispatch(
				MenuApi.endpoints.getMenuSistema.initiate(),
			).unwrap();

			// 3. Guardar el menú en el estado
			dispatch(
				menuReceived({
					nombreSistema: menuResponse.nombreSistema,
					menuRaiz: menuResponse.menuRaiz,
				}),
			);

			toast.success("Login exitoso");
			navigate("/");
		} catch (error) {
			console.error("❌ Error en handleLogin:", error);
			toast.error("Error al ingresar al sistema.");
		}
	};
	return {
		activeStep,
		setActiveStep,
		handleNext,
		handleBack,
		areas,
		sistemas,
		methods,
	};
};
