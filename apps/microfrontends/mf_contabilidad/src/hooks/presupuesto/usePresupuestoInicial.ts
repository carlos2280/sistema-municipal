import { zodResolver } from '@hookform/resolvers/zod';
import {
  useActualizarLineaMutation,
  useActualizarPresupuestoMutation,
  useAgregarLineaMutation,
  useCrearPresupuestoMutation,
  useEliminarLineaMutation,
  useEliminarPresupuestoMutation,
  useListarCuentasPresupuestariasQuery,
  useObtenerCentrosCostoQuery,
  useObtenerPresupuestoQuery,
  useObtenerSubprogramasQuery,
} from 'mf_store/store';
import type { DetalleItem } from 'mf_store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { TipoTab } from '@/types/presupuesto.types';
import {
  type SchemaPresupuestoHeader,
  schemaPresupuestoHeader,
} from '@/types/zod/presupuesto.zod';
import { useAgregarCuentaDrawer } from './useAgregarCuentaDrawer';
import { useDiscrepancias } from './useDiscrepancias';
import { useImportarExcel } from './useImportarExcel';
import { usePresupuestoDetalle } from './usePresupuestoDetalle';
import { usePresupuestoMatrix } from './usePresupuestoMatrix';

/** Estado del toast de confirmación de eliminación de línea */
export interface DeleteLineaToastState {
  open: boolean;
  clientId: string | null;
  cuentaCodigo?: string;
  cuentaNombre?: string;
  subcuentasCount: number;
  /** Todos los clientIds que serán eliminados (incluye raíz + descendientes) */
  targetIds: string[];
  /** IDs de servidor de filas a eliminar (para API calls) */
  serverIds: number[];
}

const EMPTY_DELETE_STATE: DeleteLineaToastState = {
  open: false,
  clientId: null,
  subcuentasCount: 0,
  targetIds: [],
  serverIds: [],
};

/**
 * Hook orquestador del Presupuesto Inicial.
 * Coordina: estado de UI, detalle del grid, sync con servidor, discrepancias.
 *
 * SOLID - SRP: orquesta sin contener lógica de negocio (delegada a sub-hooks).
 * SOLID - OCP: las operaciones de detalle se extienden en usePresupuestoDetalle.
 */
export const usePresupuestoInicial = (presupuestoId?: number) => {
  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [tabActivo, setTabActivo] = useState<TipoTab>('ingresos');
  const [headerCollapsed, setHeaderCollapsed] = useState(true);
  const [searchIngresos, setSearchIngresos] = useState('');
  const [searchGastos, setSearchGastos] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteLineaToast, setDeleteLineaToast] =
    useState<DeleteLineaToastState>(EMPTY_DELETE_STATE);

  // ── Formulario del encabezado ─────────────────────────────────────────────
  const anoActual = new Date().getFullYear();
  const anosDisponibles = [anoActual, anoActual + 1];

  const form = useForm<SchemaPresupuestoHeader>({
    resolver: zodResolver(schemaPresupuestoHeader),
    defaultValues: {
      anoContable: anoActual,
      glosa: `Presupuesto Inicial ${anoActual}`,
      actaDecreto: '',
    },
  });

  // ── Queries RTK ───────────────────────────────────────────────────────────
  const { data: presupuesto, isLoading: isLoadingPresupuesto } =
    useObtenerPresupuestoQuery(presupuestoId!, { skip: !presupuestoId });

  const { data: centrosCosto = [] } = useObtenerCentrosCostoQuery();
  const { data: subprogramas = [] } = useObtenerSubprogramasQuery();

  const anoContableForm = form.watch('anoContable');

  const { data: cuentasIngresos = [], isLoading: loadingCuentasIngresos } =
    useListarCuentasPresupuestariasQuery({
      tipo: 'ingreso',
      ano: anoContableForm,
    });

  const { data: cuentasGastos = [], isLoading: loadingCuentasGastos } =
    useListarCuentasPresupuestariasQuery({
      tipo: 'gasto',
      ano: anoContableForm,
    });

  // ── Mutations RTK ─────────────────────────────────────────────────────────
  const [crearPresupuesto] = useCrearPresupuestoMutation();
  const [actualizarPresupuesto] = useActualizarPresupuestoMutation();
  const [eliminarPresupuesto] = useEliminarPresupuestoMutation();
  const [agregarLinea] = useAgregarLineaMutation();
  const [actualizarLinea] = useActualizarLineaMutation();
  const [eliminarLinea] = useEliminarLineaMutation();

  // ── Detalle por tab ───────────────────────────────────────────────────────
  const detalleIngresos = usePresupuestoDetalle(
    presupuesto?.detalle.filter((d: DetalleItem) =>
      d.cuenta.codigo.startsWith('115'),
    ) ?? [],
  );
  const matrixGastos = usePresupuestoMatrix(
    presupuesto?.detalle.filter((d: DetalleItem) =>
      d.cuenta.codigo.startsWith('215'),
    ) ?? [],
  );
  // Alias para mantener compatibilidad con el código existente que usa detalleGastos
  const detalleGastos = matrixGastos;

  // Sync cuando cambia el presupuesto del servidor
  useEffect(() => {
    if (!presupuesto) return;
    detalleIngresos.resetFromServer(
      presupuesto.detalle.filter((d: DetalleItem) =>
        d.cuenta.codigo.startsWith('115'),
      ),
    );
    detalleGastos.resetFromServer(
      presupuesto.detalle.filter((d: DetalleItem) =>
        d.cuenta.codigo.startsWith('215'),
      ),
    );
    form.reset({
      anoContable: presupuesto.anoContable,
      glosa: presupuesto.glosa,
      actaDecreto: presupuesto.actaDecreto ?? '',
    });
  }, [presupuesto]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Importar desde Excel ──────────────────────────────────────────────────
  const { handleImportar } = useImportarExcel(
    cuentasIngresos,
    cuentasGastos,
    detalleIngresos.importarFilas,
    detalleGastos.importarFilas,
    subprogramas,
  );

  // ── Drawer Agregar Cuenta ──────────────────────────────────────────────
  const cuentasActivas =
    tabActivo === 'ingresos' ? cuentasIngresos : cuentasGastos;
  const detalleActivoForDrawer =
    tabActivo === 'ingresos' ? detalleIngresos : detalleGastos;

  const agregarDrawer = useAgregarCuentaDrawer(
    cuentasActivas,
    detalleActivoForDrawer.cuentasEnUso,
  );

  const handleAgregarConfirm = useCallback(
    (
      leaf: import('mf_store/store').CuentaPresupuestaria,
      monto: number,
      ancestors: import('mf_store/store').CuentaPresupuestaria[],
      centroCostoId: number | null,
    ) => {
      detalleActivoForDrawer.agregarCuentaConAncestros(
        leaf,
        monto,
        ancestors,
        centroCostoId,
      );
    },
    [detalleActivoForDrawer],
  );

  // ── Discrepancias y equilibrio ────────────────────────────────────────────
  const {
    discrepanciasIngresosMap,
    discrepanciasGastosMap,
    totalDiscrepancias,
    equilibrio,
  } = useDiscrepancias(
    detalleIngresos.filasDisplay,
    detalleGastos.filasDisplay,
  );

  // ── Detalle activo según tab ──────────────────────────────────────────────
  const detalleActivo =
    tabActivo === 'ingresos' ? detalleIngresos : detalleGastos;
  const discrepanciasActivoMap =
    tabActivo === 'ingresos'
      ? discrepanciasIngresosMap
      : discrepanciasGastosMap;
  const cuentasDisponibles =
    tabActivo === 'ingresos' ? cuentasIngresos : cuentasGastos;

  const totalIngresos = useMemo(
    () =>
      detalleIngresos.filasDisplay
        .filter((f) => f.nivel === 0)
        .reduce((s, f) => s + f.montoAnual, 0),
    [detalleIngresos.filasDisplay],
  );

  const totalGastos = useMemo(
    () =>
      detalleGastos.filasDisplay
        .filter((f) => f.nivel === 0)
        .reduce((s, f) => s + f.montoAnual, 0),
    [detalleGastos.filasDisplay],
  );

  const totalTab = tabActivo === 'ingresos' ? totalIngresos : totalGastos;

  // ── Handlers de Tab ───────────────────────────────────────────────────────
  const handleTabNavigation = useCallback(
    (clientId: string, shiftKey: boolean) => {
      const display = detalleActivo.filasDisplay;
      const idx = display.findIndex((f) => f._clientId === clientId);
      if (idx === -1) return;

      const targetIdx = shiftKey ? idx - 1 : idx + 1;

      if (targetIdx >= 0 && targetIdx < display.length) {
        const targetId = display[targetIdx]._clientId;
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(
            `[data-monto-id="${targetId}"]`,
          );
          el?.click();
        }, 10);
        return;
      }

      // Tab en última fila → crear nueva fila
      if (!shiftKey && idx === display.length - 1) {
        detalleActivo.agregarLinea();
      }
    },
    [detalleActivo],
  );

  // ── Recalcular ───────────────────────────────────────────────────────────
  const handleRecalcular = useCallback(
    (clientId: string) => {
      const display = detalleActivo.filasDisplay.find(
        (f) => f._clientId === clientId,
      );
      if (!display) return;
      detalleActivo.recalcularPadre(clientId, display.hijosIds);
    },
    [detalleActivo],
  );

  const handleRecalcularTodo = useCallback(() => {
    detalleIngresos.recalcularTodo(detalleIngresos.filasDisplay);
    detalleGastos.recalcularTodo(detalleGastos.filasDisplay);
  }, [detalleIngresos, detalleGastos]);

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleGuardar = form.handleSubmit(async (headerData) => {
    const todasFilas = [
      ...detalleIngresos.filasDisplay,
      ...detalleGastos.filasDisplay,
    ];

    if (todasFilas.length === 0) {
      toast.error('Agregue al menos una línea de detalle antes de guardar.');
      return;
    }

    if (totalDiscrepancias > 0) {
      toast.warning(
        `Hay ${totalDiscrepancias} discrepancia(s) pendiente(s). El presupuesto se guardará igualmente.`,
        { duration: 5000 },
      );
    }

    setIsSaving(true);
    try {
      let pid = presupuestoId;

      // Crear o actualizar encabezado
      if (!pid) {
        const nuevo = await crearPresupuesto({
          anoContable: headerData.anoContable,
          glosa: headerData.glosa,
          actaDecreto: headerData.actaDecreto || undefined,
          usuarioCreacion: 1, // TODO: obtener del store de auth
        }).unwrap();
        pid = nuevo.id;
      } else {
        await actualizarPresupuesto({
          id: pid,
          glosa: headerData.glosa,
          actaDecreto: headerData.actaDecreto || undefined,
        }).unwrap();
      }

      // Guardar filas nuevas o modificadas
      const filasDirtyIngresos = detalleIngresos.filasDirty;
      const filasDirtyGastos = detalleGastos.filasDirty;

      for (const fila of [...filasDirtyIngresos, ...filasDirtyGastos]) {
        if (!fila.cuentaId || !fila.montoAnual) continue;

        if (fila.isNew || !fila.id) {
          const created = await agregarLinea({
            presupuestoId: pid,
            cuentaId: fila.cuentaId,
            centroCostoId: fila.centroCostoId ?? null,
            montoAnual: fila.montoAnual,
            observacion: fila.observacion,
          }).unwrap();
          detalleIngresos.marcarGuardada(fila._clientId, created.id);
          detalleGastos.marcarGuardada(fila._clientId, created.id);
        } else {
          await actualizarLinea({
            presupuestoId: pid,
            detalleId: fila.id,
            montoAnual: fila.montoAnual,
            centroCostoId: fila.centroCostoId ?? null,
            observacion: fila.observacion,
          }).unwrap();
        }
      }

      toast.success('Presupuesto guardado correctamente.');
    } catch {
      toast.error('Error al guardar el presupuesto.');
    } finally {
      setIsSaving(false);
    }
  });

  // ── Eliminar documento ────────────────────────────────────────────────────
  const handleEliminarPresupuesto = useCallback(async () => {
    if (!presupuestoId) return;
    try {
      await eliminarPresupuesto(presupuestoId).unwrap();
      toast.success('Presupuesto eliminado.');
      setConfirmDelete(false);
    } catch {
      toast.error('Error al eliminar el presupuesto.');
    }
  }, [presupuestoId, eliminarPresupuesto]);

  // ── Eliminar línea con cascade ──────────────────────────────────────────
  /**
   * Inicia el flujo de eliminación:
   * 1. Filas nuevas sin descendientes → eliminación inmediata
   * 2. Filas con descendientes o guardadas → muestra toast de confirmación
   *
   * Equivale al prototipo: piDeleteRow() → compute targetRows → show toast
   */
  const handleEliminarLinea = useCallback(
    (clientId: string) => {
      const fila = detalleActivo.filasDisplay.find(
        (f) => f._clientId === clientId,
      );
      if (!fila) return;

      const info = detalleActivo.getInfoEliminar(clientId);

      // Fila nueva sin descendientes → eliminación inmediata (no necesita confirmación)
      if ((fila.isNew || !fila.id) && info.count === 0) {
        detalleActivo.eliminarFila(clientId);
        return;
      }

      // Recopilar IDs para highlight y API calls
      const allFilas = detalleActivo.filasDisplay;
      const targetIds = [clientId, ...info.descendantIds];
      const serverIds = allFilas
        .filter((f) => targetIds.includes(f._clientId) && f.id !== undefined)
        .map((f) => f.id!);

      // Mostrar toast de confirmación + resaltar filas en rojo
      setDeleteLineaToast({
        open: true,
        clientId,
        cuentaCodigo: fila.cuenta?.codigo,
        cuentaNombre: fila.cuenta?.nombre,
        subcuentasCount: info.count,
        targetIds,
        serverIds,
      });
    },
    [detalleActivo],
  );

  /**
   * Confirma la eliminación en cascada:
   * 1. Elimina cada fila persistida del servidor (API call por fila)
   * 2. Elimina localmente el nodo + descendientes
   * 3. Recalcula montos de ancestros
   *
   * Equivale al prototipo: piConfirmDelete() → animate → remove → recalc
   */
  const handleConfirmEliminarLinea = useCallback(async () => {
    const { clientId, serverIds } = deleteLineaToast;
    if (!clientId) return;

    setIsSaving(true);
    try {
      // Eliminar del servidor (en paralelo para mejor performance)
      if (presupuestoId && serverIds.length > 0) {
        await Promise.all(
          serverIds.map((detalleId) =>
            eliminarLinea({ presupuestoId, detalleId }).unwrap(),
          ),
        );
      }

      // Eliminar localmente con cascade + recalc de ancestros
      detalleActivo.eliminarConDescendientes(clientId);

      const count = deleteLineaToast.subcuentasCount;
      const msg =
        count > 0
          ? `Línea y ${count} subcuenta${count > 1 ? 's' : ''} eliminada${count > 1 ? 's' : ''}.`
          : 'Línea eliminada.';
      toast.success(msg);
    } catch {
      toast.error('Error al eliminar la línea.');
    } finally {
      setIsSaving(false);
      setDeleteLineaToast(EMPTY_DELETE_STATE);
    }
  }, [deleteLineaToast, presupuestoId, eliminarLinea, detalleActivo]);

  /** Cancela el toast de eliminación */
  const handleCancelEliminarLinea = useCallback(() => {
    setDeleteLineaToast(EMPTY_DELETE_STATE);
  }, []);

  return {
    // Estado UI
    tabActivo,
    setTabActivo,
    headerCollapsed,
    setHeaderCollapsed: () => setHeaderCollapsed((p) => !p),
    searchIngresos,
    setSearchIngresos,
    searchGastos,
    setSearchGastos,
    confirmDelete,
    setConfirmDelete,
    isSaving,
    isLoadingPresupuesto,
    // Formulario
    form,
    anosDisponibles,
    numero: presupuesto?.numero ?? null,
    // Metadatos del documento
    fechaCreacion: presupuesto?.createdAt ?? null,
    fechaModificacion: presupuesto?.updatedAt ?? null,
    // Datos
    centrosCosto,
    cuentasIngresos,
    cuentasGastos,
    cuentasDisponibles,
    loadingCuentas:
      tabActivo === 'ingresos' ? loadingCuentasIngresos : loadingCuentasGastos,
    loadingCuentasIngresos,
    loadingCuentasGastos,
    // Detalle por tab (para render simultáneo)
    detalleIngresos,
    detalleGastos,
    // Matrix de gastos (para PresupuestoMatrixGrid)
    matrixGastos,
    subprogramas,
    // Detalle activo (para handlers)
    detalleActivo,
    discrepanciasActivoMap,
    // Ingresos/Gastos para Resumen
    filasIngresos: detalleIngresos.filasDisplay,
    filasGastos: detalleGastos.filasDisplay,
    // Totales
    totalTab,
    totalIngresos,
    totalGastos,
    // Discrepancias y equilibrio
    totalDiscrepancias,
    equilibrio,
    // Handlers
    handleTabNavigation,
    handleRecalcular,
    handleRecalcularTodo,
    handleImportar,
    handleGuardar,
    handleEliminarPresupuesto,
    handleEliminarLinea,
    handleConfirmEliminarLinea,
    handleCancelEliminarLinea,
    // Delete toast state
    deleteLineaToast,
    // Mapas individuales para badges de tabs
    discrepanciasIngresosMap,
    discrepanciasGastosMap,
    // Drawer agregar cuenta
    agregarDrawer,
    handleAgregarConfirm,
  };
};
