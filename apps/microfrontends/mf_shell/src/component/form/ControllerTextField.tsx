import { TextField } from '@mui/material';
import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
} from 'react-hook-form';

export type ControllerTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
  size?: 'medium' | 'small';
  width?: string;
  variant?: 'outlined' | 'standard' | 'filled';
  data?: T[]; // Propiedad data genérica
  margin?: 'normal' | 'dense' | 'none' | undefined;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};
const ControllerTextField = <T extends FieldValues>({
  name,
  label,
  type = 'text',
  size = 'medium',
  width = '100%',
  variant = 'outlined',
  margin = 'normal',
  disabled = false,
  onKeyDown = undefined,
}: ControllerTextFieldProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { invalid, error } }) => {
        return (
          <TextField
            {...field}
            fullWidth
            type={type}
            margin={margin}
            label={label}
            variant={variant}
            size={size}
            value={field.value ?? ''}
            error={invalid}
            helperText={invalid && error?.message}
            autoComplete="off"
            sx={{
              width: width,
            }}
            disabled={disabled}
            onKeyDown={onKeyDown}
          />
        );
      }}
    />
  );
};

export default ControllerTextField;
