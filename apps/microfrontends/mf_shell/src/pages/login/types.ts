import type { LucideIcon } from "lucide-react";

export interface AreaOption {
	readonly id: number;
	readonly nombre: string;
	readonly descripcion: string | null;
}

export interface SistemaOption {
	readonly id: number;
	readonly nombre: string;
	readonly codigo: string;
}

/**
 * Pasos del login dinámicos:
 * 0 = Credenciales
 * 1 = Área y sistema
 * 2 = Verificación MFA (usuario con MFA activo) ó MFA Setup QR (usuario sin MFA)
 * 3 = Backup codes (solo en flujo de setup inline)
 */
export type LoginStep = 0 | 1 | 2 | 3;

/** Fase del MFA setup inline dentro del login */
export type MfaSetupPhase = "scan" | "backup";

export interface StepConfig {
	readonly title: string;
	readonly subtitle: string;
	readonly buttonLabel: string;
	readonly icon: LucideIcon;
}
