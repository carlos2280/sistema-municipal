/**
 * MfaSetupInline — MFA setup inline dentro del login MERIDIAN
 *
 * Fase 1 (scan): QR code + secret copiable + campo 6 dígitos + verificar
 * Fase 2 (backup): Backup codes grid + continuar al sistema
 *
 * Colores desde theme, nada hardcoded.
 */

import {
	Box,
	IconButton,
	Typography,
	alpha,
	keyframes,
	styled,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	CheckCircle2,
	Copy,
	Lock,
	Smartphone,
} from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import type { MfaSetupPhase } from "../types";

// ── Types ────────────────────────────────────────────────────────────────────

interface MfaSetupInlineProps {
	readonly phase: MfaSetupPhase;
	readonly qrDataUrl: string;
	readonly secret: string;
	readonly code: string;
	readonly errorMsg: string;
	readonly isActivating: boolean;
	readonly backupCodes: readonly string[];
	readonly onCodeChange: (code: string) => void;
	readonly onActivar: () => void;
	readonly onContinue: () => void;
}

// ── Animations ───────────────────────────────────────────────────────────────

const MERIDIAN_EASE: [number, number, number, number] = [0, 0, 0.2, 1];

const phaseVariants = {
	enter: { opacity: 0, x: 14 },
	center: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -14 },
};

const phaseTransition = {
	type: "tween" as const,
	duration: 0.28,
	ease: MERIDIAN_EASE,
};

const codeRevealVariants = {
	hidden: { opacity: 0, y: 8 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
	}),
};

const shake = keyframes`
	0%, 100% { transform: translateX(0); }
	20% { transform: translateX(-4px); }
	40% { transform: translateX(4px); }
	60% { transform: translateX(-4px); }
	80% { transform: translateX(4px); }
`;

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

// ── Styled ───────────────────────────────────────────────────────────────────

const QrContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: 20,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 12,
}));

const Divider = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 12,
	margin: "16px 0",
	"&::before, &::after": {
		content: '""',
		flex: 1,
		height: 1,
		background: theme.palette.divider,
	},
}));

const SecretBox = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 8,
	padding: 12,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
}));

const AppBadge = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "5px 10px",
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.meridian.borders.muted}`,
	borderRadius: 4,
	fontSize: 11,
	fontWeight: 500,
	color: theme.palette.text.secondary,
}));

const Label = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	fontWeight: 600,
	color: theme.palette.text.disabled,
	textTransform: "uppercase",
	letterSpacing: "0.07em",
}));

const DigitInputGroup = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
}));

const DigitSeparator = styled(Box)(({ theme }) => ({
	width: 8,
	height: 8,
	borderRadius: "50%",
	background: theme.palette.divider,
	flexShrink: 0,
	margin: "0 4px",
}));

const DigitInput = styled("input")<{ ownerState: { filled: boolean } }>(
	({ theme, ownerState }) => ({
		width: 44,
		height: 48,
		borderRadius: 8,
		border: `1.5px solid ${
			ownerState.filled ? theme.palette.primary.main : theme.palette.divider
		}`,
		background: theme.meridian.surfaces.s3,
		color: theme.palette.text.primary,
		fontSize: 20,
		fontWeight: 500,
		fontFamily: "'Space Grotesk', sans-serif",
		textAlign: "center",
		outline: "none",
		transition: "border-color 150ms ease, background 150ms ease",
		caretColor: theme.palette.primary.main,

		"&:focus": {
			borderColor: theme.palette.primary.main,
			background: theme.meridian.surfaces.s4,
			boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
		},

		"&::placeholder": {
			color: theme.palette.text.disabled,
			opacity: 0.4,
		},

		// Remove spinner on number inputs
		"&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
			WebkitAppearance: "none",
			margin: 0,
		},
		MozAppearance: "textfield",
	}),
);

const SuccessBox = styled(Box)(({ theme }) => ({
	padding: 16,
	background: alpha(theme.palette.success.main, 0.08),
	border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
	borderRadius: 12,
	display: "flex",
	alignItems: "flex-start",
	gap: 12,
}));

const CodeCell = styled(motion.div)(({ theme }) => ({
	padding: 12,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
	fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
	fontSize: 13,
	fontWeight: 600,
	color: theme.palette.text.primary,
	letterSpacing: "0.06em",
	textAlign: "center",
}));

const WarningText = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "flex-start",
	gap: 8,
	fontSize: 12,
	color: theme.palette.text.secondary,
	lineHeight: 1.5,
}));

const SecurityFooter = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 6,
	fontSize: 11,
	color: theme.palette.text.disabled,
	paddingTop: 8,
}));

const ErrorBox = styled(Box)(({ theme }) => ({
	padding: "8px 12px",
	background: alpha(theme.palette.error.main, 0.08),
	border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
	borderRadius: 8,
	fontSize: 12,
	color: theme.palette.error.main,
	textAlign: "center",
	animation: `${shake} 400ms ease`,
}));

const Spinner = styled("span")(({ theme }) => ({
	width: 14,
	height: 14,
	borderRadius: "50%",
	border: `1.5px solid ${alpha(theme.palette.primary.contrastText, 0.3)}`,
	borderTopColor: theme.palette.primary.contrastText,
	animation: `${spin} 1s linear infinite`,
	flexShrink: 0,
	"@media (prefers-reduced-motion: reduce)": {
		animation: "none",
	},
}));

// ── Scan Phase ───────────────────────────────────────────────────────────────

interface ScanPhaseProps {
	readonly qrDataUrl: string;
	readonly secret: string;
	readonly code: string;
	readonly errorMsg: string;
	readonly isActivating: boolean;
	readonly onCodeChange: (code: string) => void;
	readonly onActivar: () => void;
}

const ScanPhase = memo(function ScanPhase({
	qrDataUrl,
	secret,
	code,
	errorMsg,
	isActivating,
	onCodeChange,
	onActivar,
}: ScanPhaseProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const digits = code.padEnd(6, "").slice(0, 6).split("");

	const handleDigitChange = useCallback(
		(index: number, value: string) => {
			if (!/^\d*$/.test(value)) return;
			const newDigits = [...digits];
			newDigits[index] = value.slice(-1);
			const newCode = newDigits.join("").trim();
			onCodeChange(newCode);

			// Auto-advance
			if (value && index < 5) {
				inputRefs.current[index + 1]?.focus();
			}
		},
		[digits, onCodeChange],
	);

	const handleKeyDown = useCallback(
		(index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Backspace" && !digits[index] && index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
			if (e.key === "Enter" && code.length === 6) {
				onActivar();
			}
		},
		[digits, code.length, onActivar],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			e.preventDefault();
			const pasted = e.clipboardData
				.getData("text")
				.replace(/\D/g, "")
				.slice(0, 6);
			if (pasted) {
				onCodeChange(pasted);
				const focusIndex = Math.min(pasted.length, 5);
				inputRefs.current[focusIndex]?.focus();
			}
		},
		[onCodeChange],
	);

	const copySecret = useCallback(() => {
		navigator.clipboard.writeText(secret);
	}, [secret]);

	// Auto-submit cuando se completan 6 dígitos
	const prevCodeLenRef = useRef(0);
	useEffect(() => {
		if (code.length === 6 && prevCodeLenRef.current < 6 && !isActivating) {
			const timer = setTimeout(onActivar, 80);
			return () => clearTimeout(timer);
		}
		prevCodeLenRef.current = code.length;
	}, [code.length, isActivating, onActivar]);

	const reducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			{/* QR Code */}
			<QrContainer>
				{qrDataUrl && (
					<Box
						component="img"
						src={qrDataUrl}
						alt="Código QR para configurar autenticador"
						sx={{
							width: 180,
							height: 180,
							borderRadius: "12px",
							bgcolor: "#fff",
						}}
					/>
				)}
			</QrContainer>

			{/* Manual secret */}
			<Box>
				<Divider>
					<Typography
						sx={{
							fontSize: 11,
							color: "text.disabled",
							whiteSpace: "nowrap",
						}}
					>
						o ingresa manualmente
					</Typography>
				</Divider>
				<SecretBox>
					<Typography
						component="code"
						sx={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: 14,
							fontWeight: 500,
							letterSpacing: "0.05em",
							flex: 1,
							wordBreak: "break-all",
						}}
					>
						{secret}
					</Typography>
					<IconButton
						size="small"
						onClick={copySecret}
						title="Copiar clave"
						aria-label="Copiar clave secreta"
					>
						<Copy size={14} />
					</IconButton>
				</SecretBox>
			</Box>

			{/* App badges */}
			<Box>
				<Label sx={{ mb: 1 }}>Apps recomendadas</Label>
				<Box
					sx={{
						display: "flex",
						gap: 1,
						flexWrap: "wrap",
					}}
				>
					<AppBadge>
						<Smartphone size={12} />
						Google Authenticator
					</AppBadge>
					<AppBadge>
						<Smartphone size={12} />
						Authy
					</AppBadge>
					<AppBadge>
						<Smartphone size={12} />
						Microsoft Auth
					</AppBadge>
				</Box>
			</Box>

			{/* 6-digit code input */}
			<Box>
				<Label sx={{ mb: 1 }}>Código de verificación</Label>
				<DigitInputGroup onPaste={handlePaste}>
					{[0, 1, 2].map((i) => (
						<DigitInput
							key={i}
							ref={(el) => {
								inputRefs.current[i] = el;
							}}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digits[i] || ""}
							onChange={(e) => handleDigitChange(i, e.target.value)}
							onKeyDown={(e) => handleKeyDown(i, e)}
							ownerState={{ filled: !!digits[i] }}
							aria-label={`Dígito ${i + 1} de 6`}
							autoFocus={i === 0}
							disabled={isActivating}
							autoComplete="off"
						/>
					))}
					<DigitSeparator />
					{[3, 4, 5].map((i) => (
						<DigitInput
							key={i}
							ref={(el) => {
								inputRefs.current[i] = el;
							}}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digits[i] || ""}
							onChange={(e) => handleDigitChange(i, e.target.value)}
							onKeyDown={(e) => handleKeyDown(i, e)}
							ownerState={{ filled: !!digits[i] }}
							aria-label={`Dígito ${i + 1} de 6`}
							disabled={isActivating}
							autoComplete="off"
						/>
					))}
				</DigitInputGroup>
			</Box>

			{/* Error message */}
			{errorMsg && !reducedMotion && <ErrorBox>{errorMsg}</ErrorBox>}
			{errorMsg && reducedMotion && (
				<ErrorBox sx={{ animation: "none" }}>{errorMsg}</ErrorBox>
			)}

			{/* Security footer */}
			<SecurityFooter>
				<Lock size={12} />
				Configuración segura
			</SecurityFooter>
		</Box>
	);
});

// ── Backup Phase ─────────────────────────────────────────────────────────────

interface BackupPhaseProps {
	readonly backupCodes: readonly string[];
}

const BackupPhase = memo(function BackupPhase({
	backupCodes,
}: BackupPhaseProps) {
	const reducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			{/* Success notice */}
			<SuccessBox>
				<Box
					sx={{
						color: "success.main",
						flexShrink: 0,
						mt: "2px",
					}}
				>
					<CheckCircle2 size={20} />
				</Box>
				<Box>
					<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
						MFA activado correctamente
					</Typography>
					<Typography
						sx={{
							fontSize: 12,
							color: "text.secondary",
							lineHeight: 1.5,
						}}
					>
						Guarda estos códigos de respaldo en un lugar seguro
					</Typography>
				</Box>
			</SuccessBox>

			{/* Backup codes grid */}
			<Box>
				<Label sx={{ mb: 1 }}>Códigos de respaldo</Label>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 1,
						"@media (max-width: 639px)": {
							gridTemplateColumns: "1fr",
						},
					}}
				>
					{backupCodes.map((code, i) => (
						<CodeCell
							key={code}
							custom={i}
							variants={reducedMotion ? undefined : codeRevealVariants}
							initial={reducedMotion ? undefined : "hidden"}
							animate={reducedMotion ? undefined : "visible"}
						>
							{code}
						</CodeCell>
					))}
				</Box>
			</Box>

			{/* Warning */}
			<WarningText>
				<Box
					sx={{
						color: "warning.main",
						flexShrink: 0,
						mt: "1px",
					}}
				>
					<AlertTriangle size={14} />
				</Box>
				<span>
					Cada código solo puede usarse una vez. No podrás verlos de nuevo.
				</span>
			</WarningText>
		</Box>
	);
});

// ── Main Component ───────────────────────────────────────────────────────────

export const MfaSetupInline = memo(function MfaSetupInline({
	phase,
	qrDataUrl,
	secret,
	code,
	errorMsg,
	isActivating,
	backupCodes,
	onCodeChange,
	onActivar,
	onContinue,
}: MfaSetupInlineProps) {
	const reducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// onContinue is used by LoginActions via handleNext — suppress lint
	void onContinue;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={phase}
				variants={reducedMotion ? undefined : phaseVariants}
				initial={reducedMotion ? undefined : "enter"}
				animate="center"
				exit={reducedMotion ? undefined : "exit"}
				transition={phaseTransition}
			>
				{phase === "scan" && (
					<ScanPhase
						qrDataUrl={qrDataUrl}
						secret={secret}
						code={code}
						errorMsg={errorMsg}
						isActivating={isActivating}
						onCodeChange={onCodeChange}
						onActivar={onActivar}
					/>
				)}
				{phase === "backup" && <BackupPhase backupCodes={backupCodes} />}
			</motion.div>
		</AnimatePresence>
	);
});
