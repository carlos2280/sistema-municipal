/**
 * FormField — Componente de Formulario
 *
 * Wrapper estándar sobre MUI TextField con:
 * - Label flotante con asterisco automático para campos requeridos
 * - Mensaje de error inline
 * - Helper text opcional
 * - Icono de inicio/fin
 * - Estilos consistentes con el sistema de diseño
 */

import {
  Box,
  FormHelperText,
  InputAdornment,
  TextField,
  Typography,
  alpha,
  styled,
  type TextFieldProps,
} from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldProps
  extends Omit<TextFieldProps, "variant" | "error"> {
  /** Mensaje de error — activa estado error si se pasa */
  error?: string;
  /** Helper text debajo del campo */
  helperText?: string;
  /** Icono al inicio del input */
  startIcon?: ReactNode;
  /** Icono al final del input */
  endIcon?: ReactNode;
  /** Si el campo es opcional (muestra etiqueta "(opcional)") */
  optional?: boolean;
}

// ============================================================================
// STYLED
// ============================================================================

const StyledTextField = styled(TextField)(({ theme }) => ({
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
  "& .MuiInputAdornment-root": {
    color: theme.palette.text.secondary,
  },
}));

const OptionalLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.disabled,
  marginLeft: theme.spacing(0.5),
  fontStyle: "italic",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function FormField({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  optional = false,
  required,
  size = "small",
  fullWidth = true,
  ...props
}: FormFieldProps) {
  const hasError = Boolean(error);

  const labelNode = label ? (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
      {label}
      {optional && <OptionalLabel component="span">(opcional)</OptionalLabel>}
    </Box>
  ) : undefined;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <StyledTextField
        label={labelNode}
        error={hasError}
        required={required}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : undefined,
          ...props.InputProps,
        }}
        {...props}
      />
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

export default FormField;
