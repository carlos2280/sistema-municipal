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
  type?: string;

  value?: string;
  size?: 'medium' | 'small';
  width?: string;
  variant?: 'outlined' | 'standard' | 'filled';
  data?: T[]; // Propiedad data genérica
  margin?: 'normal' | 'dense' | 'none' | undefined;
};
const ControllerTextField = <T extends FieldValues>({
  name,
  label,
  type = 'text',
  size = 'medium',
  width = '100%',
  variant = 'outlined',
  margin = 'normal',
}: ControllerTextFieldProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      // defaultValue=""
      render={({ field, fieldState: { error } }) => {
        return (
          <>
            <TextField
              {...field}
              fullWidth
              type={type}
              margin={margin}
              label={label}
              variant={variant}
              size={size}
              value={field.value ?? ''}
              autoComplete="off"
              sx={{
                width: width,
              }}
              error={!!error}
              helperText={!!error && error?.message}
            />
            {/* <RenderError error={error} errorStyle="minimal" /> */}
          </>
        );
      }}
    />
  );
};

export default ControllerTextField;
