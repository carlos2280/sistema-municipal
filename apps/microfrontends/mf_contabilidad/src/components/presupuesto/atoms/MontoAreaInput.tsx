import { Box, Input, Tooltip } from '@mui/material';
import {
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface MontoAreaInputHandle {
  startEdit: () => void;
}

interface MontoAreaInputProps {
  /** Monto en pesos */
  value: number;
  /** Confirmar edición (valor en pesos) */
  onConfirm: (valuePesos: number) => void;
  /** Navegación por Tab */
  onTab?: (shiftKey: boolean) => void;
  /** Navegación por Enter (bajar a siguiente fila, misma columna) */
  onEnter?: () => void;
  /** Token de color del subprograma para borde en edición */
  areaColor: string;
  readOnly?: boolean;
}

const NUM_FONT = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontFeatureSettings: "'tnum' 1, 'ss01' 1",
} as const;

/** Convierte pesos a M$ (miles) para display */
const formatMiles = (pesos: number): string => {
  const miles = Math.round(pesos / 1000);
  return miles.toLocaleString('es-CL');
};

/** Convierte M$ a pesos para almacenamiento */
const milesToPesos = (miles: number): number => miles * 1000;

/** Parsea string con puntos a número entero */
const parseMiles = (raw: string): number => {
  const clean = raw.replace(/\./g, '').replace(/[^\d]/g, '');
  return Number.parseInt(clean, 10) || 0;
};

const MontoAreaInput = forwardRef<MontoAreaInputHandle, MontoAreaInputProps>(
  ({ value, onConfirm, onTab, onEnter, areaColor, readOnly = false }, ref) => {
    const [editing, setEditing] = useState(false);
    const [rawValue, setRawValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const miles = Math.round(value / 1000);

    const startEdit = useCallback(() => {
      if (readOnly) return;
      setRawValue(miles === 0 ? '' : formatMiles(value));
      setEditing(true);
    }, [readOnly, miles, value]);

    useImperativeHandle(ref, () => ({ startEdit }));

    useEffect(() => {
      if (editing) inputRef.current?.select();
    }, [editing]);

    const confirm = useCallback(() => {
      const parsed = parseMiles(rawValue);
      setEditing(false);
      onConfirm(milesToPesos(parsed));
    }, [rawValue, onConfirm]);

    const cancel = useCallback(() => {
      setEditing(false);
      setRawValue('');
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const clean = e.target.value.replace(/[^\d]/g, '');
      if (clean === '') {
        setRawValue('');
        return;
      }
      const formatted = formatMiles(Number.parseInt(clean, 10) * 1000);
      setRawValue(formatted);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
        onEnter?.();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        confirm();
        onTab?.(e.shiftKey);
      }
    };

    const paletteColor = areaColor === 'default' ? 'grey' : areaColor;

    if (editing) {
      return (
        <Input
          inputRef={inputRef}
          value={rawValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={confirm}
          placeholder="0"
          disableUnderline={false}
          sx={(t) => ({
            ...NUM_FONT,
            fontSize: '12px',
            fontWeight: 500,
            width: '100%',
            '& input': { textAlign: 'right', padding: '2px 4px' },
            '&::after': {
              borderBottomColor: t.palette[
                paletteColor as keyof typeof t.palette
              ]
                ? (
                    t.palette[paletteColor as keyof typeof t.palette] as {
                      main: string;
                    }
                  ).main
                : t.palette.primary.main,
              borderBottomWidth: 2,
            },
          })}
          inputProps={{ inputMode: 'numeric' }}
        />
      );
    }

    // Empty cell = VOID (MERIDIAN)
    if (value <= 0) {
      return (
        <Box
          onClick={startEdit}
          sx={{
            width: '100%',
            height: '100%',
            cursor: readOnly ? 'default' : 'pointer',
            '&:hover': readOnly
              ? {}
              : { bgcolor: 'action.hover', borderRadius: 0.5 },
          }}
        />
      );
    }

    return (
      <Tooltip
        title={`M$ ${formatMiles(value)} — $${Math.floor(value).toLocaleString('es-CL')}`}
        arrow
        placement="top"
        enterDelay={500}
      >
        <Box
          onClick={startEdit}
          sx={{
            ...NUM_FONT,
            fontSize: '12px',
            fontWeight: 500,
            textAlign: 'right',
            cursor: readOnly ? 'default' : 'pointer',
            padding: '2px 4px',
            borderRadius: 0.5,
            color: 'text.secondary',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            '&:hover': readOnly
              ? {}
              : {
                  bgcolor: 'action.hover',
                },
          }}
        >
          {formatMiles(value)}
        </Box>
      </Tooltip>
    );
  },
);

MontoAreaInput.displayName = 'MontoAreaInput';

export default MontoAreaInput;
