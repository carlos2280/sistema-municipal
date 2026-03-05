import type { JSX } from "react";

export interface MicrofrontModule {
	sistemaId: number;
	components: Record<string, JSX.Element>;
	status?: "loaded" | "failed" | "fallback";
	loadTime?: number;
	error?: string;
}
