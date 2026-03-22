import { Building2, LogIn, MailCheck, QrCode, ShieldCheck } from "lucide-react";
import type { LoginStep, StepConfig } from "./types";

/** Labels base del stepper (2 fijos + dinámicos según flujo) */
export const STEPPER_LABELS_BASE = ["Credenciales", "Área y sistema"] as const;

/** Labels adicionales según el flujo */
export const STEPPER_LABEL_MFA = "Verificación";
export const STEPPER_LABEL_SETUP = "Configurar MFA";
export const STEPPER_LABEL_BACKUP = "Códigos";

export const STEP_CONFIG: Record<LoginStep, StepConfig> = {
	0: {
		title: "Bienvenido",
		subtitle: "Ingresa tus credenciales para continuar",
		buttonLabel: "Continuar",
		icon: LogIn,
	},
	1: {
		title: "Selecciona tu espacio",
		subtitle: "Elige el área y sistema donde trabajarás",
		buttonLabel: "Ingresar",
		icon: Building2,
	},
	2: {
		title: "Verificación en dos pasos",
		subtitle: "Ingresa el código de 6 dígitos de tu aplicación autenticadora",
		buttonLabel: "Verificar",
		icon: ShieldCheck,
	},
	3: {
		title: "Códigos de respaldo",
		subtitle: "Guarda estos códigos en un lugar seguro",
		buttonLabel: "Continuar al sistema",
		icon: ShieldCheck,
	},
};

/** Config para el paso de MFA setup inline (fase scan) */
export const MFA_SETUP_SCAN_CONFIG: StepConfig = {
	title: "Configura tu autenticador",
	subtitle: "Escanea el código QR con tu app de autenticación",
	buttonLabel: "Verificar y activar",
	icon: QrCode,
};

/** Config para el paso de MFA setup inline (fase backup codes) */
export const MFA_SETUP_BACKUP_CONFIG: StepConfig = {
	title: "Códigos de respaldo",
	subtitle: "Guarda estos códigos en un lugar seguro",
	buttonLabel: "Continuar al sistema",
	icon: ShieldCheck,
};

export const MFA_PENDING_CONFIG: StepConfig = {
	title: "Configuración MFA requerida",
	subtitle: "Necesitas configurar la verificación en dos pasos",
	icon: MailCheck,
	buttonLabel: "",
};
