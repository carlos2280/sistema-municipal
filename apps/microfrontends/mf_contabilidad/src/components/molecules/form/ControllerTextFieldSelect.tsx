import { MenuItem, TextField } from '@mui/material';
import {
  Controller,
  // type FieldValues,
  // type Path,
  useFormContext,
} from 'react-hook-form';

type ControllerSelectProps<T> = {
  name: string;
  label: string;
  data: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
};

const ControllerTextFieldSelect = <T,>({
  name,
  label,
  data,
  getOptionLabel,
  getOptionValue,
}: ControllerSelectProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { invalid, error } }) => (
        <TextField
          id={`form-${name}`}
          select
          fullWidth
          label={label}
          {...field}
          value={field.value ?? ''}
          error={invalid}
          helperText={invalid && error?.message}
          margin="normal"
        >
          {data.map((option) => (
            <MenuItem
              key={getOptionValue(option)}
              value={getOptionValue(option)}
            >
              {getOptionLabel(option)}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default ControllerTextFieldSelect;
