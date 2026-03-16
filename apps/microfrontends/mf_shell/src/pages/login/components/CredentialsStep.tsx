/**
 * CredentialsStep — Campos email + contraseña MERIDIAN
 *
 * Inputs con icono prefix, labels uppercase, bordes y focus del tema.
 * Usa tokens MERIDIAN para colores de superficie, borde y texto.
 */

import { Box, alpha, styled } from "@mui/material";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { TSchemaCredenciales } from "../../../types/login.zod";

// ── Styled ──────────────────────────────────────────────────────────────────

const FieldGroup = styled(Box)(() => ({
	display: "flex",
	flexDirection: "column",
	gap: 6,
	marginBottom: 14,
	"&:last-of-type": { marginBottom: 0 },
}));

const LabelRow = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
}));

const Label = styled("label")(({ theme }) => ({
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: "0.07em",
	textTransform: "uppercase" as const,
	color: theme.palette.text.disabled,
}));

const ForgotLink = styled("span")(({ theme }) => ({
	fontSize: 11,
	color: theme.palette.primary.main,
	textDecoration: "none",
	cursor: "pointer",
	opacity: 0.75,
	transition: "opacity 150ms",
	"&:hover": { opacity: 1 },
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

		"&:hover": {
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
	"& svg": { width: 12, height: 12, flexShrink: 0 },
}));

// ── Component ───────────────────────────────────────────────────────────────

export const CredentialsStep = memo(function CredentialsStep() {
	const { control } = useFormContext<TSchemaCredenciales>();
	const [showPassword, setShowPassword] = useState(false);

	const togglePassword = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	return (
		<Box>
			{/* Email */}
			<Controller
				name="correo"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<FieldGroup>
						<Label htmlFor="login-email">Correo electrónico</Label>
						<InputWrapper>
							<InputIcon><Mail /></InputIcon>
							<StyledInput
								{...field}
								id="login-email"
								type="email"
								autoComplete="email"
								spellCheck={false}
								placeholder="usuario@municipio.cl"
								value={field.value ?? ""}
							/>
						</InputWrapper>
						{error && (
							<ErrorText>{error.message}</ErrorText>
						)}
					</FieldGroup>
				)}
			/>

			{/* Contraseña */}
			<Controller
				name="contrasena"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<FieldGroup>
						<LabelRow>
							<Label htmlFor="login-pwd">Contraseña</Label>
							<ForgotLink tabIndex={0}>¿Olvidaste tu contraseña?</ForgotLink>
						</LabelRow>
						<InputWrapper>
							<InputIcon><Lock /></InputIcon>
							<StyledInput
								{...field}
								id="login-pwd"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="••••••••"
								value={field.value ?? ""}
							/>
							<EyeButton
								type="button"
								onClick={togglePassword}
								aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
							>
								{showPassword ? <EyeOff /> : <Eye />}
							</EyeButton>
						</InputWrapper>
						{error && (
							<ErrorText>{error.message}</ErrorText>
						)}
					</FieldGroup>
				)}
			/>
		</Box>
	);
});
