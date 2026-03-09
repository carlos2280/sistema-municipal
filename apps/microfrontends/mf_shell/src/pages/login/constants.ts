import { Building2, LogIn, MailCheck, ShieldCheck } from "lucide-react";
import type { LoginStep, StepConfig } from "./types";

export const STEPPER_LABELS = ["Credenciales", "Área y Sistema"] as const;

export const STEP_CONFIG: Record<LoginStep, StepConfig> = {
	0: {
		title: "Iniciar Sesión",
		subtitle: "Ingresa tus credenciales para acceder al sistema",
		buttonLabel: "Continuar",
		icon: LogIn,
		iconVariant: "jade",
	},
	1: {
		title: "Selecciona tu espacio",
		subtitle: "Elige el área y sistema donde trabajarás",
		buttonLabel: "Ingresar",
		icon: Building2,
		iconVariant: "indigo",
	},
	2: {
		title: "Verificación en dos pasos",
		subtitle:
			"Ingresa el código de 6 dígitos de tu aplicación autenticadora",
		buttonLabel: "Verificar",
		icon: ShieldCheck,
		iconVariant: "gold",
	},
};

export const MFA_PENDING_CONFIG = {
	title: "Configuración MFA requerida",
	subtitle: "Necesitas configurar la verificación en dos pasos",
	icon: MailCheck,
	iconVariant: "jade" as const,
};
