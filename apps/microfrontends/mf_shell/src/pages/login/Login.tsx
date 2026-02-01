/**
 * Login Page - Sistema Municipal CrisCar
 *
 * Página de inicio de sesión formal y elegante
 */

import {
	Box,
	Button,
	Card,
	Divider,
	IconButton,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Stack,
	Step,
	StepLabel,
	Stepper,
	TextField,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Eye,
	EyeOff,
	Layers,
	Lock,
	LogIn,
	Mail,
} from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { useLoginFormFlow } from "../../hook/useLoginFormFlow";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const LoginWrapper = styled(Box)(({ theme }) => ({
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor:
		theme.palette.mode === "light"
			? theme.palette.grey[100]
			: theme.palette.grey[900],
	padding: theme.spacing(3),
}));

const LoginCard = styled(Card)(({ theme }) => ({
	width: "100%",
	maxWidth: 420,
	padding: theme.spacing(5),
	borderRadius: 16,
	boxShadow:
		theme.palette.mode === "light"
			? "0 4px 24px rgba(0,0,0,0.08)"
			: "0 4px 24px rgba(0,0,0,0.4)",
	border: `1px solid ${theme.palette.divider}`,
}));

const LogoSection = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	marginBottom: theme.spacing(4),
}));

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

const SubmitButton = styled(Button)(({ theme }) => ({
	height: 48,
	borderRadius: 8,
	fontSize: "0.95rem",
	fontWeight: 600,
	textTransform: "none",
}));

// ============================================================================
// CREDENTIAL FORM (STEP 1)
// ============================================================================

function CredentialForm() {
	const { control } = useFormContext();
	const [showPassword, setShowPassword] = useState(false);

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
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Mail size={18} style={{ opacity: 0.5 }} />
								</InputAdornment>
							),
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
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Lock size={18} style={{ opacity: 0.5 }} />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										size="small"
										onClick={() => setShowPassword(!showPassword)}
										edge="end"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				)}
			/>
		</Stack>
	);
}

// ============================================================================
// AREA/SYSTEM FORM (STEP 2)
// ============================================================================

interface AreaSystemFormProps {
	areas: Array<{ id: number; nombre: string }>;
	sistemas: Array<{ id: number; nombre: string }>;
}

function AreaSystemForm({ areas, sistemas }: AreaSystemFormProps) {
	const { control, watch } = useFormContext();
	const selectedArea = watch("areaId");

	return (
		<Stack spacing={2.5}>
			<Controller
				name="areaId"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						select
						fullWidth
						label="Área de trabajo"
						value={field.value ?? ""}
						error={invalid}
						helperText={error?.message}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Building2 size={18} style={{ opacity: 0.5 }} />
								</InputAdornment>
							),
						}}
					>
						{areas.map((area) => (
							<MenuItem key={area.id} value={area.id}>
								{area.nombre}
							</MenuItem>
						))}
					</StyledTextField>
				)}
			/>

			{selectedArea && sistemas.length > 0 && (
				<Controller
					name="sistemaId"
					control={control}
					render={({ field, fieldState: { invalid, error } }) => (
						<StyledTextField
							{...field}
							select
							fullWidth
							label="Sistema"
							value={field.value ?? ""}
							error={invalid}
							helperText={error?.message}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Layers size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
							}}
						>
							{sistemas.map((sistema) => (
								<MenuItem key={sistema.id} value={sistema.id}>
									{sistema.nombre}
								</MenuItem>
							))}
						</StyledTextField>
					)}
				/>
			)}

			{selectedArea && sistemas.length === 0 && (
				<Box sx={{ py: 2 }}>
					<LinearProgress sx={{ borderRadius: 1 }} />
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 1, textAlign: "center" }}
					>
						Cargando sistemas...
					</Typography>
				</Box>
			)}
		</Stack>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Login() {
	const theme = useMuiTheme();
	const { activeStep, areas, sistemas, methods, handleNext, handleBack } =
		useLoginFormFlow();

	const steps = ["Credenciales", "Área y Sistema"];

	// Watch para reactividad - esto hace que el componente se re-renderice cuando cambian los valores
	const watchedValues = methods.watch();

	// Validación del paso actual
	const isStepValid = () => {
		if (activeStep === 0) {
			// Paso 1: validar que existan correo y contraseña
			const correo = watchedValues.correo?.trim();
			const contrasena = watchedValues.contrasena;
			return !!(correo && contrasena);
		}

		if (activeStep === 1) {
			// Paso 2: validar área y sistema
			return !!(watchedValues.areaId && watchedValues.sistemaId);
		}

		return false;
	};

	return (
		<LoginWrapper>
			<LoginCard>
				{/* Logo */}
				<LogoSection>
					<img
						src="/logo-criscar.svg"
						alt="CrisCar"
						width={64}
						height={64}
						style={{ marginBottom: 12 }}
					/>
					<Typography
						variant="h5"
						fontWeight={700}
						color="primary.main"
						sx={{ mb: 0.5 }}
					>
						CrisCar
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
					>
						Sistema Municipal
					</Typography>
				</LogoSection>

				{/* Título */}
				<Box sx={{ textAlign: "center", mb: 4 }}>
					<Typography variant="h6" fontWeight={600}>
						Iniciar Sesión
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{activeStep === 0
							? "Ingrese sus credenciales"
							: "Seleccione su área de trabajo"}
					</Typography>
				</Box>

				{/* Stepper */}
				<Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
					{steps.map((label) => (
						<Step key={label}>
							<StepLabel>
								<Typography variant="caption">{label}</Typography>
							</StepLabel>
						</Step>
					))}
				</Stepper>

				{/* Formulario */}
				<FormProvider {...methods}>
					<Box sx={{ mb: 3 }}>
						{activeStep === 0 && <CredentialForm />}
						{activeStep === 1 && (
							<AreaSystemForm areas={areas} sistemas={sistemas} />
						)}
					</Box>

					{/* Botones */}
					<Stack spacing={1.5}>
						<SubmitButton
							fullWidth
							variant="contained"
							onClick={handleNext}
							disabled={!isStepValid()}
							endIcon={
								activeStep === 0 ? <ArrowRight size={18} /> : <LogIn size={18} />
							}
						>
							{activeStep === 0 ? "Continuar" : "Ingresar"}
						</SubmitButton>

						{activeStep > 0 && (
							<Button
								fullWidth
								variant="text"
								onClick={handleBack}
								startIcon={<ArrowLeft size={18} />}
								sx={{ textTransform: "none" }}
							>
								Volver
							</Button>
						)}
					</Stack>
				</FormProvider>

				{/* Footer */}
				<Divider sx={{ my: 3 }} />
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", textAlign: "center" }}
				>
					Acceso seguro con encriptación
				</Typography>
			</LoginCard>
		</LoginWrapper>
	);
}
