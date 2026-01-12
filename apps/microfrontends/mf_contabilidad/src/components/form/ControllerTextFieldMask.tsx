import { InputAdornment, TextField } from '@mui/material';

import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { formatCodigo } from '../../utils/planDeCuentasUtils';
// import RenderError from './RenderError';

export type ControllerTextFieldMaskProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  size?: 'medium' | 'small';
  margin?: 'normal' | 'dense' | 'none' | undefined;
};

const ControllerTextFieldMask = <T extends FieldValues>({
  name,
  label,
  size = 'medium', // Opción por defecto mejorada
  margin = 'normal',
}: ControllerTextFieldMaskProps<T>) => {
  const { control } = useFormContext<T>();

  const valorPadre = useWatch<T>({
    control,
    name: 'valorPadre' as Path<T>,
  }) as string | undefined;

  const tipoCuentaId = useWatch<T>({
    control,
    name: 'tipoCuentaId' as Path<T>,
  }) as number | undefined;

  const safeTipoCuentaId = tipoCuentaId ?? 0;
  const digitCount =
    safeTipoCuentaId === 3 || safeTipoCuentaId === 4
      ? 2
      : [5, 6, 7].includes(safeTipoCuentaId)
        ? 3
        : 0;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const safeValue = typeof field.value === 'string' ? field.value : '';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const onlyNums = e.target.value
            .replace(/\D/g, '')
            .slice(0, digitCount);
          field.onChange(onlyNums);
        };

        return (
          <>
            <TextField
              {...field}
              value={safeValue}
              onChange={handleChange}
              label={label}
              slotProps={{
                input: {
                  inputProps: {
                    inputMode: 'numeric',
                    pattern: '\\d*',
                    maxLength: digitCount,
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      {valorPadre &&
                        `${formatCodigo(valorPadre ?? '', tipoCuentaId ?? 0)}-`}
                    </InputAdornment>
                  ),
                },
              }}
              size={size}
              fullWidth
              variant="outlined"
              margin={margin}
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

export default ControllerTextFieldMask;
