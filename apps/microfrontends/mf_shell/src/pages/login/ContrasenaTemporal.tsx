/**
 * ContrasenaTemporal — Temporary password change page
 *
 * URL: /contrasena-temporal?token=<token>
 * Split-panel layout with branding + form card.
 */

import {
	Alert,
	Box,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	styled,
} from "@mui/material";
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import useContrasenaTemporal from "../../hook/useContrasenaTemporal";
import type { BrandingFeature } from "./components/BrandingPanel";
import { AuthLayout } from "./components/AuthLayout";
import { AuthCard } from "./components/AuthCard";
import { AuthHeader } from "./components/AuthHeader";
import { AuthFooter } from "./components/AuthFooter";

// ── Branding features ────────────────────────────────────────────────────────

const FEATURES: BrandingFeature[] = [
	{
		icon: KeyRound,
		title: "Cambio de contraseña",
		description:
			"Tu contraseña temporal debe ser cambiada para acceder al sistema de forma segura",
	},
	{
		icon: ShieldCheck,
		title: "Requisitos de seguridad",
		description:
			"Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
	},
];

// ── Styled ───────────────────────────────────────────────────────────────────

const StyledTextField = styled(TextField)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: 8,
		"&:hover fieldset": {
			borderColor: theme.palette.primary.main,
		},
		"&.Mui-focused fieldset": {
			borderWidth: 2,
		},
	},
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
	"&:focus-visible": { outline: "2px solid #0d6b5e", outlineOffset: 2 },
	...(theme.palette.mode === "dark" && {
		"&:hover:not(:disabled)": {
			background: "#0a5249",
			transform: "translateY(-1px)",
			boxShadow: "0 4px 12px rgba(16, 137, 122, 0.35)",
		},
	}),
}));

// ── Form fields (isolated to prevent parent re-renders) ──────────────────────

const TempPasswordForm = memo(function TempPasswordForm() {
	const [showTempPwd, setShowTempPwd] = useState(false);
	const [showNewPwd, setShowNewPwd] = useState(false);

	const toggleTempPwd = useCallback(() => setShowTempPwd((p) => !p), []);
	const toggleNewPwd = useCallback(() => setShowNewPwd((p) => !p), []);

	return (
		<Stack spacing={2.5}>
			<Controller
				name="correo"
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						fullWidth
						label="Correo electrónico"
						type="email"
						value={field.value ?? ""}
						disabled
						error={invalid}
						helperText={error?.message}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Mail size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
							},
						}}
					/>
				)}
			/>

			<Controller
				name="contrasenaTemporal"
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						fullWidth
						label="Contraseña temporal"
						type={showTempPwd ? "text" : "password"}
						value={field.value ?? ""}
						error={invalid}
						helperText={error?.message}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<KeyRound size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onClick={toggleTempPwd}
											edge="end"
											aria-label={
												showTempPwd
													? "Ocultar contraseña"
													: "Mostrar contraseña"
											}
										>
											{showTempPwd ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
				)}
			/>

			<Controller
				name="contrasenaNueva"
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						fullWidth
						label="Nueva contraseña"
						type={showNewPwd ? "text" : "password"}
						value={field.value ?? ""}
						error={invalid}
						helperText={error?.message}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Lock size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onClick={toggleNewPwd}
											edge="end"
											aria-label={
												showNewPwd
													? "Ocultar contraseña"
													: "Mostrar contraseña"
											}
										>
											{showNewPwd ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
				)}
			/>
		</Stack>
	);
});

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContrasenaTemporal() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? undefined;

	const { isError, methods, handleSubmit } = useContrasenaTemporal(token);

	return (
		<AuthLayout features={FEATURES}>
			<AuthCard>
				<AuthHeader
					icon={KeyRound}
					iconVariant="gold"
					title="Cambiar contraseña temporal"
					subtitle="Tu cuenta requiere un cambio de contraseña antes de continuar"
				/>

				<Alert
					variant="filled"
					severity="warning"
					sx={{ mb: 2, borderRadius: 2 }}
				>
					Debe modificar su contraseña.
				</Alert>

				{isError && (
					<Alert
						variant="filled"
						severity="error"
						sx={{ mb: 2, borderRadius: 2 }}
					>
						Tiempo caducado, informe al administrador.
					</Alert>
				)}

				<FormProvider {...methods}>
					<Box sx={{ mb: 3 }}>
						<TempPasswordForm />
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
						}}
					>
						<PrimaryButton
							type="button"
							disabled={!methods.formState.isValid}
							onClick={methods.handleSubmit(handleSubmit)}
						>
							<Lock size={18} />
							<span>Cambiar contraseña</span>
						</PrimaryButton>
					</Box>
				</FormProvider>

				<AuthFooter />
			</AuthCard>
		</AuthLayout>
	);
}
