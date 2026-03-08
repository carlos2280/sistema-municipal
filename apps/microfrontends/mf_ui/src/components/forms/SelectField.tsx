/**
 * SelectField — Componente de Selección
 *
 * Select estándar del sistema con:
 * - Opciones con icono y descripción opcionales
 * - Estado de error inline
 * - Soporte para opción vacía ("Seleccionar…")
 * - Estilos consistentes con FormField
 */

import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  alpha,
  styled,
  type SelectProps,
} from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends Omit<SelectProps, "error" | "variant"> {
  /** Opciones del select */
  options: SelectOption[];
  /** Label del campo */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Placeholder cuando no hay selección */
  placeholder?: string;
  /** Si ocupa todo el ancho */
  fullWidth?: boolean;
  /** Si es opcional */
  optional?: boolean;
}

// ============================================================================
// STYLED
// ============================================================================

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius + 2,
    transition: "box-shadow 0.2s ease",
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
    "&.Mui-error.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.12)}`,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function SelectField({
  options,
  label,
  error,
  helperText,
  placeholder,
  fullWidth = true,
  optional = false,
  size = "small",
  required,
  ...props
}: SelectFieldProps) {
  const hasError = Boolean(error);
  const labelId = `select-${label?.toLowerCase().replace(/\s+/g, "-")}-label`;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <StyledFormControl
        fullWidth={fullWidth}
        size={size}
        error={hasError}
        required={required}
      >
        {label && (
          <InputLabel id={labelId}>
            {label}
            {optional && (
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  color: "text.disabled",
                  ml: 0.5,
                  fontStyle: "italic",
                }}
              >
                (opcional)
              </Typography>
            )}
          </InputLabel>
        )}

        <Select
          labelId={labelId}
          label={label}
          displayEmpty={Boolean(placeholder)}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <Typography color="text.disabled">{placeholder}</Typography>
            </MenuItem>
          )}

          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.icon || opt.description ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: opt.description ? "flex-start" : "center",
                    gap: 1.5,
                    width: "100%",
                  }}
                >
                  {opt.icon && (
                    <Box
                      sx={{
                        flexShrink: 0,
                        color: "text.secondary",
                        mt: opt.description ? 0.25 : 0,
                      }}
                    >
                      {opt.icon}
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {opt.label}
                    </Typography>
                    {opt.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                      >
                        {opt.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                opt.label
              )}
            </MenuItem>
          ))}
        </Select>
      </StyledFormControl>

      {(error || helperText) && (
        <FormHelperText
          error={hasError}
          sx={{ mx: "14px", mt: 0.5, fontSize: "0.75rem" }}
        >
          {error ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}

export default SelectField;
