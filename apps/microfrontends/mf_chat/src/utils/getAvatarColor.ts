import type { Theme } from '@mui/material/styles'

/**
 * Genera un color determinístico para avatar basado en el nombre,
 * usando colores del theme en lugar de hex hardcodeados.
 */
export function getAvatarColor(name: string, theme: Theme): string {
  const palette: string[] = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ]

  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palette[hash % palette.length]
}
