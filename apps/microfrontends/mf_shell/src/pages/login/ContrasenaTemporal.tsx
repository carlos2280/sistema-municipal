/**
 * ContrasenaTemporal — Cambio de contraseña temporal MERIDIAN
 *
 * URL: /contrasena-temporal?token=<token>
 * Split-panel layout con BrandingPanel + formulario.
 * Todos los colores desde theme, nada hardcoded.
 */

import {
	Alert,
	Box,
	alpha,
	styled,
} from "@mui/material";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import useContrasenaTemporal from "../../hook/useContrasenaTemporal";
import { AuthLayout } from "./components/AuthLayout";
import { AuthCard } from "./components/AuthCard";
import { AuthHeader } from "./components/AuthHeader";
import { AuthFooter } from "./components/AuthFooter";

// ── Styled: Inputs MERIDIAN ─────────────────────────────────────────────────

const FieldGroup = styled(Box)(() => ({
	display: "flex",
	flexDirection: "column",
	gap: 6,
	marginBottom: 14,
	"&:last-of-type": { marginBottom: 0 },
}));

const Label = styled("label")(({ theme }) => ({
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: "0.07em",
	textTransform: "uppercase" as const,
	color: theme.palette.text.disabled,
}));

const InputWrapper = styled(Box)(() => ({
	position: "relative",
	display: "flex",
	alignItems: "center",
}));

const InputIcon = styled(Box)(({ theme }) => ({
	position: "absolute",
	left: 13,
	color: theme.meridian.text.tx4,
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	zIndex: 1,
	"& svg": { width: 15, height: 15, strokeWidth: 1.5 },
}));

const StyledInput = styled("input")(({ theme }) => {
	const accent = theme.palette.primary.main;
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		width: "100%",
		background: theme.meridian.surfaces.s2,
		border: `1.5px solid ${theme.palette.divider}`,
		borderRadius: 8,
		padding: "12px 14px 12px 42px",
		fontSize: 13.5,
		fontFamily: theme.typography.fontFamily,
		color: theme.palette.text.primary,
		outline: "none",
		transition: "border-color 150ms, background 150ms, box-shadow 150ms",

		"&::placeholder": { color: theme.meridian.text.tx4 },
		"&:disabled": { opacity: 0.6, cursor: "not-allowed" },

		"&:hover:not(:disabled)": {
			borderColor: theme.meridian.borders.strong,
			background: theme.meridian.surfaces.s3,
		},

		"&:focus": {
			borderColor: accent,
			background: theme.meridian.surfaces.s3,
			boxShadow: `0 0 0 3px rgba(${accentRgb}, 0.1)`,
		},
	};
});

const EyeButton = styled("button")(({ theme }) => ({
	position: "absolute",
	right: 10,
	background: "none",
	border: "none",
	cursor: "pointer",
	color: theme.meridian.text.tx4,
	padding: 5,
	borderRadius: 5,
	display: "flex",
	alignItems: "center",
	transition: "color 150ms, background 150ms",

	"&:hover": {
		color: theme.palette.text.secondary,
		background: theme.meridian.surfaces.s4,
	},

	"& svg": { width: 15, height: 15, strokeWidth: 1.5 },
}));

const ErrorText = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 4,
	fontSize: 11.5,
	color: theme.palette.error.main,
}));

const PrimaryButton = styled("button")(({ theme }) => {
	const accent = theme.palette.primary.main;
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 7,
		width: "100%",
		padding: "12px 20px",
		borderRadius: 8,
		fontSize: 13.5,
		fontWeight: 600,
		fontFamily: theme.typography.fontFamily,
		cursor: "pointer",
		border: "none",
		transition: "all 150ms",
		background: accent,
		color: "#08081A",

		"&:not(:disabled):hover": {
			background: alpha(accent, 0.85),
			boxShadow: `0 4px 20px rgba(${accentRgb}, 0.35)`,
			transform: "translateY(-1px)",
		},

		"&:active:not(:disabled)": { transform: "scale(0.98)" },
		"&:disabled": { opacity: 0.4, cursor: "not-allowed" },
		"&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 2 },

		"& svg": { width: 15, height: 15, strokeWidth: 2, flexShrink: 0 },
	};
});

// ── Form fields (isolated to prevent parent re-renders) ─────────────────────

const TempPasswordForm = memo(function TempPasswordForm() {
	const [showTempPwd, setShowTempPwd] = useState(false);
	const [showNewPwd, setShowNewPwd] = useState(false);

	const toggleTempPwd = useCallback(() => setShowTempPwd((p) => !p), []);
	const toggleNewPwd = useCallback(() => setShowNewPwd((p) => !p), []);

	return (
		<Box>
			{/* Correo */}
			<Controller
				name="correo"
				render={({ field, fieldState: { error } }) => (
					<FieldGroup>
						<Label htmlFor="temp-email">Correo electrónico</Label>
						<InputWrapper>
							<InputIcon><Mail /></InputIcon>
							<StyledInput
								{...field}
								id="temp-email"
								type="email"
								value={field.value ?? ""}
								disabled
								autoComplete="email"
							/>
						</InputWrapper>
						{error && <ErrorText>{error.message}</ErrorText>}
					</FieldGroup>
				)}
			/>

			{/* Contraseña temporal */}
			<Controller
				name="contrasenaTemporal"
				render={({ field, fieldState: { error } }) => (
					<FieldGroup>
						<Label htmlFor="temp-pwd-old">Contraseña temporal</Label>
						<InputWrapper>
							<InputIcon><KeyRound /></InputIcon>
							<StyledInput
								{...field}
								id="temp-pwd-old"
								type={showTempPwd ? "text" : "password"}
								value={field.value ?? ""}
								placeholder="••••••••"
								autoComplete="off"
								style={{ paddingRight: 42 }}
							/>
							<EyeButton
								type="button"
								onClick={toggleTempPwd}
								aria-label={showTempPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
							>
								{showTempPwd ? <EyeOff /> : <Eye />}
							</EyeButton>
						</InputWrapper>
						{error && <ErrorText>{error.message}</ErrorText>}
					</FieldGroup>
				)}
			/>

			{/* Nueva contraseña */}
			<Controller
				name="contrasenaNueva"
				render={({ field, fieldState: { error } }) => (
					<FieldGroup>
						<Label htmlFor="temp-pwd-new">Nueva contraseña</Label>
						<InputWrapper>
							<InputIcon><Lock /></InputIcon>
							<StyledInput
								{...field}
								id="temp-pwd-new"
								type={showNewPwd ? "text" : "password"}
								value={field.value ?? ""}
								placeholder="Mínimo 8 caracteres"
								autoComplete="new-password"
								style={{ paddingRight: 42 }}
							/>
							<EyeButton
								type="button"
								onClick={toggleNewPwd}
								aria-label={showNewPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
							>
								{showNewPwd ? <EyeOff /> : <Eye />}
							</EyeButton>
						</InputWrapper>
						{error && <ErrorText>{error.message}</ErrorText>}
					</FieldGroup>
				)}
			/>
		</Box>
	);
});

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContrasenaTemporal() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? undefined;

	const { isError, methods, handleSubmit } = useContrasenaTemporal(token);

	return (
		<AuthLayout>
			<AuthCard>
				<AuthHeader
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

					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
						<PrimaryButton
							type="button"
							disabled={!methods.formState.isValid}
							onClick={methods.handleSubmit(handleSubmit)}
						>
							<Lock size={15} />
							<span>Cambiar contraseña</span>
						</PrimaryButton>
					</Box>
				</FormProvider>

				<AuthFooter />
			</AuthCard>
		</AuthLayout>
	);
}
