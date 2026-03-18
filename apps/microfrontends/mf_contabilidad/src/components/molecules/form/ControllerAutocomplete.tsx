import { Autocomplete, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type ControllerAutocompleteProps<T> = {
  name: string;
  label: string;
  data: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getValue?: (option: T | null) => unknown;
};

const ControllerAutocomplete = <T,>({
  name,
  label,
  data,
  getOptionLabel,
  isOptionEqualToValue,
  getValue,
}: ControllerAutocompleteProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { ref, onChange, ...field },
        fieldState: { invalid, error },
      }) => {
        return (
          <Autocomplete
            id={`autocomple_${name}`}
            getOptionLabel={getOptionLabel}
            onChange={(_, newValue) => {
              onChange(getValue ? getValue(newValue) : newValue);
            }}
            options={data}
            value={field.value ?? null}
            isOptionEqualToValue={isOptionEqualToValue}
            renderInput={(params) => (
              <TextField
                {...params}
                {...field}
                inputRef={ref}
                variant="outlined"
                label={label}
                margin="normal"
                error={invalid}
                helperText={invalid && error?.message}
              />
            )}
          />
        );
      }}
    />
  );
};

export default ControllerAutocomplete;
