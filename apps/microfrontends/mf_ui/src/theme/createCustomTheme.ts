/**
 * Custom Theme Factory - Sistema Municipal CrisCar
 *
 * Genera temas MUI personalizados basados en los tokens de diseño
 * y preferencias del usuario
 */

import { createTheme, type Theme, type ThemeOptions, alpha } from "@mui/material/styles";
import {
  spacing,
  borderRadius,
  shadows,
  fontFamily,
  transitions,
  generateColorVariants,
} from "./tokens";

export interface CustomThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  mode: "light" | "dark";
  borderRadius?: "sharp" | "default" | "rounded" | "pill";
  fontScale?: "compact" | "default" | "comfortable";
}

// Mapeo de estilos de border radius
const borderRadiusMap = {
  sharp: 4,
  default: 8,
  rounded: 12,
  pill: 24,
};

// Mapeo de escala de fuentes
const fontScaleMap = {
  compact: 0.875,
  default: 1,
  comfortable: 1.125,
};

/**
 * Crea un tema MUI completamente personalizado
 */
export function createCustomTheme(config: CustomThemeConfig): Theme {
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    mode,
    borderRadius: radiusStyle = "default",
    fontScale = "default",
  } = config;

  const primary = generateColorVariants(primaryColor);
  const secondary = generateColorVariants(secondaryColor);
  const accent = accentColor ? generateColorVariants(accentColor) : undefined;

  const radius = borderRadiusMap[radiusStyle];
  const scale = fontScaleMap[fontScale];

  const isLight = mode === "light";

  // Paleta base según el modo
  const palette = {
    mode,
    primary,
    secondary,
    ...(accent && { accent }),
    background: isLight
      ? {
          default: "#f8fafc",
          paper: "#ffffff",
        }
      : {
          default: "#0f172a",
          paper: "#1e293b",
        },
    text: isLight
      ? {
          primary: "#0f172a",
          secondary: "#475569",
          disabled: "#94a3b8",
        }
      : {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          disabled: "#64748b",
        },
    divider: isLight ? "#e2e8f0" : "#334155",
    action: isLight
      ? {
          active: alpha(primaryColor, 0.54),
          hover: alpha(primaryColor, 0.04),
          selected: alpha(primaryColor, 0.08),
          disabled: alpha("#0f172a", 0.26),
          disabledBackground: alpha("#0f172a", 0.12),
        }
      : {
          active: alpha(primaryColor, 0.54),
          hover: alpha(primaryColor, 0.08),
          selected: alpha(primaryColor, 0.16),
          disabled: alpha("#f1f5f9", 0.26),
          disabledBackground: alpha("#f1f5f9", 0.12),
        },
    success: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
      contrastText: "#ffffff",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0284c7",
      light: "#0ea5e9",
      dark: "#0369a1",
      contrastText: "#ffffff",
    },
  };

  const themeOptions: ThemeOptions = {
    palette,
    shape: {
      borderRadius: radius,
    },
    typography: {
      fontFamily: fontFamily.sans,
      fontSize: 14 * scale,
      h1: {
        fontSize: `${2.5 * scale}rem`,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: `${2 * scale}rem`,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: `${1.75 * scale}rem`,
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: `${1.5 * scale}rem`,
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: `${1.25 * scale}rem`,
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: `${1.125 * scale}rem`,
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: `${1 * scale}rem`,
        fontWeight: 500,
        lineHeight: 1.75,
      },
      subtitle2: {
        fontSize: `${0.875 * scale}rem`,
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: `${1 * scale}rem`,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: `${0.875 * scale}rem`,
        lineHeight: 1.43,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
        letterSpacing: "0.01em",
      },
      caption: {
        fontSize: `${0.75 * scale}rem`,
        lineHeight: 1.5,
      },
      overline: {
        fontSize: `${0.75 * scale}rem`,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
    },
    shadows: [
      "none",
      shadows.xs,
      shadows.sm,
      shadows.DEFAULT,
      shadows.md,
      shadows.lg,
      shadows.lg,
      shadows.xl,
      shadows.xl,
      shadows["2xl"],
      shadows["2xl"],
      ...Array(14).fill(shadows["2xl"]),
    ] as Theme["shadows"],
    transitions: {
      duration: {
        shortest: parseInt(transitions.duration.fast),
        shorter: parseInt(transitions.duration.fast),
        short: parseInt(transitions.duration.normal),
        standard: parseInt(transitions.duration.normal),
        complex: parseInt(transitions.duration.slow),
        enteringScreen: parseInt(transitions.duration.normal),
        leavingScreen: parseInt(transitions.duration.fast),
      },
      easing: {
        easeInOut: transitions.easing.easeInOut,
        easeOut: transitions.easing.easeOut,
        easeIn: transitions.easing.easeIn,
        sharp: transitions.easing.ease,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          html: {
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            scrollBehavior: "smooth",
          },
          body: {
            fontFamily: fontFamily.sans,
          },
          // Scrollbar elegante
          "::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "::-webkit-scrollbar-track": {
            background: isLight ? "#f1f5f9" : "#1e293b",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar-thumb": {
            background: isLight ? "#cbd5e1" : "#475569",
            borderRadius: "4px",
            "&:hover": {
              background: isLight ? "#94a3b8" : "#64748b",
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
            borderRadius: radius,
            padding: `${spacing[2.5]} ${spacing[5]}`,
            fontSize: `${0.9375 * scale}rem`,
            fontWeight: 500,
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeInOut}`,
            "&:hover": {
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          contained: {
            boxShadow: shadows.sm,
            "&:hover": {
              boxShadow: shadows.DEFAULT,
            },
          },
          containedPrimary: {
            "&:hover": {
              boxShadow: shadows.primary,
            },
          },
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
              backgroundColor: alpha(primaryColor, 0.04),
            },
          },
          text: {
            "&:hover": {
              backgroundColor: alpha(primaryColor, 0.04),
            },
          },
          sizeSmall: {
            padding: `${spacing[1.5]} ${spacing[3]}`,
            fontSize: `${0.8125 * scale}rem`,
          },
          sizeLarge: {
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: `${1 * scale}rem`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius + 4,
            boxShadow: shadows.sm,
            border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeInOut}`,
            "&:hover": {
              boxShadow: shadows.DEFAULT,
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: spacing[6],
            "&:last-child": {
              paddingBottom: spacing[6],
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          rounded: {
            borderRadius: radius,
          },
          elevation1: {
            boxShadow: shadows.sm,
          },
          elevation2: {
            boxShadow: shadows.DEFAULT,
          },
          elevation3: {
            boxShadow: shadows.lg,
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
              borderRadius: radius,
              transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha(primaryColor, 0.5),
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius,
          },
          notchedOutline: {
            borderColor: isLight ? "#e2e8f0" : "#334155",
            transition: `border-color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius - 2,
            fontWeight: 500,
            transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          },
          filled: {
            "&:hover": {
              boxShadow: shadows.xs,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isLight ? "#0f172a" : "#f1f5f9",
            color: isLight ? "#f1f5f9" : "#0f172a",
            fontSize: `${0.75 * scale}rem`,
            fontWeight: 500,
            padding: `${spacing[1.5]} ${spacing[3]}`,
            borderRadius: radius - 2,
            boxShadow: shadows.lg,
          },
          arrow: {
            color: isLight ? "#0f172a" : "#f1f5f9",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius + 4,
            boxShadow: shadows["2xl"],
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: `${1.25 * scale}rem`,
            fontWeight: 600,
            padding: spacing[6],
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: spacing[6],
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: spacing[4],
            gap: spacing[2],
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: "none",
            boxShadow: shadows.xl,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: shadows.sm,
            backgroundImage: "none",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius,
            margin: `${spacing[0.5]} ${spacing[2]}`,
            padding: `${spacing[2]} ${spacing[3]}`,
            transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
            "&.Mui-selected": {
              backgroundColor: alpha(primaryColor, isLight ? 0.08 : 0.16),
              "&:hover": {
                backgroundColor: alpha(primaryColor, isLight ? 0.12 : 0.24),
              },
            },
            "&:hover": {
              backgroundColor: alpha(primaryColor, isLight ? 0.04 : 0.08),
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
            color: "inherit",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: `${0.9375 * scale}rem`,
            minHeight: 48,
            transition: `color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radius,
          },
          standardSuccess: {
            backgroundColor: alpha("#059669", isLight ? 0.08 : 0.16),
          },
          standardError: {
            backgroundColor: alpha("#dc2626", isLight ? 0.08 : 0.16),
          },
          standardWarning: {
            backgroundColor: alpha("#d97706", isLight ? 0.08 : 0.16),
          },
          standardInfo: {
            backgroundColor: alpha("#0284c7", isLight ? 0.08 : 0.16),
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
            fontSize: "0.65rem",
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: radius,
            height: 6,
          },
          bar: {
            borderRadius: radius,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: primaryColor,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: radius,
          },
          rounded: {
            borderRadius: radius,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isLight ? "#f8fafc" : "#1e293b",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
            "&:hover": {
              backgroundColor: alpha(primaryColor, isLight ? 0.02 : 0.04),
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}

export default createCustomTheme;
