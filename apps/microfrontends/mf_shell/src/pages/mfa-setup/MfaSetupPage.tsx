/**
 * MfaSetupPage — MFA enrollment page
 *
 * URL: /mfa-setup?token=<setupToken>
 * Flow: loading → scan QR → verify code → show backup codes → redirect
 * Split-panel layout with branding + form card.
 */

import { AuthLayout } from "../login/components/AuthLayout";
import { AuthCard } from "../login/components/AuthCard";
import { AuthHeader } from "../login/components/AuthHeader";
import { AuthFooter } from "../login/components/AuthFooter";
import { useMfaSetup } from "./hooks/useMfaSetup";
import { MfaLoadingPhase } from "./components/MfaLoadingPhase";
import { MfaErrorPhase } from "./components/MfaErrorPhase";
import { MfaScanPhase } from "./components/MfaScanPhase";
import { MfaSuccessPhase } from "./components/MfaSuccessPhase";

// ── Phase header configs ─────────────────────────────────────────────────────

const PHASE_HEADERS = {
	loading: {
		title: "Configurar MFA",
		subtitle: "Cargando configuración...",
	},
	error: {
		title: "Configurar MFA",
		subtitle: "Ocurrió un error",
	},
	scan: {
		title: "Configurar MFA",
		subtitle: "Escanea el código QR con tu aplicación autenticadora",
	},
	success: {
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
		<AuthLayout>
			<AuthCard>
				<AuthHeader
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
