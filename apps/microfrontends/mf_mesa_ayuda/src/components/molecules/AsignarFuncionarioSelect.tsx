import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { UserCheck } from 'lucide-react';
import { useState } from 'react';

interface AsignarFuncionarioSelectProps {
  onAsignar: (asignadoId: number, asignadoNombre: string) => void;
  isAssigning: boolean;
  asignadoActual: string | null;
}

function AsignarFuncionarioSelect({
  onAsignar,
  isAssigning,
  asignadoActual,
}: AsignarFuncionarioSelectProps) {
  const [funcionarioId, setFuncionarioId] = useState('');
  const [funcionarioNombre, setFuncionarioNombre] = useState('');

  const handleAsignar = () => {
    const id = Number(funcionarioId);
    if (id > 0 && funcionarioNombre.trim()) {
      onAsignar(id, funcionarioNombre.trim());
      setFuncionarioId('');
      setFuncionarioNombre('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {asignadoActual && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <UserCheck size={14} />
          <span>{asignadoActual}</span>
        </Box>
      )}

      <TextField
        size="small"
        label="ID Funcionario"
        type="number"
        value={funcionarioId}
        onChange={(e) => setFuncionarioId(e.target.value)}
      />
      <TextField
        size="small"
        label="Nombre Funcionario"
        value={funcionarioNombre}
        onChange={(e) => setFuncionarioNombre(e.target.value)}
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<UserCheck size={14} />}
        onClick={handleAsignar}
        disabled={!funcionarioId || !funcionarioNombre.trim() || isAssigning}
      >
        {asignadoActual ? 'Reasignar' : 'Asignar'}
      </Button>
    </Box>
  );
}

export default AsignarFuncionarioSelect;
