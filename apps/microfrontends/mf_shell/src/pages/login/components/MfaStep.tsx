/**
 * MfaStep — OTP + backup code MERIDIAN
 *
 * 6-digit OTP boxes con accent del tema.
 * Tabs TOTP / Backup code. Timer ring SVG.
 * Nada hardcoded — todo desde theme.meridian y theme.palette.
 */

import { Box, alpha, styled } from "@mui/material";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import {
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ClipboardEvent,
	type KeyboardEvent,
} from "react";

// ── MFA Icon ────────────────────────────────────────────────────────────────

const MfaIconWrap = styled(Box)(() => ({
	display: "flex",
	justifyContent: "center",
	marginBottom: 6,
	position: "relative",
}));

const MfaIconBox = styled(Box)(({ theme }) => {
	const accent = theme.palette.primary.main;
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		width: 60,
		height: 60,
		background: alpha(accent, 0.12),
		border: `1px solid ${alpha(accent, 0.25)}`,
		borderRadius: 18,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: accent,
		position: "relative",
		zIndex: 1,
		"& svg": { width: 26, height: 26 },
	};
});

const MfaIconGlow = styled(Box)(({ theme }) => {
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: 110,
		height: 110,
		background: `radial-gradient(circle, rgba(${accentRgb}, 0.16) 0%, transparent 70%)`,
		pointerEvents: "none",
	};
});

// ── Tabs ────────────────────────────────────────────────────────────────────

const TabRow = styled(Box)(({ theme }) => ({
	display: "flex",
	background: theme.meridian.surfaces.s2,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
	padding: 3,
	gap: 2,
	marginBottom: 18,
}));

const Tab = styled("button")<{ ownerState: { active: boolean } }>(
	({ theme, ownerState }) => ({
		flex: 1,
		padding: "8px 10px",
		border: "none",
		background: ownerState.active ? theme.meridian.surfaces.s4 : "transparent",
		borderRadius: 6,
		color: ownerState.active
			? theme.palette.primary.main
			: theme.palette.text.disabled,
		fontSize: 12,
		fontWeight: 500,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		transition: "background 150ms, color 150ms",
		fontFamily: theme.typography.fontFamily,

		...(ownerState.active && {
			boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
		}),

		"&:hover": {
			color: ownerState.active
				? theme.palette.primary.main
				: theme.palette.text.secondary,
		},

		"& svg": { width: 13, height: 13 },
	}),
);

// ── OTP Boxes ───────────────────────────────────────────────────────────────

const OtpRow = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	gap: 7,
	justifyContent: "center",
	margin: "4px 0 20px",
}));

const OtpBox = styled("input")<{ ownerState: { filled: boolean } }>(
	({ theme, ownerState }) => {
		const accent = theme.palette.primary.main;
		const accentRgb = theme.meridian.moduleAccent.rgb;

		return {
			width: 54,
			height: 62,
			background: theme.meridian.surfaces.s2,
			border: `1.5px solid ${ownerState.filled ? alpha(accent, 0.4) : theme.palette.divider}`,
			borderRadius: 8,
			fontFamily: theme.typography.number?.fontFamily,
			fontSize: 26,
			fontWeight: 600,
			fontFeatureSettings: "'tnum' 1",
			color: ownerState.filled ? accent : theme.palette.text.primary,
			textAlign: "center" as const,
			outline: "none",
			transition: "border-color 150ms, background 150ms, box-shadow 150ms",
			caretColor: accent,

			"&:focus": {
				borderColor: accent,
				background: theme.meridian.surfaces.s3,
				boxShadow: `0 0 0 3px rgba(${accentRgb}, 0.12)`,
			},

			[theme.breakpoints.down("sm")]: {
				width: 46,
				height: 54,
				fontSize: 22,
			},

			"@media (max-width: 479px)": {
				width: 42,
				height: 50,
				fontSize: 20,
			},
		};
	},
);

const OtpSep = styled("span")(({ theme }) => ({
	color: theme.meridian.text.tx4,
	fontSize: 18,
	fontWeight: 300,
	margin: "0 2px",
}));

const OtpHint = styled(Box)(({ theme }) => ({
	textAlign: "center",
	fontSize: 12,
	color: theme.palette.text.disabled,
	lineHeight: 1.5,
	marginBottom: 20,
}));

// ── TOTP Timer Ring ──────────────────────────────────────────────────────────

const TimerRow = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	marginTop: 14,
	fontSize: 12,
}));

const TimerNum = styled("span")(({ theme }) => ({
	fontFamily: theme.typography.number?.fontFamily,
	fontSize: 13,
	fontWeight: 600,
	color: theme.palette.text.secondary,
	minWidth: 20,
	textAlign: "center" as const,
	fontFeatureSettings: "'tnum' 1",
}));

const TimerLabel = styled("span")(({ theme }) => ({
	color: theme.palette.text.disabled,
}));

// ── Back link ────────────────────────────────────────────────────────────────

const BackLink = styled("span")(({ theme }) => ({
	fontSize: 12,
	color: theme.palette.primary.main,
	cursor: "pointer",
	opacity: 0.75,
	transition: "opacity 150ms",
	"&:hover": { opacity: 1 },
}));

// ── Security footer ─────────────────────────────────────────────────────────

const SecurityRow = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 6,
	color: theme.meridian.text.tx4,
	fontSize: 11,
	marginTop: 14,
	"& svg": { width: 11, height: 11, flexShrink: 0 },
}));

// ── Backup code input ───────────────────────────────────────────────────────

const BackupInput = styled("input")(({ theme }) => {
	const accent = theme.palette.primary.main;
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		width: "100%",
		background: theme.meridian.surfaces.s2,
		border: `1.5px solid ${theme.palette.divider}`,
		borderRadius: 8,
		padding: "14px 16px",
		fontFamily: theme.typography.number?.fontFamily,
		fontSize: 14,
		letterSpacing: "0.12em",
		textAlign: "center" as const,
		textTransform: "uppercase" as const,
		color: theme.palette.text.primary,
		outline: "none",
		transition: "border-color 150ms, background 150ms, box-shadow 150ms",

		"&::placeholder": { color: theme.meridian.text.tx4 },

		"&:focus": {
			borderColor: accent,
			background: theme.meridian.surfaces.s3,
			boxShadow: `0 0 0 3px rgba(${accentRgb}, 0.1)`,
		},
	};
});

// ── Component ───────────────────────────────────────────────────────────────

interface MfaStepProps {
	readonly mfaCode: string;
	readonly onCodeChange: (code: string) => void;
	readonly onAutoSubmit?: () => void;
	readonly onBack?: () => void;
}

export const MfaStep = memo(function MfaStep({
	mfaCode,
	onCodeChange,
	onAutoSubmit,
	onBack,
}: MfaStepProps) {
	const [useBackupCode, setUseBackupCode] = useState(false);
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
	const digits = mfaCode.split("").concat(Array<string>(6).fill("")).slice(0, 6);

	// Ref para onAutoSubmit: evita que el useEffect se re-dispare
	// cuando la referencia del callback cambia por re-renders de Redux.
	const onAutoSubmitRef = useRef(onAutoSubmit);
	useEffect(() => {
		onAutoSubmitRef.current = onAutoSubmit;
	});

	// TOTP countdown timer (30s cycle)
	const [totpSecs, setTotpSecs] = useState(() => {
		const PERIOD = 30;
		return PERIOD - (Math.floor(Date.now() / 1000) % PERIOD);
	});

	useEffect(() => {
		if (useBackupCode) return;
		const PERIOD = 30;
		const tick = () => setTotpSecs(PERIOD - (Math.floor(Date.now() / 1000) % PERIOD));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [useBackupCode]);

	const CIRC = 2 * Math.PI * 11; // ~69.115
	const timerOffset = CIRC * (1 - totpSecs / 30);
	const timerColor = totpSecs <= 10 ? "var(--err, #F87171)" : undefined; // falls back to accent

	// Focus first input on mount / mode switch
	useEffect(() => {
		if (!useBackupCode) {
			inputsRef.current[0]?.focus();
		}
	}, [useBackupCode]);

	// Auto-submit when 6 digits are filled (TOTP mode).
	// Usa ref para evitar que cambios de referencia en onAutoSubmit re-disparen el effect.
	useEffect(() => {
		if (!useBackupCode && mfaCode.length === 6 && onAutoSubmitRef.current) {
			const timer = setTimeout(() => onAutoSubmitRef.current?.(), 80);
			return () => clearTimeout(timer);
		}
	}, [mfaCode, useBackupCode]);

	const handleInput = useCallback(
		(index: number, value: string) => {
			const filtered = useBackupCode
				? value.replace(/[^a-zA-Z0-9]/g, "")
				: value.replace(/[^0-9]/g, "");

			if (!filtered) return;

			const char = filtered[0];
			const newDigits = mfaCode.split("").concat(Array<string>(6).fill("")).slice(0, 6);
			newDigits[index] = char;
			const newCode = newDigits.join("").replace(/\s/g, "");
			onCodeChange(newCode);

			if (index < 5) {
				inputsRef.current[index + 1]?.focus();
			}
		},
		[useBackupCode, mfaCode, onCodeChange],
	);

	const handleKeyDown = useCallback(
		(index: number, e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Backspace") {
				e.preventDefault();
				const newDigits = mfaCode.split("").concat(Array<string>(6).fill("")).slice(0, 6);

				if (newDigits[index]) {
					newDigits[index] = "";
					onCodeChange(newDigits.join("").trimEnd());
				} else if (index > 0) {
					newDigits[index - 1] = "";
					onCodeChange(newDigits.join("").trimEnd());
					inputsRef.current[index - 1]?.focus();
				}
			}
		},
		[mfaCode, onCodeChange],
	);

	const handlePaste = useCallback(
		(e: ClipboardEvent<HTMLInputElement>) => {
			e.preventDefault();
			const paste = e.clipboardData.getData("text").trim();
			const chars = (
				useBackupCode
					? paste.replace(/[^a-zA-Z0-9]/g, "")
					: paste.replace(/[^0-9]/g, "")
			)
				.split("")
				.slice(0, 6);

			onCodeChange(chars.join(""));

			const lastIdx = Math.min(chars.length, 6) - 1;
			if (lastIdx >= 0) {
				inputsRef.current[lastIdx]?.focus();
			}
		},
		[useBackupCode, onCodeChange],
	);

	const toggleMode = useCallback(
		(backup: boolean) => {
			setUseBackupCode(backup);
			onCodeChange("");
		},
		[onCodeChange],
	);

	return (
		<Box>
			{/* MFA Icon */}
			<MfaIconWrap>
				<MfaIconGlow />
				<MfaIconBox>
					<ShieldCheck />
				</MfaIconBox>
			</MfaIconWrap>

			{/* Tabs */}
			<TabRow>
				<Tab
					type="button"
					ownerState={{ active: !useBackupCode }}
					onClick={() => toggleMode(false)}
				>
					<ShieldCheck size={13} />
					Código TOTP
				</Tab>
				<Tab
					type="button"
					ownerState={{ active: useBackupCode }}
					onClick={() => toggleMode(true)}
				>
					<Lock size={13} />
					Código de respaldo
				</Tab>
			</TabRow>

			{/* TOTP mode: 6 digit boxes */}
			{!useBackupCode && (
				<Box>
					<OtpHint sx={{ mb: 2 }}>
						Código de 6 dígitos de tu app autenticadora
					</OtpHint>

					<OtpRow>
						{digits.map((digit, idx) => (
							<Box key={idx} sx={{ display: "contents" }}>
								{idx === 3 && <OtpSep>·</OtpSep>}
								<OtpBox
									ref={(el: HTMLInputElement | null) => {
										inputsRef.current[idx] = el;
									}}
									type="text"
									inputMode="numeric"
									maxLength={1}
									value={digit || ""}
									ownerState={{ filled: !!digit }}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInput(idx, e.target.value)
									}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										handleKeyDown(idx, e)
									}
									onPaste={idx === 0 ? handlePaste : undefined}
									autoComplete={idx === 0 ? "one-time-code" : "off"}
								/>
							</Box>
						))}
					</OtpRow>

					{/* TOTP Timer Ring */}
					<TimerRow>
						<svg
							width={28}
							height={28}
							viewBox="0 0 24 24"
							style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
							aria-hidden="true"
						>
							<circle
								cx="12"
								cy="12"
								r="11"
								fill="none"
								stroke="var(--s4, #252532)"
								strokeWidth="2.5"
							/>
							<circle
								cx="12"
								cy="12"
								r="11"
								fill="none"
								stroke={timerColor ?? "currentColor"}
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeDasharray={CIRC}
								strokeDashoffset={timerOffset}
								style={{
									transition: "stroke-dashoffset 1s linear, stroke 0.5s",
									color: timerColor ? undefined : "var(--acc, #818CF8)",
								}}
							/>
						</svg>
						<TimerNum>{String(totpSecs).padStart(2, "0")}</TimerNum>
						<TimerLabel>seg restantes</TimerLabel>
					</TimerRow>
				</Box>
			)}

			{/* Backup mode: single input */}
			{useBackupCode && (
				<Box sx={{ py: "4px" }}>
					<OtpHint sx={{ mb: 2 }}>
						Ingresa uno de tus códigos de respaldo de 12 caracteres
					</OtpHint>
					<BackupInput
						type="text"
						inputMode="text"
						maxLength={14}
						value={mfaCode}
						placeholder="XXXX-XXXX-XXXX"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							onCodeChange(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))
						}
						autoComplete="off"
						autoFocus
					/>
				</Box>
			)}

			{/* Back link */}
			{onBack && (
				<Box sx={{ textAlign: "center", mt: "10px" }}>
					<BackLink onClick={onBack} tabIndex={0} role="button">
						<ArrowLeft size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
						Cambiar área o sistema
					</BackLink>
				</Box>
			)}

			{/* Security footer */}
			<SecurityRow>
				<Lock size={11} />
				Acceso protegido con cifrado extremo a extremo
			</SecurityRow>
		</Box>
	);
});
