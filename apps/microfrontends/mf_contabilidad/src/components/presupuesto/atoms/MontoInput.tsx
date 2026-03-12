import { Box, Input } from "@mui/material";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  if (!value && value !== 0) return "0";
  return Math.floor(value).toLocaleString("es-CL");
};

/** Parsea string con puntos a número entero */
const parseCLP = (raw: string): number => {
  const clean = raw.replace(/\./g, "").replace(/[^\d]/g, "");
  return parseInt(clean, 10) || 0;
};

const MontoInput = ({
  value,
  onConfirm,
  onTab,
  readOnly = false,
  placeholder = "0",
  hasError = false,
}: MontoInputProps) => {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (readOnly) return;
    setRawValue(value === 0 ? "" : formatCLP(value));
    setEditing(true);
  };

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
    setRawValue("");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^\d]/g, "");
    if (clean === "") { setRawValue(""); return; }
    const formatted = formatCLP(parseInt(clean, 10));
    const cursorFromEnd = e.target.value.length - (e.target.selectionStart ?? 0);
    setRawValue(formatted);
    setTimeout(() => {
      const pos = formatted.length - cursorFromEnd;
      inputRef.current?.setSelectionRange(Math.max(0, pos), Math.max(0, pos));
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); confirm(); }
    else if (e.key === "Escape") { e.preventDefault(); cancel(); }
    else if (e.key === "Tab") { e.preventDefault(); confirm(); onTab?.(e.shiftKey); }
  };

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
          fontFamily: "monospace",
          fontSize: "0.8125rem",
          fontWeight: 600,
          width: 160,
          "& input": { textAlign: "right", padding: "3px 8px" },
        }}
        inputProps={{ inputMode: "numeric" }}
      />
    );
  }

  return (
    <Box
      onClick={startEdit}
      sx={{
        fontFamily: "monospace",
        fontSize: "0.8125rem",
        fontWeight: 600,
        textAlign: "right",
        cursor: readOnly ? "default" : "pointer",
        padding: "2px 6px",
        margin: "-2px -6px",
        borderRadius: 0.5,
        color: hasError ? "error.main" : value === 0 ? "text.disabled" : "text.primary",
        "&:hover": readOnly ? {} : {
          bgcolor: "rgba(13, 107, 94, 0.06)",
          boxShadow: "0 0 0 2px rgba(13, 107, 94, 0.12)",
        },
        userSelect: "none",
        whiteSpace: "nowrap",
        transition: "background 0.1s, box-shadow 0.1s",
        display: "inline-block",
      }}
    >
      {value === 0 ? placeholder : formatCLP(value)}
    </Box>
  );
};

export default MontoInput;
