import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Search, X } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const TreeSearchBar: FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);
  return (
    <TextField
      placeholder="Buscar cuentas..."
      size="small"
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={20} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')}>
              {' '}
              <X size={16} />{' '}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 300,
        '& .MuiOutlinedInput-root': { backgroundColor: 'background.default' },
      }}
    />
  );
};
