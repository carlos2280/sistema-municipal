import { Building2, LogIn, MailCheck, ShieldCheck } from "lucide-react";
import type { LoginStep, StepConfig } from "./types";

export const STEPPER_LABELS = [
	"Credenciales",
	"Área y sistema",
	"Verificación",
] as const;

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
		subtitle:
			"Ingresa el código de 6 dígitos de tu aplicación autenticadora",
		buttonLabel: "Verificar",
		icon: ShieldCheck,
	},
};

export const MFA_PENDING_CONFIG: StepConfig = {
	title: "Configuración MFA requerida",
	subtitle: "Necesitas configurar la verificación en dos pasos",
	icon: MailCheck,
	buttonLabel: "",
};
