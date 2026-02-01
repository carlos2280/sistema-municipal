import type { UseFormReturn } from 'react-hook-form';
import type { TreeItemData } from '../../../utils/planDeCuentasUtils';

export type PanelMode = 'crear' | 'editar' | null;

export type CodigoStatus = 'idle' | 'checking' | 'available' | 'exists' | 'error';

export interface CuentaExistente {
  id: number;
  codigo: string;
  nombre: string;
}

export interface AccountFormData {
  id?: number;
  anoContable: number;
  codigo: string;
  nombre: string;
  contraCuenta?: string;
  tipoCuentaId: number;
  subgrupoId?: number;
  parentId?: number | null;
  valorPadre: string;
}

export interface AccountPanelProps {
  open: boolean;
  mode: PanelMode;
  selectedItem: TreeItemData | null;
  methods: UseFormReturn<AccountFormData>;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => Promise<void>;
  isLoading?: boolean;
  codigoStatus?: CodigoStatus;
  codigoExistente?: CuentaExistente | null;
}

/**
 * Determina si un código de cuenta requiere campo de contracuenta.
 * Aplica para grupos 115, 215 y código 11405
 */
export const requiresContraCuenta = (codigo: string): boolean => {
  if (!codigo) return false;
  const cleanCode = codigo.replace(/-/g, '');

  // Grupos 115 y 215 en todos sus niveles
  if (cleanCode.startsWith('115') || cleanCode.startsWith('215')) {
    return true;
  }

  // Código específico 11405
  if (cleanCode.startsWith('11405')) {
    return true;
  }

  return false;
};
