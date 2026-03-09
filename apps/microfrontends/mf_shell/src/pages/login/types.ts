import type { LucideIcon } from "lucide-react";

export interface AreaOption {
	id: number;
	nombre: string;
}

export interface SistemaOption {
	id: number;
	nombre: string;
}

export type LoginStep = 0 | 1 | 2;

export type IconVariant = "jade" | "indigo" | "gold" | "success";

export interface StepConfig {
	title: string;
	subtitle: string;
	buttonLabel: string;
	icon: LucideIcon;
	iconVariant: IconVariant;
}
