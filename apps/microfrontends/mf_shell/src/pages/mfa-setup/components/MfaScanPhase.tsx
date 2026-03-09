import {
	Box,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
	styled,
} from "@mui/material";
import { Copy, ShieldCheck, Smartphone } from "lucide-react";
import { memo, useCallback } from "react";

// ── Styled ───────────────────────────────────────────────────────────────────

const QrContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: 20,
	background: theme.palette.background.default,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 12,
	marginBottom: 20,
}));

const SecretKeyBox = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 8,
	padding: 12,
	background: theme.palette.background.paper,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
	width: "100%",
}));

const AppBadge = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "6px 12px",
	background: theme.palette.background.default,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 20,
	fontSize: "0.6875rem",
	fontWeight: 500,
	color: theme.palette.text.secondary,
}));

const PrimaryButton = styled("button")(({ theme }) => ({
	width: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	padding: "12px 20px",
	border: "none",
	borderRadius: 8,
	background: "#0d6b5e",
	color: "#fff",
	fontFamily: "inherit",
	fontSize: "0.875rem",
	fontWeight: 600,
	cursor: "pointer",
	transition: "all 100ms ease",
	"&:hover:not(:disabled)": {
		background: "#0a5249",
		transform: "translateY(-1px)",
		boxShadow: "0 4px 12px rgba(13, 107, 94, 0.3)",
	},
	"&:active:not(:disabled)": { transform: "translateY(0)" },
	"&:disabled": { opacity: 0.5, cursor: "not-allowed" },
	...(theme.palette.mode === "dark" && {
		"&:hover:not(:disabled)": {
			background: "#0a5249",
			transform: "translateY(-1px)",
			boxShadow: "0 4px 12px rgba(16, 137, 122, 0.35)",
		},
	}),
}));

// ── Component ────────────────────────────────────────────────────────────────

interface MfaScanPhaseProps {
	qrDataUrl: string;
	secret: string;
	code: string;
	errorMsg: string;
	onCodeChange: (value: string) => void;
	onActivar: () => void;
}

export const MfaScanPhase = memo(function MfaScanPhase({
	qrDataUrl,
	secret,
	code,
	errorMsg,
	onCodeChange,
	onActivar,
}: MfaScanPhaseProps) {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onCodeChange(e.target.value);
		},
		[onCodeChange],
	);

	const copySecret = useCallback(() => {
		navigator.clipboard.writeText(secret);
	}, [secret]);

	return (
		<Stack spacing={2.5}>
			<QrContainer>
				{qrDataUrl && (
					<Box
						component="img"
						src={qrDataUrl}
						alt="Código QR MFA"
						sx={{
							width: 180,
							height: 180,
							borderRadius: 1,
							border: "1px solid",
							borderColor: "divider",
							bgcolor: "#fff",
							mb: 2,
						}}
					/>
				)}

				<SecretKeyBox>
					<Typography
						component="code"
						sx={{
							fontFamily: '"JetBrains Mono", "Fira Code", monospace',
							fontSize: "0.8125rem",
							fontWeight: 600,
							letterSpacing: "0.08em",
							flex: 1,
							wordBreak: "break-all",
						}}
					>
						{secret}
					</Typography>
					<IconButton size="small" onClick={copySecret} title="Copiar clave">
						<Copy size={16} />
					</IconButton>
				</SecretKeyBox>
			</QrContainer>

			<Box
				sx={{
					display: "flex",
					gap: 1.5,
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<AppBadge>
					<Smartphone size={14} />
					Google Authenticator
				</AppBadge>
				<AppBadge>
					<Smartphone size={14} />
					Authy
				</AppBadge>
				<AppBadge>
					<Smartphone size={14} />
					Microsoft Auth
				</AppBadge>
			</Box>

			<TextField
				fullWidth
				label="Código de verificación (6 dígitos)"
				value={code}
				onChange={handleChange}
				autoFocus
				inputProps={{
					inputMode: "numeric",
					pattern: "[0-9]*",
					maxLength: 6,
				}}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<ShieldCheck size={18} style={{ opacity: 0.5 }} />
							</InputAdornment>
						),
					},
				}}
				sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
			/>

			{errorMsg && (
				<Typography variant="body2" color="error" textAlign="center">
					{errorMsg}
				</Typography>
			)}

			<PrimaryButton
				type="button"
				onClick={onActivar}
				disabled={code.length !== 6}
			>
				<ShieldCheck size={18} />
				<span>Verificar y activar</span>
			</PrimaryButton>
		</Stack>
	);
});
