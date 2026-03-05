import {
	MenuApi,
	menuReceived,
	selectResolvedTenantSlug,
	useAppDispatch,
	useAppSelector,
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
import useHookFormSchema from "./useHookFormSchema";

export const useLoginFormFlow = () => {
	const dispatch = useAppDispatch();
	const tenantSlug = useAppSelector(selectResolvedTenantSlug) ?? "default";

	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [areas, setAreas] = useState<TSchemaAreas[]>([]);
	const [sistemas, setSistemas] = useState<{ id: number; nombre: string }[]>([]);
	const [mfaCode, setMfaCode] = useState("");
	const [mfaSetupPending, setMfaSetupPending] = useState(false);

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

			if (areaId && areaId !== previousAreaId && correo && contrasena) {
				previousAreaId = areaId;

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
	}, [loginSistemas, methods]);

	// biome-ignore lint/suspicious/noExplicitAny: login data inferred from MF-federated module
	const finishLogin = async (loginData: any) => {
		if (loginData.modulosActivos) {
			const { registerDynamicRemotes } = await import(
				"../modules/dynamicModuleLoader"
			);
			await registerDynamicRemotes(loginData.modulosActivos);
		}

		const menuResponse = await dispatch(
			MenuApi.endpoints.getMenuSistema.initiate(),
		).unwrap();

		dispatch(
			menuReceived({
				nombreSistema: menuResponse.nombreSistema,
				menuRaiz: menuResponse.menuRaiz,
			}),
		);

		toast.success("Login exitoso");
		navigate("/");
	};

	const handleNext = async () => {
		const { correo, contrasena } = methods.getValues();
		switch (activeStep) {
			case 0: {
				const isValid = await methods.trigger(["correo", "contrasena"]);
				if (isValid) {
					try {
						const payload = await loginAreas({
							correo,
							contrasena,
							tenantSlug,
						}).unwrap();
						setAreas(payload);
						setActiveStep((prev) => prev + 1);
					} catch {
						toast.error("Ocurrió un error con sus credenciales.");
					}
				}
				break;
			}
			case 1:
				await handleLogin();
				break;
			case 2:
				await handleMfaVerify();
				break;
			default:
				break;
		}
	};

	const handleBack = () => {
		if (activeStep === 2) setMfaCode("");
		setMfaSetupPending(false);
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
		if (!areaId || !sistemaId || !correo || !contrasena) return;

		try {
			const loginData = await login({
				correo,
				contrasena,
				areaId,
				sistemaId,
				tenantSlug,
			}).unwrap();

			if ("mfaSetupPending" in loginData) {
				// Email enviado — mostrar aviso al usuario
				setMfaSetupPending(true);
				return;
			}

			if ("mfaRequired" in loginData) {
				setActiveStep(2);
				return;
			}

			await finishLogin(loginData);
		} catch (error) {
			console.error("❌ Error en handleLogin:", error);
			toast.error("Error al ingresar al sistema.");
		}
	};

	const handleMfaVerify = async () => {
		if (!mfaCode.trim()) return;

		const { correo, contrasena, areaId, sistemaId } = methods.getValues();

		try {
			const loginData = await login({
				correo,
				contrasena,
				areaId,
				sistemaId,
				tenantSlug,
				mfaCode,
			}).unwrap();

			if ("mfaRequired" in loginData) {
				toast.error("Código MFA incorrecto. Intente nuevamente.");
				setMfaCode("");
				return;
			}

			await finishLogin(loginData);
		} catch (error) {
			console.error("❌ Error en handleMfaVerify:", error);
			toast.error("Código MFA inválido o expirado.");
			setMfaCode("");
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
		mfaCode,
		setMfaCode,
		mfaSetupPending,
	};
};
