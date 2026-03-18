import { MenuItem, TextField } from '@mui/material';

const currencies = [
  {
    value: 'Contabilidad',
    label: 'Contabilidad',
  },
  {
    value: 'Remuneraciones',
    label: 'Remuneraciones',
  },
];
const SelectMui = () => {
  return (
    <TextField
      id="filled-select-currency"
      select
      label="Sistema"
      defaultValue="Remuneraciones"
      // helperText="Please select your currency"
      // variant="filled"
      size="small"
      sx={{
        minWidth: 200,
      }}
    >
      {currencies.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectMui;
