import { createTheme } from "@mui/material/styles";

// Tema elegante y minimalista para sistema municipal
const lightTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#7928ca", // Azul institucional profundo
			light: "#af52bf",
			dark: "#6d1b7b",
			contrastText: "#ffffff",
		},
		secondary: {
			main: "#0891b2", // Cyan institucional
			light: "#06b6d4",
			dark: "#0e7490",
			contrastText: "#ffffff",
		},
		background: {
			default: "#f8fafc", // Gris muy claro, casi blanco
			paper: "#ffffff",
		},
		text: {
			primary: "#0f172a", // Gris muy oscuro para mejor contraste
			secondary: "#475569", // Gris medio
		},
		divider: "#e2e8f0",
		success: {
			main: "#059669",
			light: "#10b981",
			dark: "#047857",
		},
		warning: {
			main: "#d97706",
			light: "#f59e0b",
			dark: "#b45309",
		},
		error: {
			main: "#dc2626",
			light: "#ef4444",
			dark: "#b91c1c",
		},
		info: {
			main: "#0284c7",
			light: "#0ea5e9",
			dark: "#0369a1",
		},
	},
	shape: {
		borderRadius: 8,
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: "2.5rem",
			fontWeight: 700,
			lineHeight: 1.2,
			letterSpacing: "-0.02em",
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 600,
			lineHeight: 1.3,
			letterSpacing: "-0.01em",
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 600,
			lineHeight: 1.4,
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 600,
			lineHeight: 1.4,
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 600,
			lineHeight: 1.5,
		},
		h6: {
			fontSize: "1.125rem",
			fontWeight: 600,
			lineHeight: 1.5,
		},
		subtitle1: {
			fontSize: "1rem",
			fontWeight: 500,
			lineHeight: 1.75,
		},
		subtitle2: {
			fontSize: "0.875rem",
			fontWeight: 500,
			lineHeight: 1.57,
		},
		body1: {
			fontSize: "1rem",
			lineHeight: 1.5,
		},
		body2: {
			fontSize: "0.875rem",
			lineHeight: 1.43,
		},
		button: {
			textTransform: "none",
			fontWeight: 500,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					padding: "10px 20px",
					fontSize: "0.9375rem",
					boxShadow: "none",
					"&:hover": {
						boxShadow:
							"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
					},
				},
				contained: {
					"&:hover": {
						boxShadow:
							"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow:
						"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
					border: "1px solid #e2e8f0",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
				elevation1: {
					boxShadow:
						"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				},
				elevation2: {
					boxShadow:
						"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 8,
					},
				},
			},
		},
	},
});

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#7928ca", // Azul institucional profundo
			light: "#af52bf",
			dark: "#6d1b7b",
			contrastText: "#ffffff",
		},
		secondary: {
			main: "#06b6d4",
			light: "#22d3ee",
			dark: "#0891b2",
			contrastText: "#ffffff",
		},
		background: {
			default: "#0f172a",
			paper: "#1e293b",
		},
		text: {
			primary: "#f1f5f9",
			secondary: "#94a3b8",
		},
		divider: "#334155",
		action: {
			hover: "#334155",
			selected: "#475569",
			disabled: "#64748b",
		},
		success: {
			main: "#10b981",
			light: "#34d399",
			dark: "#059669",
		},
		warning: {
			main: "#f59e0b",
			light: "#fbbf24",
			dark: "#d97706",
		},
		error: {
			main: "#ef4444",
			light: "#f87171",
			dark: "#dc2626",
		},
		info: {
			main: "#0ea5e9",
			light: "#38bdf8",
			dark: "#0284c7",
		},
	},
	shape: {
		borderRadius: 8,
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: "2.5rem",
			fontWeight: 700,
			lineHeight: 1.2,
			letterSpacing: "-0.02em",
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 600,
			lineHeight: 1.3,
			letterSpacing: "-0.01em",
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 600,
			lineHeight: 1.4,
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 600,
			lineHeight: 1.4,
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 600,
			lineHeight: 1.5,
		},
		h6: {
			fontSize: "1.125rem",
			fontWeight: 600,
			lineHeight: 1.5,
		},
		subtitle1: {
			fontSize: "1rem",
			fontWeight: 500,
			lineHeight: 1.75,
		},
		subtitle2: {
			fontSize: "0.875rem",
			fontWeight: 500,
			lineHeight: 1.57,
		},
		body1: {
			fontSize: "1rem",
			lineHeight: 1.5,
		},
		body2: {
			fontSize: "0.875rem",
			lineHeight: 1.43,
		},
		button: {
			textTransform: "none",
			fontWeight: 500,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					padding: "10px 20px",
					fontSize: "0.9375rem",
					boxShadow: "none",
					"&:hover": {
						boxShadow:
							"0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
					},
				},
				contained: {
					"&:hover": {
						boxShadow:
							"0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow:
						"0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
					border: "1px solid #334155",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
				elevation1: {
					boxShadow:
						"0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
				},
				elevation2: {
					boxShadow:
						"0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 8,
					},
				},
			},
		},
	},
});

export { lightTheme, darkTheme };
