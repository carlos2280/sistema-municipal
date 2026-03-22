import useHookFormSchema from "@/hooks/useHookFormSchema";
import type { TSchemaCredenciales } from "@/types/login.zod";
import { schemaCredenciales } from "@/types/login.zod";
import {
	selectResolvedTenantSlug,
	useAppSelector,
	useLoginAreasMutation,
	useLoginMutation,
	useMfaSetupActivarMutation,
	useMfaSetupIniciarMutation,
} from "mf_store/store";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { AreaOption, LoginStep, MfaSetupPhase } from "../types";
import { useAreaSistemas } from "./useAreaSistemas";
import { useLoginFinish } from "./useLoginFinish";

/** State del MFA setup inline (QR + backup codes dentro del login) */
interface MfaSetupInlineState {
	setupToken: string;
	qrDataUrl: string;
	secret: string;
	phase: MfaSetupPhase;
	backupCodes: string[];
	code: string;
	errorMsg: string;
	isActivating: boolean;
}

const INITIAL_MFA_SETUP: MfaSetupInlineState = {
	setupToken: "",
	qrDataUrl: "",
	secret: "",
	phase: "scan",
	backupCodes: [],
	code: "",
	errorMsg: "",
	isActivating: false,
};

/**
 * Orchestrates the multi-step login flow.
 * Delegates data fetching and post-login to specialized hooks.
 * Supports inline MFA setup when mfa_policy = "required" and user has no MFA.
 */
export const useLoginFlow = () => {
	const tenantSlug = useAppSelector(selectResolvedTenantSlug) ?? "default";

	const [activeStep, setActiveStep] = useState<LoginStep>(0);
	const [areas, setAreas] = useState<AreaOption[]>([]);
	const [mfaCode, setMfaCode] = useState("");
	const [mfaSetupPending, setMfaSetupPending] = useState(false);
	const [mfaSetupInline, setMfaSetupInline] =
		useState<MfaSetupInlineState>(INITIAL_MFA_SETUP);
	const [loginSuccess, setLoginSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { methods } = useHookFormSchema<TSchemaCredenciales>({
		schema: schemaCredenciales,
		defaultValues: {},
		mode: "onChange",
	});

	const [loginAreas] = useLoginAreasMutation();
	const [login] = useLoginMutation();
	const [mfaSetupIniciar] = useMfaSetupIniciarMutation();
	const [mfaSetupActivar] = useMfaSetupActivarMutation();

	// Guard: evita múltiples submisiones concurrentes
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
				// MFA setup inline: obtener QR usando el setupToken del response
				setMfaSetupPending(true);
				try {
					const setupResult = await mfaSetupIniciar({
						setupToken: loginData.setupToken,
					}).unwrap();

					setMfaSetupInline({
						...INITIAL_MFA_SETUP,
						setupToken: loginData.setupToken,
						qrDataUrl: setupResult.qrDataUrl,
						secret: setupResult.secret,
						phase: "scan",
					});
					setActiveStep(2);
				} catch {
					toast.error(
						"Error al iniciar la configuración MFA. Intente nuevamente.",
					);
					setMfaSetupPending(false);
				}
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
	}, [methods, login, tenantSlug, finishLogin, mfaSetupIniciar]);

	// ── Step 2 (MFA activo): MFA verification ─────────────────────────────
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

	// ── Step 2 (MFA setup inline): Verificar código y activar ─────────────
	const handleMfaSetupActivar = useCallback(async () => {
		if (submittingRef.current) return;
		if (mfaSetupInline.code.length !== 6) return;

		submittingRef.current = true;
		setMfaSetupInline((prev) => ({
			...prev,
			isActivating: true,
			errorMsg: "",
		}));

		try {
			const result = await mfaSetupActivar({
				setupToken: mfaSetupInline.setupToken,
				code: mfaSetupInline.code,
			}).unwrap();

			// Activación exitosa → mostrar backup codes
			setMfaSetupInline((prev) => ({
				...prev,
				phase: "backup",
				backupCodes: result.backupCodes,
				isActivating: false,
			}));
			setActiveStep(3);
		} catch {
			setMfaSetupInline((prev) => ({
				...prev,
				errorMsg: "Código inválido. Verifica e intenta nuevamente.",
				code: "",
				isActivating: false,
			}));
		} finally {
			submittingRef.current = false;
		}
	}, [mfaSetupInline.code, mfaSetupInline.setupToken, mfaSetupActivar]);

	// ── Step 3 (MFA setup inline): Login automático post-activación ───────
	const handlePostSetupLogin = useCallback(async () => {
		if (submittingRef.current) return;

		submittingRef.current = true;
		setIsSubmitting(true);
		const { correo, contrasena, areaId, sistemaId } = methods.getValues();

		try {
			const loginData = await login({
				correo,
				contrasena,
				areaId,
				sistemaId,
				tenantSlug,
				mfaCode: mfaSetupInline.code,
			}).unwrap();

			if ("mfaRequired" in loginData || "mfaSetupPending" in loginData) {
				// El código ya expiró, pedir uno nuevo
				toast.error(
					"El código TOTP expiró. Genera un nuevo código desde tu app.",
				);
				// Volver al paso de scan para que ingrese un código nuevo
				setMfaSetupInline((prev) => ({
					...prev,
					phase: "scan",
					code: "",
					errorMsg: "",
				}));
				setActiveStep(2);
				return;
			}

			await finishLogin(loginData);
		} catch {
			toast.error("Error al completar el login. Intente nuevamente.");
		} finally {
			submittingRef.current = false;
			setIsSubmitting(false);
		}
	}, [methods, login, tenantSlug, finishLogin, mfaSetupInline.code]);

	// ── Setter para código del MFA setup inline ───────────────────────────
	const setMfaSetupCode = useCallback((code: string) => {
		setMfaSetupInline((prev) => ({ ...prev, code, errorMsg: "" }));
	}, []);

	// ── Navigation ────────────────────────────────────────────────────────
	const handleNext = useCallback(async () => {
		switch (activeStep) {
			case 0:
				return handleCredentialsStep();
			case 1:
				return handleLoginStep();
			case 2:
				return mfaSetupPending ? handleMfaSetupActivar() : handleMfaStep();
			case 3:
				return handlePostSetupLogin();
		}
	}, [
		activeStep,
		handleCredentialsStep,
		handleLoginStep,
		handleMfaStep,
		handleMfaSetupActivar,
		handlePostSetupLogin,
		mfaSetupPending,
	]);

	const handleBack = useCallback(() => {
		if (activeStep === 2 && !mfaSetupPending) setMfaCode("");
		if (activeStep === 2 && mfaSetupPending) {
			// Volver de MFA setup inline al paso 1
			setMfaSetupPending(false);
			setMfaSetupInline(INITIAL_MFA_SETUP);
		}
		setActiveStep((prev) => (prev - 1) as LoginStep);
	}, [activeStep, mfaSetupPending]);

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
		mfaSetupInline,
		setMfaSetupCode,
		handleNext,
		handleBack,
	} as const;
};
