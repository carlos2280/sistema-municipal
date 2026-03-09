import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	useMfaSetupActivarMutation,
	useMfaSetupIniciarMutation,
} from "mf_store/store";
import type { MfaSetupPhase } from "../types";

/**
 * Manages the MFA setup state machine: loading → scan → success | error.
 * Single Responsibility: MFA setup lifecycle.
 */
export const useMfaSetup = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const [phase, setPhase] = useState<MfaSetupPhase>("loading");
	const [errorMsg, setErrorMsg] = useState("");
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [secret, setSecret] = useState("");
	const [code, setCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [countdown, setCountdown] = useState(15);

	const [mfaSetupIniciar] = useMfaSetupIniciarMutation();
	const [mfaSetupActivar] = useMfaSetupActivarMutation();

	// Initialize setup on mount
	useEffect(() => {
		if (!token) {
			setErrorMsg(
				"Enlace inválido. Por favor, vuelve a iniciar sesión para recibir un nuevo enlace.",
			);
			setPhase("error");
			return;
		}

		mfaSetupIniciar({ setupToken: token })
			.unwrap()
			.then(({ qrDataUrl: qr, secret: s }) => {
				setQrDataUrl(qr);
				setSecret(s);
				setPhase("scan");
			})
			.catch((err) => {
				setErrorMsg(
					err?.data?.message ??
						"El enlace es inválido o ha expirado. Vuelve a iniciar sesión para obtener uno nuevo.",
				);
				setPhase("error");
			});
	}, [token, mfaSetupIniciar]);

	// Countdown after success → redirect
	useEffect(() => {
		if (phase !== "success") return;
		if (countdown <= 0) {
			navigate("/login");
			return;
		}
		const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [phase, countdown, navigate]);

	const handleActivar = useCallback(async () => {
		if (code.length !== 6) return;
		try {
			const result = await mfaSetupActivar({
				setupToken: token,
				code,
			}).unwrap();
			setBackupCodes(result.backupCodes);
			setPhase("success");
		} catch {
			setErrorMsg(
				"Código incorrecto. Verifica tu aplicación autenticadora e intenta de nuevo.",
			);
			setCode("");
		}
	}, [code, token, mfaSetupActivar]);

	const handleCodeChange = useCallback((value: string) => {
		setCode(value.replace(/\D/g, "").slice(0, 6));
	}, []);

	const goToLogin = useCallback(() => {
		navigate("/login");
	}, [navigate]);

	return {
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
	} as const;
};
