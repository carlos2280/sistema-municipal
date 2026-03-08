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

/**
 * Retorna el prefijo del titulo opuesto para filtrar cuentas de contraCuenta.
 * - 115-xx (Deudores Presupuestarios) -> Titulo 4 (Ingresos)
 * - 215-xx (Acreedores Presupuestarios) -> Titulo 5 (Gastos)
 * - 11405 (Anticipos a Proveedores) -> Titulo 5 (Gastos)
 */
export const getContraCuentaPrefijo = (codigo: string): string => {
  if (!codigo) return '';
  const cleanCode = codigo.replace(/-/g, '');

  if (cleanCode.startsWith('115')) return '4';
  if (cleanCode.startsWith('215')) return '5';
  if (cleanCode.startsWith('11405')) return '5';

  return '';
};
