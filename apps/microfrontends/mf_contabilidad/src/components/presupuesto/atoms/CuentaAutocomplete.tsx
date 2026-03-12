import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import type { CuentaPresupuestaria } from "../../../types/presupuesto.types";

interface CuentaAutocompleteProps {
  value: CuentaPresupuestaria | null;
  options: CuentaPresupuestaria[];
  loading?: boolean;
  tipo: "ingreso" | "gasto";
  /** Excluir cuentaIds ya presentes en el grid */
  excludeIds?: number[];
  onChange: (cuenta: CuentaPresupuestaria | null) => void;
  onInputChange?: (value: string) => void;
  autoFocus?: boolean;
  size?: "small" | "medium";
}

/**
 * Atom: selector de cuenta presupuestaria con búsqueda por código o nombre.
 * Filtra automáticamente 115xx (ingreso) o 215xx (gasto) según el tab activo.
 */
const CuentaAutocomplete = ({
  value,
  options,
  loading = false,
  excludeIds = [],
  onChange,
  onInputChange,
  autoFocus = false,
  size = "small",
}: CuentaAutocompleteProps) => {
  const filtered = options.filter((c) => !excludeIds.includes(c.id));

  return (
    <Autocomplete<CuentaPresupuestaria>
      value={value}
      options={filtered}
      loading={loading}
      autoHighlight
      size={size}
      getOptionLabel={(opt) => `${opt.codigo} - ${opt.nombre}`}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      onChange={(_e, newValue) => onChange(newValue)}
      onInputChange={(_e, newInputValue) => onInputChange?.(newInputValue)}
      noOptionsText="Sin resultados"
      loadingText="Buscando..."
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Buscar cuenta..."
          autoFocus={autoFocus}
          variant="outlined"
          size={size}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={14} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
        const isChild = option.parentId !== null;
        return (
          <Box component="li" key={key} {...rest} sx={{ pl: isChild ? 4 : 1.5 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "primary.main",
                  display: "block",
                }}
              >
                {option.codigo}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {option.nombre}
              </Typography>
            </Box>
          </Box>
        );
      }}
    />
  );
};

export default CuentaAutocomplete;
