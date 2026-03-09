import {
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	styled,
} from "@mui/material";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { TSchemaCredenciales } from "../../../types/login.zod";

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

export const CredentialsStep = memo(function CredentialsStep() {
	const { control } = useFormContext<TSchemaCredenciales>();
	const [showPassword, setShowPassword] = useState(false);

	const togglePassword = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	return (
		<Stack spacing={2.5}>
			<Controller
				name="correo"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						fullWidth
						label="Correo electrónico"
						type="email"
						value={field.value ?? ""}
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
				name="contrasena"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						fullWidth
						label="Contraseña"
						type={showPassword ? "text" : "password"}
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
											onClick={togglePassword}
											edge="end"
											aria-label={
												showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
											}
										>
											{showPassword ? (
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
