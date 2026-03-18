/**
 * ═══════════════════════════════════════════════════════════════
 *  MERIDIAN — MUI v7 Theme Definition
 *  Fuente de verdad: tokens.css + theme-light.css del prototipo
 *
 *  Uso: createTheme(getMeridianTheme('dark'))
 *  Módulo accent: setModuleAccent(theme, 'contabilidad')
 * ═══════════════════════════════════════════════════════════════
 */

import {
	type Theme,
	type ThemeOptions,
	createTheme,
} from "@mui/material/styles";
import { transitions, zIndexLayout } from "./tokens";

// ─── Module Accents ──────────────────────────────────────────────
export const MODULE_ACCENTS = {
	home: {
		main: "#818CF8",
		rgb: "129,140,248",
		tint: "#0B0B0F",
		name: "Inicio",
	},
	contabilidad: {
		main: "#34D399",
		rgb: "52,211,153",
		tint: "#0B0F0D",
		name: "Contabilidad",
	},
	tesoreria: {
		main: "#2DD4BF",
		rgb: "45,212,191",
		tint: "#0B0E0E",
		name: "Tesorería",
	},
	rrhh: { main: "#FBBF24", rgb: "251,191,36", tint: "#0F0E0B", name: "RRHH" },
	obras: {
		main: "#60A5FA",
		rgb: "96,165,250",
		tint: "#0B0D0F",
		name: "Obras Públicas",
	},
	catastro: {
		main: "#F472B6",
		rgb: "244,114,182",
		tint: "#0F0B0E",
		name: "Catastro",
	},
	config: {
		main: "#A78BFA",
		rgb: "167,139,250",
		tint: "#0D0B0F",
		name: "Configuración",
	},
	chat: {
		main: "#C084FC",
		rgb: "192,132,252",
		tint: "#0E0B0F",
		name: "Mensajería",
	},
} as const;

export type ModuleCode = keyof typeof MODULE_ACCENTS;

// ─── Luminancia WCAG para texto sobre accent ─────────────────────
export function getContrastText(hex: string): "#000" | "#fff" {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	const lum = [r, g, b].map((c) => {
		const normalized = c / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	});
	const L = 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	return L > 0.4 ? "#000" : "#fff";
}

// ─── Paletas por modo ────────────────────────────────────────────

const darkPalette = {
	mode: "dark" as const,

	// Surfaces — Void palette (violet-tinged grays)
	background: {
		default: "#0B0B0F", // --ground
		paper: "#17171E", // --s2
	},

	// Text hierarchy
	text: {
		primary: "#EEEEF2", // --tx
		secondary: "#8B8B9E", // --tx2
		disabled: "#5A5A6F", // --tx3
	},

	// Borders (extendido via customTokens)
	divider: "#232335", // --border

	// Semantic colors — dark mode (colores claros/pastel sobre fondo oscuro)
	success: {
		main: "#34D399",
		light: "rgba(52,211,153,0.12)",
		dark: "#059669",
		contrastText: "#000",
	},
	warning: {
		main: "#FBBF24",
		light: "rgba(251,191,36,0.12)",
		dark: "#B45309",
		contrastText: "#000",
	},
	error: {
		main: "#F87171",
		light: "rgba(248,113,113,0.12)",
		dark: "#DC2626",
		contrastText: "#000",
	},
	info: {
		main: "#60A5FA",
		light: "rgba(96,165,250,0.12)",
		dark: "#2563EB",
		contrastText: "#000",
	},

	// Primary = accent del módulo activo (default: home indigo)
	primary: {
		main: "#818CF8",
		contrastText: "#000",
	},
};

const lightPalette = {
	mode: "light" as const,

	// Surfaces — Alineado con doc 03-visual-language.md
	background: {
		default: "#F5F5F7", // --ground
		paper: "#FFFFFF", // --s2
	},

	// Text hierarchy
	text: {
		primary: "#1A1A1F", // --tx
		secondary: "#6B6B7A", // --tx2
		disabled: "#9B9BAA", // --tx3
	},

	divider: "#E4E4E7", // --border

	// Semantic colors — light mode "deep" (WCAG 4.5:1 sobre fondo claro)
	success: {
		main: "#059669",
		light: "rgba(5,150,105,0.10)",
		dark: "#047857",
		contrastText: "#fff",
	},
	warning: {
		main: "#B45309",
		light: "rgba(180,83,9,0.10)",
		dark: "#92400E",
		contrastText: "#fff",
	},
	error: {
		main: "#DC2626",
		light: "rgba(220,38,38,0.10)",
		dark: "#B91C1C",
		contrastText: "#fff",
	},
	info: {
		main: "#2563EB",
		light: "rgba(37,99,235,0.10)",
		dark: "#1D4ED8",
		contrastText: "#fff",
	},

	primary: {
		main: "#818CF8",
		contrastText: "#000",
	},
};

// ─── Custom Tokens (extendemos MUI) ─────────────────────────────

export interface MeridianTokens {
	surfaces: {
		void: string;
		ground: string;
		s1: string;
		s2: string;
		s3: string;
		s4: string;
		s5: string;
	};
	borders: {
		default: string;
		muted: string;
		strong: string;
	};
	text: {
		tx4: string; // placeholder / más tenue que disabled
	};
	shadows: {
		sm: string;
		md: string;
		lg: string;
	};
	moduleAccent: {
		main: string;
		rgb: string;
		tint: string;
	};
	durations: {
		instant: string;
		fast: string;
		normal: string;
		slow: string;
		cinematic: string;
	};
	easings: {
		out: string;
		in: string;
		inOut: string;
		spring: string;
	};
	zIndex: {
		statusLine: number;
		eyebrow: number;
		floating: number;
		compass: number;
		navPanel: number;
		cmdOverlay: number;
		cmdPalette: number;
		onboarding: number;
	};
}

// ─── Shared motion tokens (mode-agnostic) ────────────────────
const motionTokens = {
	durations: { ...transitions.duration },
	easings: { ...transitions.easing },
	zIndex: { ...zIndexLayout },
};

const darkTokens: MeridianTokens = {
	surfaces: {
		void: "#050507",
		ground: "#0B0B0F",
		s1: "#111116",
		s2: "#17171E",
		s3: "#1E1E28",
		s4: "#252532",
		s5: "#2E2E3D",
	},
	borders: {
		default: "#232335",
		muted: "#1C1C2A",
		strong: "#33334A",
	},
	text: {
		tx4: "#3A3A50",
	},
	shadows: {
		sm: "0 2px 8px rgba(0,0,0,0.4)",
		md: "0 4px 24px rgba(0,0,0,0.5)",
		lg: "0 8px 48px rgba(0,0,0,0.6)",
	},
	moduleAccent: {
		main: MODULE_ACCENTS.home.main,
		rgb: MODULE_ACCENTS.home.rgb,
		tint: MODULE_ACCENTS.home.tint,
	},
	...motionTokens,
};

const lightTokens: MeridianTokens = {
	surfaces: {
		void: "#F5F5F7",
		ground: "#F5F5F7",
		s1: "#FFFFFF",
		s2: "#FFFFFF",
		s3: "#F0F0F3",
		s4: "#FFFFFF",
		s5: "#FFFFFF",
	},
	borders: {
		default: "#E4E4E7",
		muted: "#EBEBF0",
		strong: "#D1D1D6",
	},
	text: {
		tx4: "#BBBBD0",
	},
	shadows: {
		sm: "0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
		md: "0 2px 12px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)",
		lg: "0 4px 32px rgba(0,0,0,0.12), 0 8px 48px rgba(0,0,0,0.08)",
	},
	moduleAccent: {
		main: MODULE_ACCENTS.home.main,
		rgb: MODULE_ACCENTS.home.rgb,
		tint: MODULE_ACCENTS.home.tint,
	},
	...motionTokens,
};

// ─── Tipografía ──────────────────────────────────────────────────

const typography = {
	fontFamily: '"DM Sans", sans-serif',
	fontSize: 13.5, // doc: body base 13.5px

	h1: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 700,
		fontSize: "2rem",
	},
	h2: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 600,
		fontSize: "1.5rem",
	},
	h3: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 600,
		fontSize: "1.25rem",
	},
	h4: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 600,
		fontSize: "1.125rem",
	},
	h5: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 600,
		fontSize: "1rem",
	},
	h6: {
		fontFamily: '"Bricolage Grotesque", sans-serif',
		fontWeight: 600,
		fontSize: "0.875rem",
	},
	subtitle1: {
		fontFamily: '"DM Sans", sans-serif',
		fontWeight: 500,
		fontSize: "0.9375rem",
	},
	subtitle2: {
		fontFamily: '"DM Sans", sans-serif',
		fontWeight: 600,
		fontSize: "0.8125rem",
		letterSpacing: "0.02em",
	},
	body1: {
		fontFamily: '"DM Sans", sans-serif',
		fontSize: "0.875rem", // 14px → 13.5px via fontSize
	},
	body2: {
		fontFamily: '"DM Sans", sans-serif',
		fontSize: "0.8125rem",
	},
	caption: {
		fontFamily: '"DM Sans", sans-serif',
		fontSize: "0.6875rem",
		color: "inherit",
	},
	overline: {
		fontFamily: '"DM Sans", sans-serif',
		fontSize: "0.625rem",
		fontWeight: 600,
		letterSpacing: "0.12em",
		textTransform: "uppercase" as const,
	},

	// Familias numéricas y mono (accesibles via theme.typography)
	number: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontFeatureSettings: "'tnum' 1, 'ss01' 1",
	},
	mono: {
		fontFamily: '"DM Mono", monospace',
	},
};

// ─── Bordes ──────────────────────────────────────────────────────

const shape = {
	borderRadius: 8, // --r (base)
};

// ─── Componentes base ────────────────────────────────────────────

const components: ThemeOptions["components"] = {
	MuiCssBaseline: {
		styleOverrides: {
			// Scrollbar MERIDIAN
			"*::-webkit-scrollbar": {
				width: "6px",
			},
			"*::-webkit-scrollbar-track": {
				background: "transparent",
			},
			"*::-webkit-scrollbar-thumb": {
				background: "var(--palette-divider, rgba(0,0,0,0.2))",
				borderRadius: "3px",
			},
			// Reduced motion
			"@media (prefers-reduced-motion: reduce)": {
				"*, *::before, *::after": {
					animationDuration: "0.01ms !important",
					transitionDuration: "0.01ms !important",
				},
			},
		},
	},
	MuiButton: {
		defaultProps: {
			disableElevation: true,
		},
		styleOverrides: {
			root: {
				textTransform: "none",
				fontWeight: 500,
				fontSize: "0.75rem",
				borderRadius: 8,
				padding: "6px 12px",
			},
		},
	},
	MuiChip: {
		styleOverrides: {
			root: {
				fontWeight: 500,
				fontSize: "0.6875rem",
			},
		},
	},
	MuiTableCell: {
		styleOverrides: {
			head: {
				fontSize: "0.625rem",
				fontWeight: 600,
				letterSpacing: "0.1em",
				textTransform: "uppercase",
			},
			body: {
				fontSize: "0.8125rem",
			},
		},
	},
	MuiTableRow: {
		styleOverrides: {
			root: {
				"&:last-child td": { borderBottom: "none" },
			},
		},
	},
	MuiCard: {
		defaultProps: {
			variant: "outlined",
		},
		styleOverrides: {
			root: {
				borderRadius: 12,
			},
		},
	},
	MuiTooltip: {
		defaultProps: {
			arrow: true,
		},
		styleOverrides: {
			tooltip: {
				fontSize: "0.75rem",
				padding: "6px 10px",
				maxWidth: 240,
			},
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: {
				backgroundImage: "none",
			},
		},
	},
	MuiDrawer: {
		styleOverrides: {
			paper: {
				border: "none",
			},
		},
	},
	MuiDialog: {
		styleOverrides: {
			paper: {
				borderRadius: 16,
			},
		},
	},
	MuiTextField: {
		defaultProps: {
			variant: "outlined",
			size: "small",
		},
		styleOverrides: {
			root: {
				"& .MuiOutlinedInput-root": {
					borderRadius: 8,
				},
			},
		},
	},
	MuiAvatar: {
		styleOverrides: {
			root: {
				fontWeight: 600,
				fontSize: "0.6875rem",
			},
		},
	},
	MuiLinearProgress: {
		styleOverrides: {
			root: {
				borderRadius: 4,
				height: 6,
			},
			bar: {
				borderRadius: 4,
			},
		},
	},
};

// ─── Theme Factory ───────────────────────────────────────────────

export function getMeridianTheme(mode: "dark" | "light"): ThemeOptions {
	const palette = mode === "dark" ? darkPalette : lightPalette;
	const tokens = mode === "dark" ? darkTokens : lightTokens;

	return {
		palette,
		typography,
		shape,
		components,
		// Tokens custom MERIDIAN — accesibles via theme.meridian.*
		meridian: tokens,
	};
}

/**
 * Crea el theme MUI con los tokens MERIDIAN
 * @example const theme = createMeridianTheme('dark');
 */
export function createMeridianTheme(mode: "dark" | "light"): Theme {
	return createTheme(getMeridianTheme(mode));
}

/**
 * Retorna tokens actualizados para un módulo específico.
 * Útil para actualizar primary + moduleAccent al cambiar de módulo.
 *
 * @example
 * const updated = getModuleThemeOverrides('contabilidad', 'dark');
 * setTheme(createTheme(deepmerge(baseTheme, updated)));
 */
export function getModuleThemeOverrides(
	moduleCode: ModuleCode,
): Partial<ThemeOptions> {
	const mod = MODULE_ACCENTS[moduleCode];
	const contrastText = getContrastText(mod.main);

	return {
		palette: {
			primary: {
				main: mod.main,
				contrastText,
			},
		},
		meridian: {
			moduleAccent: {
				main: mod.main,
				rgb: mod.rgb,
				tint: mod.tint,
			},
		},
	};
}

// ─── Type Augmentation ───────────────────────────────────────────
// Para que theme.meridian.* tenga tipos en TypeScript

declare module "@mui/material/styles" {
	interface Theme {
		meridian: MeridianTokens;
	}
	interface ThemeOptions {
		meridian?: Partial<MeridianTokens>;
	}

	// Extender Typography para las variantes custom
	interface TypographyVariants {
		number: React.CSSProperties;
		mono: React.CSSProperties;
	}
	interface TypographyVariantsOptions {
		number?: React.CSSProperties;
		mono?: React.CSSProperties;
	}
}

declare module "@mui/material/Typography" {
	interface TypographyPropsVariantOverrides {
		number: true;
		mono: true;
	}
}
