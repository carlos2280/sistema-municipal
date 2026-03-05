/**
 * MfaSetupPage — Página pública de configuración MFA
 *
 * El usuario llega aquí desde un link en su correo corporativo.
 * URL: /mfa-setup?token=<setupToken>
 *
 * Flujo:
 * 1. Leer token de la URL
 * 2. Llamar a /mfa-setup/iniciar → obtener QR + secret
 * 3. Usuario escanea QR con su autenticador y confirma con código
 * 4. Llamar a /mfa-setup/activar → MFA activado
 * 5. Mostrar backup codes y redirigir a /login
 */

import {
	Box,
	Button,
	Card,
	CircularProgress,
	Divider,
	InputAdornment,
	Stack,
	TextField,
	Typography,
	styled,
} from "@mui/material";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMfaSetupActivarMutation, useMfaSetupIniciarMutation } from "mf_store/store";

// ─── Styled ─────────────────────────────────────────────────────────────────

const PageWrapper = styled(Box)(({ theme }) => ({
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor:
		theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
	padding: theme.spacing(3),
}));

const SetupCard = styled(Card)(({ theme }) => ({
	width: "100%",
	maxWidth: 460,
	padding: theme.spacing(5),
	borderRadius: 16,
	boxShadow:
		theme.palette.mode === "light"
			? "0 4px 24px rgba(0,0,0,0.08)"
			: "0 4px 24px rgba(0,0,0,0.4)",
	border: `1px solid ${theme.palette.divider}`,
}));

// ─── Tipos de estado ─────────────────────────────────────────────────────────

type SetupPhase = "loading" | "error" | "scan" | "success";

// ─── Componente principal ────────────────────────────────────────────────────

export default function MfaSetupPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const [phase, setPhase] = useState<SetupPhase>("loading");
	const [errorMsg, setErrorMsg] = useState("");
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [secret, setSecret] = useState("");
	const [code, setCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [countdown, setCountdown] = useState(15);

	const [mfaSetupIniciar] = useMfaSetupIniciarMutation();
	const [mfaSetupActivar] = useMfaSetupActivarMutation();

	// Paso 1: iniciar setup al montar
	useEffect(() => {
		if (!token) {
			setErrorMsg("Enlace inválido. Por favor, vuelve a iniciar sesión para recibir un nuevo enlace.");
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
				const msg =
					err?.data?.message ??
					"El enlace es inválido o ha expirado. Vuelve a iniciar sesión para obtener uno nuevo.";
				setErrorMsg(msg);
				setPhase("error");
			});
	}, [token, mfaSetupIniciar]);

	// Cuenta regresiva tras éxito → redirigir a /login
	useEffect(() => {
		if (phase !== "success") return;
		if (countdown <= 0) {
			navigate("/login");
			return;
		}
		const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [phase, countdown, navigate]);

	// Paso 2: activar MFA
	const handleActivar = async () => {
		if (code.length !== 6) return;
		try {
			const result = await mfaSetupActivar({ setupToken: token, code }).unwrap();
			setBackupCodes(result.backupCodes);
			setPhase("success");
		} catch {
			setErrorMsg("Código incorrecto. Verifica tu aplicación autenticadora e intenta de nuevo.");
			setCode("");
		}
	};

	// ─── Renders por fase ──────────────────────────────────────────────────────

	const renderContent = () => {
		switch (phase) {
			case "loading":
				return (
					<Stack alignItems="center" spacing={2} py={4}>
						<CircularProgress size={48} />
						<Typography variant="body2" color="text.secondary">
							Preparando tu configuración MFA...
						</Typography>
					</Stack>
				);

			case "error":
				return (
					<Stack alignItems="center" spacing={3}>
						<Box sx={{ color: "error.main" }}>
							<AlertCircle size={56} />
						</Box>
						<Typography variant="body2" color="text.secondary" textAlign="center">
							{errorMsg}
						</Typography>
						<Button
							variant="contained"
							fullWidth
							onClick={() => navigate("/login")}
							sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
						>
							Volver al inicio de sesión
						</Button>
					</Stack>
				);

			case "scan":
				return (
					<Stack spacing={3}>
						<Typography variant="body2" color="text.secondary" textAlign="center">
							Escanea el código QR con tu aplicación autenticadora
							(Google Authenticator, Authy, Microsoft Authenticator, etc.)
						</Typography>

						{/* QR */}
						{qrDataUrl && (
							<Box sx={{ display: "flex", justifyContent: "center" }}>
								<Box
									component="img"
									src={qrDataUrl}
									alt="Código QR MFA"
									sx={{
										width: 190,
										height: 190,
										borderRadius: 2,
										border: "1px solid",
										borderColor: "divider",
										p: 1,
										bgcolor: "#fff",
									}}
								/>
							</Box>
						)}

						{/* Clave manual */}
						<Box
							sx={{
								bgcolor: "action.hover",
								borderRadius: 1,
								p: 1.5,
								textAlign: "center",
							}}
						>
							<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
								Clave manual (si no puedes escanear el QR)
							</Typography>
							<Typography
								variant="body2"
								fontFamily="monospace"
								fontWeight={600}
								sx={{ letterSpacing: "0.15em", wordBreak: "break-all" }}
							>
								{secret}
							</Typography>
						</Box>

						{/* Campo de código */}
						<TextField
							fullWidth
							label="Código de verificación (6 dígitos)"
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
							autoFocus
							inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 6 }}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<ShieldCheck size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
							}}
							sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
						/>

						{errorMsg && (
							<Typography variant="body2" color="error" textAlign="center">
								{errorMsg}
							</Typography>
						)}

						<Button
							fullWidth
							variant="contained"
							onClick={handleActivar}
							disabled={code.length !== 6}
							sx={{ height: 48, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
							endIcon={<ShieldCheck size={18} />}
						>
							Activar autenticador
						</Button>
					</Stack>
				);

			case "success":
				return (
					<Stack spacing={3} alignItems="center">
						<Box sx={{ color: "success.main" }}>
							<CheckCircle2 size={56} />
						</Box>
						<Typography variant="h6" fontWeight={600}>
							¡MFA activado correctamente!
						</Typography>
						<Typography variant="body2" color="text.secondary" textAlign="center">
							Tu autenticador está configurado. A partir de ahora, al iniciar sesión
							deberás ingresar el código de tu aplicación autenticadora.
						</Typography>

						{/* Backup codes */}
						{backupCodes.length > 0 && (
							<Box
								sx={{
									bgcolor: "warning.light",
									border: "1px solid",
									borderColor: "warning.main",
									borderRadius: 2,
									p: 2,
									width: "100%",
								}}
							>
								<Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
									Guarda tus códigos de respaldo
								</Typography>
								<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
									Úsalos si pierdes acceso a tu autenticador. Cada código es de uso único.
								</Typography>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 0.75,
									}}
								>
									{backupCodes.map((c) => (
										<Typography
											key={c}
											variant="caption"
											fontFamily="monospace"
											fontWeight={600}
											sx={{ bgcolor: "warning.dark", color: "#fff", borderRadius: 1, px: 1, py: 0.5 }}
										>
											{c}
										</Typography>
									))}
								</Box>
							</Box>
						)}

						<Typography variant="body2" color="text.secondary">
							Redirigiendo al inicio de sesión en{" "}
							<strong>{countdown}</strong> segundos...
						</Typography>

						<Button
							fullWidth
							variant="contained"
							onClick={() => navigate("/login")}
							sx={{ height: 48, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
						>
							Ir al inicio de sesión
						</Button>
					</Stack>
				);
		}
	};

	return (
		<PageWrapper>
			<SetupCard>
				{/* Header */}
				<Box sx={{ textAlign: "center", mb: 4 }}>
					<Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "primary.main" }}>
						<ShieldCheck size={48} />
					</Box>
					<Typography variant="h6" fontWeight={700}>
						Configurar autenticación MFA
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Sistema Municipal
					</Typography>
				</Box>

				{renderContent()}

				<Divider sx={{ my: 3 }} />
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", textAlign: "center" }}
				>
					Acceso seguro con encriptación
				</Typography>
			</SetupCard>
		</PageWrapper>
	);
}
