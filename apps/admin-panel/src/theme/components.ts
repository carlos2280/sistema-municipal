import { alpha } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { durations, easings, radii, textDark, textLight } from './tokens'

export function createComponentsConfig(mode: 'dark' | 'light'): ThemeOptions['components'] {
  const text = mode === 'dark' ? textDark : textLight

  // Scrollbar styles — uses tokens, zero hardcoded colors
  const scrollbarStyles = {
    '*::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      borderRadius: '3px',
      background: text.tx4,
      '&:hover': {
        background: text.disabled,
      },
    },
    // Respect prefers-reduced-motion
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
      },
    },
  }

  return {
    MuiCssBaseline: {
      styleOverrides: {
        ...scrollbarStyles,
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8125rem',
          borderRadius: radii.DEFAULT,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.6875rem',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: '0.625rem',
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': {
            border: 0,
          },
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'transparent',
        },
      },
    },

    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: radii.md,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radii.lg,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radii.DEFAULT,
          },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.6875rem',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          height: 6,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radii.DEFAULT,
          border: '1px solid',
        },
        standardSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          borderColor: alpha(theme.palette.success.main, 0.3),
          color: theme.palette.success.main,
        }),
        standardWarning: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          borderColor: alpha(theme.palette.warning.main, 0.3),
          color: theme.palette.warning.main,
        }),
        standardError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          borderColor: alpha(theme.palette.error.main, 0.3),
          color: theme.palette.error.main,
        }),
        standardInfo: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          borderColor: alpha(theme.palette.info.main, 0.3),
          color: theme.palette.info.main,
        }),
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.sm,
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: '0.8125rem',
          padding: '4px 12px',
          transition: [
            `color ${durations.fast} ${easings.out}`,
            `background-color ${durations.fast} ${easings.out}`,
            `border-color ${durations.fast} ${easings.out}`,
          ].join(', '),
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderColor: alpha(theme.palette.primary.main, 0.4),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
          },
        }),
      },
    },

    MuiSnackbarContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.meridian.surfaces.s4,
          border: `1px solid ${theme.meridian.borders.default}`,
          borderRadius: radii.DEFAULT,
          color: theme.palette.text.primary,
          boxShadow: theme.meridian.shadows.md,
        }),
      },
    },
  }
}
