/**
 * LoginPage — Orchestrator MERIDIAN
 *
 * Split-panel: BrandingPanel (left) + form (right).
 * Tenant badge + stepper + step content + actions.
 *
 * Re-render strategy:
 *   - Step components are React.memo'd
 *   - Validation uses useWatch (subscribes to specific fields only)
 *   - Layout/footer are memoized and never re-render
 */

import { Box, styled } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { Building2 } from "lucide-react";
import {
	selectIsAuthenticated,
	selectTenantNombre,
	useAppSelector,
} from "mf_store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { AreaSystemStep } from "./components/AreaSystemStep";
import { AuthCard } from "./components/AuthCard";
import { AuthFooter } from "./components/AuthFooter";
import { AuthHeader } from "./components/AuthHeader";
import { AuthLayout } from "./components/AuthLayout";
import { CredentialsStep } from "./components/CredentialsStep";
import { LoginActions } from "./components/LoginActions";
import { LoginStepper } from "./components/LoginStepper";
import { MfaSetupPendingNotice } from "./components/MfaSetupPendingNotice";
import { MfaStep } from "./components/MfaStep";
import { MFA_PENDING_CONFIG, STEP_CONFIG } from "./constants";
import { useLoginFlow } from "./hooks/useLoginFlow";

// ── Tenant Badge (form panel top) ───────────────────────────────────────────

const TenantBadge = styled(Box)(({ theme }) => {
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "9px 12px",
		background: `rgba(${accentRgb}, 0.04)`,
		border: `1px solid rgba(${accentRgb}, 0.1)`,
		borderRadius: 8,
		marginBottom: 22,
	};
});

const TenantIcon = styled(Box)(({ theme }) => ({
	color: theme.palette.primary.main,
	opacity: 0.55,
	flexShrink: 0,
	display: "flex",
	"& svg": { width: 15, height: 15 },
}));

const TenantOrg = styled(Box)(({ theme }) => ({
	fontSize: 11,
	color: theme.palette.text.disabled,
	letterSpacing: "0.01em",
	lineHeight: 1.4,
}));

const TenantName = styled("strong")(({ theme }) => ({
	display: "block",
	fontSize: 12.5,
	color: theme.palette.text.secondary,
	fontWeight: 600,
	letterSpacing: 0,
}));

// ── Step transition variants (framer-motion) ────────────────────────────────

const STEP_TRANSITION = {
	type: "tween" as const,
	duration: 0.28,
	ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number], // MERIDIAN ease-out
};

const stepVariants = {
	enter: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? 14 : -14,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? -14 : 14,
	}),
};

// ── Form content (isolated re-renders from useWatch) ─────────────────────────

function LoginFormContent({
	activeStep,
	areas,
	sistemas,
	isLoadingSistemas,
	isSubmitting,
	loginSuccess,
	mfaCode,
	mfaSetupPending,
	onCodeChange,
	onNext,
	onBack,
}: {
	readonly activeStep: 0 | 1 | 2;
	readonly areas: ReadonlyArray<{
		readonly id: number;
		readonly nombre: string;
		readonly descripcion: string | null;
	}>;
	readonly sistemas: ReadonlyArray<{
		readonly id: number;
		readonly nombre: string;
		readonly codigo: string;
	}>;
	readonly isLoadingSistemas: boolean;
	readonly isSubmitting: boolean;
	readonly loginSuccess: boolean;
	readonly mfaCode: string;
	readonly mfaSetupPending: boolean;
	readonly onCodeChange: (code: string) => void;
	readonly onNext: () => void;
	readonly onBack: () => void;
}) {
	const correo = useWatch({ name: "correo" }) as string | undefined;
	const contrasena = useWatch({ name: "contrasena" }) as string | undefined;
	const areaId = useWatch({ name: "areaId" }) as number | undefined;
	const sistemaId = useWatch({ name: "sistemaId" }) as number | undefined;

	// Track direction for slide animation (1 = forward, -1 = back)
	const prevStepRef = useRef(activeStep);
	const direction = activeStep > prevStepRef.current ? 1 : -1;
	useEffect(() => {
		prevStepRef.current = activeStep;
	}, [activeStep]);

	const isStepValid = useMemo(() => {
		if (mfaSetupPending) return false;
		if (activeStep === 0) return !!(correo?.trim() && contrasena);
		if (activeStep === 1) return !!(areaId && sistemaId);
		if (activeStep === 2) return mfaCode.trim().length >= 6;
		return false;
	}, [
		activeStep,
		correo,
		contrasena,
		areaId,
		sistemaId,
		mfaCode,
		mfaSetupPending,
	]);

	const reducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	return (
		<>
			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={activeStep}
					custom={direction}
					variants={reducedMotion ? undefined : stepVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={STEP_TRANSITION}
				>
					{activeStep === 0 && <CredentialsStep />}
					{activeStep === 1 && (
						<AreaSystemStep
							areas={areas}
							sistemas={sistemas}
							isLoadingSistemas={isLoadingSistemas}
						/>
					)}
					{activeStep === 2 && (
						<MfaStep
							mfaCode={mfaCode}
							onCodeChange={onCodeChange}
							onAutoSubmit={onNext}
							onBack={onBack}
						/>
					)}
				</motion.div>
			</AnimatePresence>

			<LoginActions
				activeStep={activeStep}
				disabled={!isStepValid}
				isSubmitting={isSubmitting}
				loginSuccess={loginSuccess}
				onNext={onNext}
				onBack={onBack}
			/>
		</>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const tenantNombre = useAppSelector(selectTenantNombre);

	const {
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
	} = useLoginFlow();

	const config = mfaSetupPending ? MFA_PENDING_CONFIG : STEP_CONFIG[activeStep];

	// Trigger exit animation 800ms after success
	const [exiting, setExiting] = useState(false);
	useEffect(() => {
		if (!loginSuccess) return;
		const timer = setTimeout(() => setExiting(true), 800);
		return () => clearTimeout(timer);
	}, [loginSuccess]);

	// ── Redirects (después de todos los hooks) ────────────────────────────
	// 1. Usuario ya autenticado que navega a /login directamente → redirigir.
	//    Solo en step 0 para no interrumpir un flujo de login activo
	//    (tokenReceived se despacha ANTES de que finishLogin complete).
	if (isAuthenticated && !loginSuccess && activeStep === 0)
		return <Navigate to="/" replace />;

	// 2. Flujo de login completado → redirigir tras la animación de salida.
	if (exiting) return <Navigate to="/" replace />;

	return (
		<AuthLayout exiting={exiting}>
			<AuthCard>
				{/* Tenant context badge */}
				<TenantBadge>
					<TenantIcon>
						<Building2 />
					</TenantIcon>
					<TenantOrg>
						<TenantName>{tenantNombre || "Municipalidad"}</TenantName>
						Sistema Integrado de Gestión · MERIDIAN
					</TenantOrg>
				</TenantBadge>

				<LoginStepper
					activeStep={activeStep}
					mfaSetupPending={mfaSetupPending}
				/>

				<AuthHeader title={config.title} subtitle={config.subtitle} />

				{mfaSetupPending ? (
					<MfaSetupPendingNotice />
				) : (
					<FormProvider {...methods}>
						<LoginFormContent
							activeStep={activeStep}
							areas={areas}
							sistemas={sistemas}
							isLoadingSistemas={isLoadingSistemas}
							isSubmitting={isSubmitting}
							loginSuccess={loginSuccess}
							mfaCode={mfaCode}
							mfaSetupPending={mfaSetupPending}
							onCodeChange={setMfaCode}
							onNext={handleNext}
							onBack={handleBack}
						/>
					</FormProvider>
				)}

				<AuthFooter />
			</AuthCard>
		</AuthLayout>
	);
}
