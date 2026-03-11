import { useCrearPlanesCuentaMutation, useActualizarPlanesCuentaMutation } from 'mf_store/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { PanelMode } from '../../components/planCuentas/AccountPanel';
import { formatCodigo, type TreeItemData } from '../../utils/planDeCuentasUtils';
import useHookFormSchema from '../useHookFormSchema';
import { useVerificarCodigo, type CodigoStatus } from './useVerificarCodigo';

const MAX_NIVEL_CUENTA = 8;

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

interface UseAccountPanelOptions {
  onExpandNode?: (id: string) => void;
}

/**
 * Hook unificado para manejar el panel de crear/editar cuentas.
 * Consolida la lógica de useCreatePlanCuenta y usePlanDeCuentas.
 */
export function useAccountPanel(options?: UseAccountPanelOptions): UseAccountPanelReturn {
  const { onExpandNode } = options ?? {};
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
  const [actualizarPlanesCuenta] = useActualizarPlanesCuentaMutation();

  // Hook para verificar si el código ya existe
  const {
    status: codigoStatus,
    cuentaExistente: codigoExistente,
    verificar: verificarCodigo,
    reset: resetVerificacion,
    isExisting: codigoYaExiste,
  } = useVerificarCodigo();

  // Verificar código mediante subscription (no causa re-renders del componente padre)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const subscription = methods.watch((values, { name }) => {
      // Solo reaccionar a cambios en 'codigo'
      if (name !== 'codigo') return;
      if (mode !== 'crear') return;

      clearTimeout(debounceRef.current);

      const codigo = values.codigo as string;
      const valorPadre = values.valorPadre as string;
      const anoContable = values.anoContable as number;
      const tipoCuentaId = values.tipoCuentaId as number;

      if (!codigo || !valorPadre) {
        resetVerificacion();
        return;
      }

      const expectedLength = tipoCuentaId <= 4 ? 2 : 3;
      if (codigo.length === expectedLength) {
        // Debounce 300ms para evitar llamadas excesivas
        debounceRef.current = setTimeout(() => {
          const codigoCompleto = `${valorPadre}${codigo}`;
          verificarCodigo(anoContable, codigoCompleto);
        }, 300);
      } else {
        resetVerificacion();
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(debounceRef.current);
    };
  }, [mode, methods, verificarCodigo, resetVerificacion]);
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
          contraCuenta: item.data.contraCuenta || '',
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
          const nuevoTipo = data.tipoCuentaId + 1;
          const nuevaCuenta = {
            anoContable: data.anoContable,
            codigo: `${data.valorPadre}${data.codigo}`,
            contraCuenta: data.contraCuenta || '',
            nombre: data.nombre,
            tipoCuentaId: nuevoTipo,
            subgrupoId: data.subgrupoId,
            parentId: data.parentId ?? null,
          };

          const cuentaCreada = await crearPlanesCuenta(nuevaCuenta).unwrap();
          const codigoFmt = formatCodigo(nuevaCuenta.codigo, nuevoTipo);

          // Expandir el nodo padre en el árbol
          if (selectedItem) {
            onExpandNode?.(selectedItem.id);
          }

          if (nuevoTipo >= MAX_NIVEL_CUENTA) {
            // Nivel máximo alcanzado — cerrar panel
            toast.success(`Cuenta ${codigoFmt} creada`, {
              description: data.nombre,
            });
            toast.info('Nivel máximo alcanzado. No se pueden crear más subcuentas.');
            closePanel();
          } else {
            // Reposicionar panel en la cuenta recién creada como nuevo padre
            toast.success(`Cuenta ${codigoFmt} creada`, {
              description: data.nombre,
            });
            resetVerificacion();
            const nuevaCuentaItem: TreeItemData = {
              id: `cuenta-${cuentaCreada.id}`,
              label: `${codigoFmt} – ${data.nombre}`,
              tipoCuentaId: nuevoTipo,
              idPlanCuenta: cuentaCreada.id,
              data: {
                id: cuentaCreada.id,
                codigo: nuevaCuenta.codigo,
                nombre: data.nombre,
                tipoCuentaId: nuevoTipo,
                subgrupoId: data.subgrupoId ?? undefined,
                parentId: cuentaCreada.parentId ?? undefined,
                anoContable: data.anoContable,
              },
            };
            openCreatePanel(nuevaCuentaItem);
          }
        } else if (mode === 'editar') {
          if (!data.id) return;

          await actualizarPlanesCuenta({
            id: data.id,
            nombre: data.nombre,
            contraCuenta: data.contraCuenta || '',
          }).unwrap();

          const codigoFmt = formatCodigo(data.valorPadre, data.tipoCuentaId);
          toast.success(`Cuenta ${codigoFmt} actualizada`, {
            description: data.nombre,
          });
          closePanel();
        }
      } catch (error) {
        console.error('Error en operación de cuenta:', error);
        toast.error(
          mode === 'crear'
            ? 'No se pudo crear la cuenta'
            : 'No se pudo actualizar la cuenta',
          { description: 'Revise los datos e intente nuevamente' },
        );
      } finally {
        setIsLoading(false);
      }
    },
    [mode, crearPlanesCuenta, actualizarPlanesCuenta, methods, closePanel, openCreatePanel, selectedItem, onExpandNode, codigoYaExiste, codigoExistente, resetVerificacion],
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
