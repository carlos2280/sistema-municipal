/**
 * LoginPage — Thin orchestrator
 *
 * Split-panel layout: BrandingPanel (left) + login card (right).
 * Re-render strategy:
 *   - Step components are React.memo'd
 *   - Validation uses useWatch (subscribes to specific fields only)
 *   - Layout/footer are memoized and never re-render
 */

import { Box } from "@mui/material";
import { Clock, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import type { BrandingFeature } from "./components/BrandingPanel";
import { MFA_PENDING_CONFIG, STEP_CONFIG } from "./constants";
import { useLoginFlow } from "./hooks/useLoginFlow";
import { AuthLayout } from "./components/AuthLayout";
import { AuthCard } from "./components/AuthCard";
import { AuthHeader } from "./components/AuthHeader";
import { AuthFooter } from "./components/AuthFooter";
import { LoginStepper } from "./components/LoginStepper";
import { LoginActions } from "./components/LoginActions";
import { CredentialsStep } from "./components/CredentialsStep";
import { AreaSystemStep } from "./components/AreaSystemStep";
import { MfaStep } from "./components/MfaStep";
import { MfaSetupPendingNotice } from "./components/MfaSetupPendingNotice";

// ── Branding features for login page ─────────────────────────────────────────

const LOGIN_FEATURES: BrandingFeature[] = [
	{
		icon: ShieldCheck,
		title: "Seguridad avanzada",
		description:
			"Autenticación de dos factores y encriptación de extremo a extremo",
	},
	{
		icon: LayoutDashboard,
		title: "Gestión integral",
		description:
			"Contabilidad, presupuesto, remuneraciones y más en un solo lugar",
	},
	{
		icon: Clock,
		title: "Disponible 24/7",
		description:
			"Acceso seguro desde cualquier dispositivo, en cualquier momento",
	},
];

// ── Form content (isolated re-renders from useWatch) ─────────────────────────

function LoginFormContent({
	activeStep,
	areas,
	sistemas,
	mfaCode,
	mfaSetupPending,
	onCodeChange,
	onNext,
	onBack,
}: {
	activeStep: 0 | 1 | 2;
	areas: { id: number; nombre: string }[];
	sistemas: { id: number; nombre: string }[];
	mfaCode: string;
	mfaSetupPending: boolean;
	onCodeChange: (code: string) => void;
	onNext: () => void;
	onBack: () => void;
}) {
	const correo = useWatch({ name: "correo" }) as string | undefined;
	const contrasena = useWatch({ name: "contrasena" }) as string | undefined;
	const areaId = useWatch({ name: "areaId" }) as number | undefined;
	const sistemaId = useWatch({ name: "sistemaId" }) as number | undefined;

	const isStepValid = useMemo(() => {
		if (mfaSetupPending) return false;
		if (activeStep === 0) return !!(correo?.trim() && contrasena);
		if (activeStep === 1) return !!(areaId && sistemaId);
		if (activeStep === 2) return mfaCode.trim().length >= 6;
		return false;
	}, [activeStep, correo, contrasena, areaId, sistemaId, mfaCode, mfaSetupPending]);

	return (
		<>
			<Box>
				{activeStep === 0 && <CredentialsStep />}
				{activeStep === 1 && (
					<AreaSystemStep areas={areas} sistemas={sistemas} />
				)}
				{activeStep === 2 && (
					<MfaStep mfaCode={mfaCode} onCodeChange={onCodeChange} />
				)}
			</Box>

			<LoginActions
				activeStep={activeStep}
				disabled={!isStepValid}
				onNext={onNext}
				onBack={onBack}
			/>
		</>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
	const {
		activeStep,
		areas,
		sistemas,
		methods,
		mfaCode,
		setMfaCode,
		mfaSetupPending,
		handleNext,
		handleBack,
	} = useLoginFlow();

	const config = mfaSetupPending ? MFA_PENDING_CONFIG : STEP_CONFIG[activeStep];

	return (
		<AuthLayout features={LOGIN_FEATURES}>
			<AuthCard>
				<AuthHeader
					icon={config.icon}
					iconVariant={config.iconVariant}
					title={config.title}
					subtitle={config.subtitle}
				/>

				<LoginStepper
					activeStep={activeStep}
					mfaSetupPending={mfaSetupPending}
				/>

				{mfaSetupPending ? (
					<MfaSetupPendingNotice />
				) : (
					<FormProvider {...methods}>
						<LoginFormContent
							activeStep={activeStep}
							areas={areas}
							sistemas={sistemas}
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
