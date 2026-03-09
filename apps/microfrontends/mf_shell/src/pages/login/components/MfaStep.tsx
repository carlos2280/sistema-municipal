import { Box, styled } from "@mui/material";
import { KeyRound, ShieldCheck } from "lucide-react";
import {
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ClipboardEvent,
	type KeyboardEvent,
} from "react";

// ── Individual digit input (matching prototype) ──────────────────────────────

const CodeGroup = styled(Box)({
	display: "flex",
	gap: 8,
	justifyContent: "center",
	margin: "20px 0",

	"@media (max-width: 639px)": { gap: 6 },
	"@media (max-width: 380px)": { gap: 4 },
});

const CodeInput = styled("input")<{ ownerState: { filled: boolean } }>(
	({ theme, ownerState }) => ({
		width: 48,
		height: 56,
		textAlign: "center",
		fontFamily: '"JetBrains Mono", "Fira Code", monospace',
		fontSize: "1.5rem",
		fontWeight: 700,
		letterSpacing: 0,
		border: `2px solid ${ownerState.filled ? "#0d6b5e" : theme.palette.divider}`,
		borderRadius: 8,
		background: ownerState.filled
			? "rgba(13, 107, 94, 0.04)"
			: theme.palette.background.default,
		color: theme.palette.text.primary,
		outline: "none",
		transition: "all 100ms ease",
		caretColor: "transparent",

		"&:focus": {
			borderColor: "#0d6b5e",
			boxShadow: "0 0 0 3px rgba(13, 107, 94, 0.12)",
			background: theme.palette.background.paper,
		},

		"@media (max-width: 639px)": {
			width: 42,
			height: 48,
			fontSize: "1.25rem",
		},

		"@media (max-width: 380px)": {
			width: 38,
			height: 44,
			fontSize: "1.125rem",
		},
	}),
);

const ModeToggle = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	marginTop: 12,
});

const ModeButton = styled("button")<{ ownerState: { active: boolean } }>(
	({ theme, ownerState }) => ({
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		padding: "6px 14px",
		border: `1px solid ${ownerState.active ? "rgba(13, 107, 94, 0.3)" : theme.palette.divider}`,
		borderRadius: 20,
		background: ownerState.active
			? "rgba(13, 107, 94, 0.10)"
			: "transparent",
		color: ownerState.active ? "#0d6b5e" : theme.palette.text.secondary,
		fontFamily: "inherit",
		fontSize: "0.75rem",
		fontWeight: ownerState.active ? 600 : 500,
		cursor: "pointer",
		transition: "all 100ms ease",

		"&:hover": {
			borderColor: "#0d6b5e",
			color: "#0d6b5e",
			background: "rgba(13, 107, 94, 0.04)",
		},
	}),
);

// ── Component ────────────────────────────────────────────────────────────────

interface MfaStepProps {
	mfaCode: string;
	onCodeChange: (code: string) => void;
}

export const MfaStep = memo(function MfaStep({
	mfaCode,
	onCodeChange,
}: MfaStepProps) {
	const [useBackupCode, setUseBackupCode] = useState(false);
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
	const digits = mfaCode.split("").concat(Array(6).fill("")).slice(0, 6);

	// Focus first input on mount
	useEffect(() => {
		inputsRef.current[0]?.focus();
	}, [useBackupCode]);

	const handleInput = useCallback(
		(index: number, value: string) => {
			const filtered = useBackupCode
				? value.replace(/[^a-zA-Z0-9]/g, "")
				: value.replace(/[^0-9]/g, "");

			if (!filtered) return;

			const char = filtered[0];
			const newDigits = mfaCode.split("").concat(Array(6).fill("")).slice(0, 6);
			newDigits[index] = char;
			const newCode = newDigits.join("").replace(/\s/g, "");
			onCodeChange(newCode);

			// Advance to next input
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
				const newDigits = mfaCode
					.split("")
					.concat(Array(6).fill(""))
					.slice(0, 6);

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
			<CodeGroup>
				{digits.map((digit, idx) => (
					<CodeInput
						key={idx}
						ref={(el) => {
							inputsRef.current[idx] = el;
						}}
						type="text"
						inputMode={useBackupCode ? "text" : "numeric"}
						maxLength={1}
						value={digit || ""}
						ownerState={{ filled: !!digit }}
						onChange={(e) => handleInput(idx, e.target.value)}
						onKeyDown={(e) => handleKeyDown(idx, e)}
						onPaste={idx === 0 ? handlePaste : undefined}
						autoComplete={idx === 0 ? "one-time-code" : "off"}
					/>
				))}
			</CodeGroup>

			<ModeToggle>
				<ModeButton
					type="button"
					ownerState={{ active: !useBackupCode }}
					onClick={() => toggleMode(false)}
				>
					<ShieldCheck size={14} />
					Código TOTP
				</ModeButton>
				<ModeButton
					type="button"
					ownerState={{ active: useBackupCode }}
					onClick={() => toggleMode(true)}
				>
					<KeyRound size={14} />
					Código de respaldo
				</ModeButton>
			</ModeToggle>
		</Box>
	);
});
