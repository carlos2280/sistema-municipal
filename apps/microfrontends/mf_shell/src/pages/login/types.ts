import type { LucideIcon } from "lucide-react";

export interface AreaOption {
	readonly id: number;
	readonly nombre: string;
	readonly descripcion: string | null;
}

export interface SistemaOption {
	readonly id: number;
	readonly nombre: string;
}

export type LoginStep = 0 | 1 | 2;

export interface StepConfig {
	readonly title: string;
	readonly subtitle: string;
	readonly buttonLabel: string;
	readonly icon: LucideIcon;
}
