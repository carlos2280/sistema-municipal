import { Autocomplete, TextField } from "@mui/material";
import type { CentrosCostoItem } from "../../../types/presupuesto.types";

interface CentroCostoAutocompleteProps {
  value: CentrosCostoItem | null;
  options: CentrosCostoItem[];
  onChange: (cc: CentrosCostoItem | null) => void;
  autoFocus?: boolean;
  size?: "small" | "medium";
}

/**
 * Atom: selector de centro de costo.
 * Permite dejar en null (sin centro de costo).
 */
const CentroCostoAutocomplete = ({
  value,
  options,
  onChange,
  autoFocus = false,
  size = "small",
}: CentroCostoAutocompleteProps) => (
  <Autocomplete<CentrosCostoItem>
    value={value}
    options={options}
    autoHighlight
    size={size}
    getOptionLabel={(opt) => `${opt.codigo} - ${opt.nombre}`}
    isOptionEqualToValue={(opt, val) => opt.id === val.id}
    onChange={(_e, newValue) => onChange(newValue)}
    noOptionsText="Sin resultados"
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="C. Costo..."
        autoFocus={autoFocus}
        variant="outlined"
        size={size}
        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" } }}
      />
    )}
  />
);

export default CentroCostoAutocomplete;
