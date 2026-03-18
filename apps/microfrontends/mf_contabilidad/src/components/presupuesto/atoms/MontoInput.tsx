import { Box, Input } from '@mui/material';
import {
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface MontoInputHandle {
  startEdit: () => void;
}

interface MontoInputProps {
  value: number;
  onConfirm: (value: number) => void;
  onTab?: (shiftKey: boolean) => void;
  readOnly?: boolean;
  placeholder?: string;
  /** Colorea el monto en rojo cuando hay discrepancia */
  hasError?: boolean;
}

/** Formatea un número como pesos chilenos: 1.339.721.000 */
export const formatCLP = (value: number): string => {
  if (!value && value !== 0) return '0';
  return Math.floor(value).toLocaleString('es-CL');
};

/** Parsea string con puntos a número entero */
const parseCLP = (raw: string): number => {
  const clean = raw.replace(/\./g, '').replace(/[^\d]/g, '');
  return Number.parseInt(clean, 10) || 0;
};

const MontoInput = forwardRef<MontoInputHandle, MontoInputProps>(
  (
    {
      value,
      onConfirm,
      onTab,
      readOnly = false,
      placeholder = '0',
      hasError = false,
    },
    ref,
  ) => {
    const [editing, setEditing] = useState(false);
    const [rawValue, setRawValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const startEdit = () => {
      if (readOnly) return;
      setRawValue(value === 0 ? '' : formatCLP(value));
      setEditing(true);
    };

    useImperativeHandle(ref, () => ({ startEdit }));

    useEffect(() => {
      if (editing) inputRef.current?.select();
    }, [editing]);

    const confirm = useCallback(() => {
      const parsed = parseCLP(rawValue);
      setEditing(false);
      onConfirm(parsed);
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
      const formatted = formatCLP(Number.parseInt(clean, 10));
      const cursorFromEnd =
        e.target.value.length - (e.target.selectionStart ?? 0);
      setRawValue(formatted);
      setTimeout(() => {
        const pos = formatted.length - cursorFromEnd;
        inputRef.current?.setSelectionRange(Math.max(0, pos), Math.max(0, pos));
      }, 0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        confirm();
        onTab?.(e.shiftKey);
      }
    };

    const numFont = {
      fontFamily: "'Space Grotesk', sans-serif",
      fontFeatureSettings: "'tnum' 1, 'ss01' 1",
    } as const;

    if (editing) {
      return (
        <Input
          inputRef={inputRef}
          value={rawValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={confirm}
          placeholder={placeholder}
          disableUnderline={false}
          sx={{
            ...numFont,
            fontSize: '12.5px',
            fontWeight: 600,
            width: 160,
            '& input': { textAlign: 'right', padding: '3px 8px' },
          }}
          inputProps={{ inputMode: 'numeric' }}
        />
      );
    }

    return (
      <Box
        onClick={startEdit}
        sx={{
          ...numFont,
          fontSize: '12.5px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          textAlign: 'right',
          cursor: readOnly ? 'default' : 'pointer',
          padding: '2px 6px',
          margin: '-2px -6px',
          borderRadius: 0.5,
          color: hasError
            ? 'warning.main'
            : value === 0
              ? 'text.disabled'
              : 'inherit',
          '&:hover': readOnly
            ? {}
            : {
                bgcolor: 'action.hover',
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.primary.main}20`,
              },
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'background 0.1s, box-shadow 0.1s',
          display: 'inline-block',
        }}
      >
        {value === 0 ? placeholder : formatCLP(value)}
      </Box>
    );
  },
);

MontoInput.displayName = 'MontoInput';

export default MontoInput;
