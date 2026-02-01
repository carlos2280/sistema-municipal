/**
 * Search Input - Molécula
 *
 * Campo de búsqueda elegante con animaciones y estados
 */

import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  alpha,
  styled,
  type TextFieldProps,
} from "@mui/material";
import { Search, X, Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface SearchInputProps
  extends Omit<TextFieldProps, "onChange" | "value" | "variant"> {
  /** Valor actual */
  value?: string;
  /** Handler de cambio */
  onChange?: (value: string) => void;
  /** Handler de búsqueda (al presionar Enter o click en buscar) */
  onSearch?: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Si está cargando resultados */
  loading?: boolean;
  /** Debounce delay en ms */
  debounceMs?: number;
  /** Si debe ocupar todo el ancho */
  fullWidth?: boolean;
  /** Tamaño */
  size?: "small" | "medium";
  /** Variante visual */
  variant?: "outlined" | "filled";
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "searchVariant",
})<{ searchVariant: "outlined" | "filled" }>(({ theme, searchVariant }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius + 4,
    transition: "all 0.2s ease-in-out",
    ...(searchVariant === "filled" && {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[900],
      "& fieldset": {
        border: "none",
      },
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      },
      "&.Mui-focused": {
        backgroundColor: "transparent",
        "& fieldset": {
          border: `2px solid ${theme.palette.primary.main}`,
        },
      },
    }),
    "&:hover": {
      "& fieldset": {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
  "& .MuiInputAdornment-root": {
    color: theme.palette.text.secondary,
  },
}));

const SpinnerIcon = styled(Loader2)(({ theme }) => ({
  animation: "spin 1s linear infinite",
  color: theme.palette.primary.main,
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchInput({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  loading = false,
  debounceMs = 300,
  fullWidth = true,
  size = "small",
  variant = "outlined",
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sincronizar valor externo
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      // Debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange?.(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChange?.("");
    onSearch?.("");
  }, [onChange, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearch?.(internalValue);
      }
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [internalValue, onSearch, handleClear]
  );

  const showClearButton = internalValue.length > 0 && !loading;

  return (
    <StyledTextField
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size={size}
      searchVariant={variant}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={18} />
          </InputAdornment>
        ),
        endAdornment: (loading || showClearButton) && (
          <InputAdornment position="end">
            {loading ? (
              <SpinnerIcon size={18} />
            ) : (
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  p: 0.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}

export default SearchInput;
