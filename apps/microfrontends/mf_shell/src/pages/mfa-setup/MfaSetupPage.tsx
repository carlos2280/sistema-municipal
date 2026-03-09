/**
 * MfaSetupPage — MFA enrollment page
 *
 * URL: /mfa-setup?token=<setupToken>
 * Flow: loading → scan QR → verify code → show backup codes → redirect
 * Split-panel layout with branding + form card.
 */

import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { AuthLayout } from "../login/components/AuthLayout";
import { AuthCard } from "../login/components/AuthCard";
import { AuthHeader } from "../login/components/AuthHeader";
import { AuthFooter } from "../login/components/AuthFooter";
import type { BrandingFeature } from "../login/components/BrandingPanel";
import { useMfaSetup } from "./hooks/useMfaSetup";
import { MfaLoadingPhase } from "./components/MfaLoadingPhase";
import { MfaErrorPhase } from "./components/MfaErrorPhase";
import { MfaScanPhase } from "./components/MfaScanPhase";
import { MfaSuccessPhase } from "./components/MfaSuccessPhase";

// ── Branding features ────────────────────────────────────────────────────────

const MFA_FEATURES: BrandingFeature[] = [
	{
		icon: ShieldCheck,
		title: "Verificación en dos pasos",
		description:
			"Protege tu cuenta con una capa adicional de seguridad mediante códigos temporales",
	},
	{
		icon: Smartphone,
		title: "Aplicaciones compatibles",
		description:
			"Google Authenticator, Authy o Microsoft Authenticator",
	},
	{
		icon: KeyRound,
		title: "Códigos de respaldo",
		description:
			"Recibirás códigos de respaldo por si pierdes acceso a tu dispositivo",
	},
];

// ── Phase header configs ─────────────────────────────────────────────────────

const PHASE_HEADERS = {
	loading: {
		icon: ShieldCheck,
		iconVariant: "jade" as const,
		title: "Configurar MFA",
		subtitle: "Cargando configuración...",
	},
	error: {
		icon: ShieldCheck,
		iconVariant: "jade" as const,
		title: "Configurar MFA",
		subtitle: "Ocurrió un error",
	},
	scan: {
		icon: ShieldCheck,
		iconVariant: "jade" as const,
		title: "Configurar MFA",
		subtitle: "Escanea el código QR con tu aplicación autenticadora",
	},
	success: {
		icon: ShieldCheck,
		iconVariant: "success" as const,
		title: "Todo listo",
		subtitle: "Tu cuenta está protegida con MFA",
	},
};

export default function MfaSetupPage() {
	const {
		phase,
		errorMsg,
		qrDataUrl,
		secret,
		code,
		backupCodes,
		countdown,
		handleActivar,
		handleCodeChange,
		goToLogin,
	} = useMfaSetup();

	const header = PHASE_HEADERS[phase];

	return (
		<AuthLayout features={MFA_FEATURES}>
			<AuthCard maxWidth={460}>
				<AuthHeader
					icon={header.icon}
					iconVariant={header.iconVariant}
					title={header.title}
					subtitle={header.subtitle}
				/>

				{phase === "loading" && <MfaLoadingPhase />}
				{phase === "error" && (
					<MfaErrorPhase message={errorMsg} onBack={goToLogin} />
				)}
				{phase === "scan" && (
					<MfaScanPhase
						qrDataUrl={qrDataUrl}
						secret={secret}
						code={code}
						errorMsg={errorMsg}
						onCodeChange={handleCodeChange}
						onActivar={handleActivar}
					/>
				)}
				{phase === "success" && (
					<MfaSuccessPhase
						backupCodes={backupCodes}
						countdown={countdown}
						onGoToLogin={goToLogin}
					/>
				)}

				<AuthFooter />
			</AuthCard>
		</AuthLayout>
	);
}
