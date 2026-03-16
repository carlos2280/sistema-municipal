import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
	selectResolvedTenantSlug,
	useAppSelector,
	useLoginAreasMutation,
	useLoginMutation,
} from "mf_store/store";
import type { TSchemaCredenciales } from "../../../types/login.zod";
import type { AreaOption, LoginStep } from "../types";
import { useAreaSistemas } from "./useAreaSistemas";
import { useLoginFinish } from "./useLoginFinish";
import useHookFormSchema from "../../../hooks/useHookFormSchema";
import { schemaCredenciales } from "../../../types/login.zod";

/**
 * Orchestrates the multi-step login flow.
 * Delegates data fetching and post-login to specialized hooks.
 */
export const useLoginFlow = () => {
	const tenantSlug = useAppSelector(selectResolvedTenantSlug) ?? "default";

	const [activeStep, setActiveStep] = useState<LoginStep>(0);
	const [areas, setAreas] = useState<AreaOption[]>([]);
	const [mfaCode, setMfaCode] = useState("");
	const [mfaSetupPending, setMfaSetupPending] = useState(false);
	const [loginSuccess, setLoginSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { methods } = useHookFormSchema<TSchemaCredenciales>({
		schema: schemaCredenciales,
		defaultValues: {},
		mode: "onChange",
	});

	const [loginAreas] = useLoginAreasMutation();
	const [login] = useLoginMutation();

	// Guard: evita múltiples submisiones concurrentes (ej. auto-submit MFA + click en Verificar)
	const submittingRef = useRef(false);

	const { sistemas, isLoadingSistemas } = useAreaSistemas(methods);
	const markSuccess = useCallback(() => setLoginSuccess(true), []);
	const finishLogin = useLoginFinish(markSuccess);

	// ── Step 0: Validate credentials & fetch areas ────────────────────────
	const handleCredentialsStep = useCallback(async () => {
		if (submittingRef.current) return;
		const isValid = await methods.trigger(["correo", "contrasena"]);
		if (!isValid) return;

		submittingRef.current = true;
		setIsSubmitting(true);
		const { correo, contrasena } = methods.getValues();
		try {
			const payload = await loginAreas({
				correo,
				contrasena,
				tenantSlug,
			}).unwrap();
			setAreas(payload);
			setActiveStep(1);
		} catch {
			toast.error("Ocurrió un error con sus credenciales.");
		} finally {
			submittingRef.current = false;
			setIsSubmitting(false);
		}
	}, [methods, loginAreas, tenantSlug]);

	// ── Step 1: Login with area + sistema ─────────────────────────────────
	const handleLoginStep = useCallback(async () => {
		if (submittingRef.current) return;
		const isValid = await methods.trigger([
			"correo",
			"contrasena",
			"areaId",
			"sistemaId",
		]);
		if (!isValid) return;

		const { correo, contrasena, areaId, sistemaId } = methods.getValues();
		if (!areaId || !sistemaId || !correo || !contrasena) return;

		submittingRef.current = true;
		setIsSubmitting(true);
		try {
			const loginData = await login({
				correo,
				contrasena,
				areaId,
				sistemaId,
				tenantSlug,
			}).unwrap();

			if ("mfaSetupPending" in loginData) {
				setMfaSetupPending(true);
				return;
			}

			if ("mfaRequired" in loginData) {
				setActiveStep(2);
				return;
			}

			await finishLogin(loginData);
		} catch {
			toast.error("Error al ingresar al sistema.");
		} finally {
			submittingRef.current = false;
			setIsSubmitting(false);
		}
	}, [methods, login, tenantSlug, finishLogin]);

	// ── Step 2: MFA verification ──────────────────────────────────────────
	// Delay mínimo para que "Verificando…" sea visible (match prototipo MERIDIAN)
	const MFA_MIN_DELAY_MS = 1100;

	const handleMfaStep = useCallback(async () => {
		if (submittingRef.current) return;
		if (!mfaCode.trim()) return;

		submittingRef.current = true;
		setIsSubmitting(true);
		const { correo, contrasena, areaId, sistemaId } = methods.getValues();

		const minDelay = new Promise<void>((r) => setTimeout(r, MFA_MIN_DELAY_MS));

		try {
			const [loginData] = await Promise.all([
				login({
					correo,
					contrasena,
					areaId,
					sistemaId,
					tenantSlug,
					mfaCode,
				}).unwrap(),
				minDelay,
			]);

			if ("mfaRequired" in loginData) {
				toast.error("Código MFA incorrecto. Intente nuevamente.");
				setMfaCode("");
				return;
			}

			await finishLogin(loginData);
		} catch {
			toast.error("Código MFA inválido o expirado.");
			setMfaCode("");
		} finally {
			submittingRef.current = false;
			setIsSubmitting(false);
		}
	}, [mfaCode, methods, login, tenantSlug, finishLogin]);

	// ── Navigation ────────────────────────────────────────────────────────
	const handleNext = useCallback(async () => {
		switch (activeStep) {
			case 0:
				return handleCredentialsStep();
			case 1:
				return handleLoginStep();
			case 2:
				return handleMfaStep();
		}
	}, [activeStep, handleCredentialsStep, handleLoginStep, handleMfaStep]);

	const handleBack = useCallback(() => {
		if (activeStep === 2) setMfaCode("");
		setMfaSetupPending(false);
		setActiveStep((prev) => (prev - 1) as LoginStep);
	}, [activeStep]);

	return {
		activeStep,
		areas,
		sistemas,
		isLoadingSistemas,
		isSubmitting,
		loginSuccess,
		methods,
		mfaCode,
		setMfaCode,
		mfaSetupPending,
		handleNext,
		handleBack,
	} as const;
};
