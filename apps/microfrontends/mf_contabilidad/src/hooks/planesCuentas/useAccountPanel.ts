import { useCrearPlanesCuentaMutation } from 'mf_store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { PanelMode } from '../../components/planCuentas/AccountPanel';
import type { TreeItemData } from '../../utils/planDeCuentasUtils';
import useHookFormSchema from '../useHookFormSchema';
import { useVerificarCodigo, type CodigoStatus } from './useVerificarCodigo';

// Tipo del formulario de cuenta
interface AccountFormData {
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

// ============================================================================
// Schema de validación
// ============================================================================

const accountFormSchema = z
  .object({
    id: z.number().int().positive().optional(),
    anoContable: z.number().int().gte(2000).lte(2100),
    tipoCuentaId: z.number().int().positive(),
    subgrupoId: z.number().int().positive().optional(),
    parentId: z.number().int().positive().optional().nullable(),
    valorPadre: z.string().min(1),
    nombre: z.string().min(1, { message: 'El nombre es obligatorio' }),
    codigo: z.string().min(1, { message: 'El código es obligatorio' }),
    contraCuenta: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { tipoCuentaId, codigo } = data;

    // Solo validar si hay código ingresado
    if (!codigo || codigo.length === 0) return;

    // El tipoCuentaId es del PADRE. Para niveles <= 4, esperamos 2 dígitos
    // Para niveles >= 5, esperamos 3 dígitos
    const expectedLength = tipoCuentaId <= 4 ? 2 : 3;

    if (codigo.length !== expectedLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['codigo'],
        message: `El código debe tener ${expectedLength} dígitos`,
      });
    }

    if (!/^\d+$/.test(codigo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['codigo'],
        message: 'El código debe contener solo números',
      });
    }
  });

// ============================================================================
// Hook principal
// ============================================================================

interface UseAccountPanelReturn {
  // Estado del panel
  isOpen: boolean;
  mode: PanelMode;
  selectedItem: TreeItemData | null;
  isLoading: boolean;

  // Form
  methods: ReturnType<typeof useHookFormSchema<AccountFormData>>['methods'];

  // Verificación de código
  codigoStatus: CodigoStatus;
  codigoExistente: { id: number; codigo: string; nombre: string } | null;

  // Acciones
  openCreatePanel: (item: TreeItemData) => void;
  openEditPanel: (item: TreeItemData) => void;
  closePanel: () => void;
  handleSubmit: (data: AccountFormData) => Promise<void>;
}

/**
 * Hook unificado para manejar el panel de crear/editar cuentas.
 * Consolida la lógica de useCreatePlanCuenta y usePlanDeCuentas.
 */
export function useAccountPanel(): UseAccountPanelReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>(null);
  const [selectedItem, setSelectedItem] = useState<TreeItemData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { methods } = useHookFormSchema<AccountFormData>({
    schema: accountFormSchema,
    defaultValues: {
      anoContable: new Date().getFullYear(),
      tipoCuentaId: 1, // Valor inicial que se sobrescribe al abrir panel
      valorPadre: '',
      codigo: '',
      nombre: '',
      contraCuenta: '',
    },
    mode: 'onChange',
  });

  const [crearPlanesCuenta] = useCrearPlanesCuentaMutation();

  // Hook para verificar si el código ya existe
  const {
    status: codigoStatus,
    cuentaExistente: codigoExistente,
    verificar: verificarCodigo,
    reset: resetVerificacion,
    isExisting: codigoYaExiste,
  } = useVerificarCodigo();

  // Observar cambios en código y valorPadre para verificar existencia
  const codigoActual = methods.watch('codigo');
  const valorPadreActual = methods.watch('valorPadre');
  const anoContableActual = methods.watch('anoContable');
  const tipoCuentaIdActual = methods.watch('tipoCuentaId');

  // Verificar código cuando cambie y tenga la longitud esperada
  useEffect(() => {
    if (mode !== 'crear' || !codigoActual || !valorPadreActual) {
      resetVerificacion();
      return;
    }

    const expectedLength = tipoCuentaIdActual <= 4 ? 2 : 3;
    if (codigoActual.length === expectedLength) {
      const codigoCompleto = `${valorPadreActual}${codigoActual}`;
      verificarCodigo(anoContableActual, codigoCompleto);
    } else {
      resetVerificacion();
    }
  }, [
    mode,
    codigoActual,
    valorPadreActual,
    anoContableActual,
    tipoCuentaIdActual,
    verificarCodigo,
    resetVerificacion,
  ]);
  // -------------------------------------------------------------------------
  // Abrir panel en modo CREAR
  // -------------------------------------------------------------------------
  const openCreatePanel = useCallback(
    (item: TreeItemData) => {
      setSelectedItem(item);
      setMode('crear');

      // Determinar si es un nodo de cuentas_subgrupos o de planes_cuentas
      // Si no tiene subgrupoId, es un nodo de cuentas_subgrupos
      const isSubgrupoNode = !item.data.subgrupoId;

      // Preparar datos del formulario basados en el item padre
      // Usar keepErrors: false para limpiar errores anteriores
      methods.reset(
        {
          // id: undefined para crear nueva cuenta
          anoContable: item.data.anoContable ?? new Date().getFullYear(),
          // Si es nodo de subgrupo, el parentId de la nueva cuenta será null (primera cuenta del subgrupo)
          // Si es nodo de planes_cuentas, el parentId será el id del item
          parentId: isSubgrupoNode ? null : item.data.id,
          // Si es nodo de subgrupo, usar su ID como subgrupoId
          // Si es nodo de planes_cuentas, heredar el subgrupoId
          subgrupoId: isSubgrupoNode ? item.data.id : item.data.subgrupoId,
          tipoCuentaId: item.data.tipoCuentaId,
          valorPadre: item.data.codigo,
          nombre: '',
          codigo: '',
          contraCuenta: '',
        },
        { keepErrors: false, keepDirty: false, keepIsValid: false },
      );

      // Forzar re-validación para actualizar isValid
      setTimeout(() => methods.trigger(), 0);

      setIsOpen(true);
    },
    [methods],
  );

  // -------------------------------------------------------------------------
  // Abrir panel en modo EDITAR
  // -------------------------------------------------------------------------
  const openEditPanel = useCallback(
    (item: TreeItemData) => {
      setSelectedItem(item);
      setMode('editar');

      // Cargar datos existentes de la cuenta
      const [codigo] = item.label.split(' – ');

      methods.reset(
        {
          id: item.data.id,
          anoContable: item.data.anoContable ?? new Date().getFullYear(),
          parentId: item.data.parentId ?? null,
          subgrupoId: item.data.subgrupoId,
          tipoCuentaId: item.data.tipoCuentaId,
          valorPadre: item.data.codigo,
          nombre: item.data.nombre,
          codigo: codigo.split('-').pop() || '',
          contraCuenta: '', // TODO: cargar desde API si existe
        },
        { keepErrors: false, keepDirty: false },
      );
      setIsOpen(true);
    },
    [methods],
  );

  // -------------------------------------------------------------------------
  // Cerrar panel
  // -------------------------------------------------------------------------
  const closePanel = useCallback(() => {
    setIsOpen(false);
    setMode(null);
    setSelectedItem(null);
    methods.reset();
    resetVerificacion();
  }, [methods, resetVerificacion]);

  // -------------------------------------------------------------------------
  // Submit del formulario
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (data: AccountFormData) => {
      // Verificar si el código ya existe antes de crear
      if (mode === 'crear' && codigoYaExiste) {
        toast.error(
          `El código ${data.valorPadre}${data.codigo} ya existe: ${codigoExistente?.nombre}`,
        );
        return;
      }

      setIsLoading(true);

      try {
        if (mode === 'crear') {
          // tipoCuentaId + 1 porque la nueva cuenta es un nivel más profundo
          const nuevaCuenta = {
            anoContable: data.anoContable,
            codigo: `${data.valorPadre}${data.codigo}`,
            contraCuenta: data.contraCuenta || '',
            nombre: data.nombre,
            tipoCuentaId: data.tipoCuentaId + 1,
            subgrupoId: data.subgrupoId,
            parentId: data.parentId ?? null,
          };

          await crearPlanesCuenta(nuevaCuenta).unwrap();
          toast.success(`Cuenta ${nuevaCuenta.codigo} creada correctamente`);

          // Mantener el panel abierto para crear más cuentas del mismo padre
          methods.reset(
            {
              ...data,
              codigo: '',
              nombre: '',
              contraCuenta: '',
            },
            { keepErrors: false, keepDirty: false },
          );
          resetVerificacion();
        } else if (mode === 'editar') {
          // TODO: Implementar actualización
          toast.info('Actualización de cuenta (pendiente de implementar)');
          closePanel();
        }
      } catch (error) {
        console.error('Error en operación de cuenta:', error);
        toast.error('Ocurrió un error. Por favor contacte al administrador.');
      } finally {
        setIsLoading(false);
      }
    },
    [mode, crearPlanesCuenta, methods, closePanel, codigoYaExiste, codigoExistente, resetVerificacion],
  );

  return useMemo(
    () => ({
      isOpen,
      mode,
      selectedItem,
      isLoading,
      methods,
      codigoStatus,
      codigoExistente,
      openCreatePanel,
      openEditPanel,
      closePanel,
      handleSubmit,
    }),
    [
      isOpen,
      mode,
      selectedItem,
      isLoading,
      methods,
      codigoStatus,
      codigoExistente,
      openCreatePanel,
      openEditPanel,
      closePanel,
      handleSubmit,
    ],
  );
}
