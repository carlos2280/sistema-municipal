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
	styled,
} from "@mui/material";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Eye,
	EyeOff,
	KeyRound,
	Layers,
	Lock,
	LogIn,
	Mail,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import {
	selectTenantLogoUrl,
	selectTenantNombre,
	useAppSelector,
} from "mf_store/store";
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
// MFA FORM (STEP 3)
// ============================================================================

interface MfaFormProps {
	mfaCode: string;
	onCodeChange: (code: string) => void;
}

function MfaForm({ mfaCode, onCodeChange }: MfaFormProps) {
	const [useBackupCode, setUseBackupCode] = useState(false);

	const handleChange = (value: string) => {
		if (useBackupCode) {
			onCodeChange(value.trim().slice(0, 32));
		} else {
			onCodeChange(value.replace(/\D/g, "").slice(0, 6));
		}
	};

	return (
		<Stack spacing={2.5}>
			<Typography
				variant="body2"
				color="text.secondary"
				textAlign="center"
				sx={{ px: 1 }}
			>
				{useBackupCode
					? "Ingrese uno de sus códigos de respaldo."
					: "Ingrese el código de 6 dígitos de su aplicación autenticadora."}
			</Typography>

			<StyledTextField
				fullWidth
				label={useBackupCode ? "Código de respaldo" : "Código MFA"}
				value={mfaCode}
				onChange={(e) => handleChange(e.target.value)}
				autoFocus
				inputProps={{
					inputMode: useBackupCode ? "text" : "numeric",
					pattern: useBackupCode ? undefined : "[0-9]*",
					maxLength: useBackupCode ? 32 : 6,
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							{useBackupCode ? (
								<KeyRound size={18} style={{ opacity: 0.5 }} />
							) : (
								<ShieldCheck size={18} style={{ opacity: 0.5 }} />
							)}
						</InputAdornment>
					),
				}}
			/>

			<Button
				variant="text"
				size="small"
				onClick={() => {
					setUseBackupCode((prev) => !prev);
					onCodeChange("");
				}}
				sx={{ textTransform: "none", alignSelf: "center", color: "text.secondary" }}
			>
				{useBackupCode
					? "Usar código TOTP en su lugar"
					: "Usar código de respaldo en su lugar"}
			</Button>
		</Stack>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Login() {
	const tenantNombre = useAppSelector(selectTenantNombre);
	const tenantLogoUrl = useAppSelector(selectTenantLogoUrl);
	const {
		activeStep,
		areas,
		sistemas,
		methods,
		handleNext,
		handleBack,
		mfaCode,
		setMfaCode,
	} = useLoginFormFlow();

	const steps = ["Credenciales", "Área y Sistema"];

	// Watch para reactividad
	const watchedValues = methods.watch();

	const isStepValid = () => {
		if (activeStep === 0) {
			const correo = watchedValues.correo?.trim();
			const contrasena = watchedValues.contrasena;
			return !!(correo && contrasena);
		}
		if (activeStep === 1) {
			return !!(watchedValues.areaId && watchedValues.sistemaId);
		}
		if (activeStep === 2) {
			return mfaCode.trim().length >= 6;
		}
		return false;
	};

	const getSubtitle = () => {
		if (activeStep === 0) return "Ingrese sus credenciales";
		if (activeStep === 1) return "Seleccione su área de trabajo";
		return "Ingrese su código de verificación";
	};

	const getButtonLabel = () => {
		if (activeStep === 0) return "Continuar";
		if (activeStep === 1) return "Ingresar";
		return "Verificar";
	};

	const getButtonIcon = () => {
		if (activeStep === 0) return <ArrowRight size={18} />;
		if (activeStep === 1) return <LogIn size={18} />;
		return <ShieldCheck size={18} />;
	};

	return (
		<LoginWrapper>
			<LoginCard>
				{/* Logo */}
				<LogoSection>
					<img
						src={tenantLogoUrl || "/logo-criscar.svg"}
						alt={tenantNombre || "CrisCar"}
						width={64}
						height={64}
						style={{ marginBottom: 12, objectFit: "contain" }}
					/>
					<Typography
						variant="h5"
						fontWeight={700}
						color="primary.main"
						sx={{ mb: 0.5 }}
					>
						{tenantNombre || "CrisCar"}
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
						{activeStep === 2 ? "Verificación en dos pasos" : "Iniciar Sesión"}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{getSubtitle()}
					</Typography>
				</Box>

				{/* Stepper — solo para pasos 0 y 1 */}
				{activeStep < 2 && (
					<Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
						{steps.map((label) => (
							<Step key={label}>
								<StepLabel>
									<Typography variant="caption">{label}</Typography>
								</StepLabel>
							</Step>
						))}
					</Stepper>
				)}

				{/* Ícono MFA en paso 2 */}
				{activeStep === 2 && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							mb: 3,
							color: "primary.main",
							opacity: 0.8,
						}}
					>
						<ShieldCheck size={48} />
					</Box>
				)}

				{/* Formulario */}
				<FormProvider {...methods}>
					<Box sx={{ mb: 3 }}>
						{activeStep === 0 && <CredentialForm />}
						{activeStep === 1 && (
							<AreaSystemForm areas={areas} sistemas={sistemas} />
						)}
						{activeStep === 2 && (
							<MfaForm mfaCode={mfaCode} onCodeChange={setMfaCode} />
						)}
					</Box>

					{/* Botones */}
					<Stack spacing={1.5}>
						<SubmitButton
							fullWidth
							variant="contained"
							onClick={handleNext}
							disabled={!isStepValid()}
							endIcon={getButtonIcon()}
						>
							{getButtonLabel()}
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
