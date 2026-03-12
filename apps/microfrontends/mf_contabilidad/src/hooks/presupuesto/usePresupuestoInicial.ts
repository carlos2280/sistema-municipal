import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useObtenerPresupuestoQuery,
  useCrearPresupuestoMutation,
  useActualizarPresupuestoMutation,
  useEliminarPresupuestoMutation,
  useAgregarLineaMutation,
  useActualizarLineaMutation,
  useEliminarLineaMutation,
  useObtenerCentrosCostoQuery,
  useListarCuentasPresupuestariasQuery,
} from "mf_store/store";
import { schemaPresupuestoHeader, type SchemaPresupuestoHeader } from "../../types/zod/presupuesto.zod";
import type { TipoTab } from "../../types/presupuesto.types";
import type { DetalleItem } from "mf_store/store";
import { usePresupuestoDetalle } from "./usePresupuestoDetalle";
import { useDiscrepancias } from "./useDiscrepancias";
import { useImportarExcel } from "./useImportarExcel";

/**
 * Hook orquestador del Presupuesto Inicial.
 * Coordina: estado de UI, detalle del grid, sync con servidor, discrepancias.
 *
 * SOLID - SRP: orquesta sin contener lógica de negocio (delegada a sub-hooks).
 * SOLID - OCP: las operaciones de detalle se extienden en usePresupuestoDetalle.
 */
export const usePresupuestoInicial = (presupuestoId?: number) => {
  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [tabActivo, setTabActivo] = useState<TipoTab>("ingresos");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [searchIngresos, setSearchIngresos] = useState("");
  const [searchGastos, setSearchGastos] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Formulario del encabezado ─────────────────────────────────────────────
  const anoActual = new Date().getFullYear();
  const anosDisponibles = [anoActual, anoActual + 1];

  const form = useForm<SchemaPresupuestoHeader>({
    resolver: zodResolver(schemaPresupuestoHeader),
    defaultValues: {
      anoContable: anoActual,
      glosa: `Presupuesto Inicial ${anoActual}`,
      actaDecreto: "",
    },
  });

  // ── Queries RTK ───────────────────────────────────────────────────────────
  const { data: presupuesto, isLoading: isLoadingPresupuesto } = useObtenerPresupuestoQuery(
    presupuestoId!,
    { skip: !presupuestoId },
  );

  const { data: centrosCosto = [] } = useObtenerCentrosCostoQuery();

  const anoContableForm = form.watch("anoContable");

  const { data: cuentasIngresos = [], isLoading: loadingCuentasIngresos } =
    useListarCuentasPresupuestariasQuery({
      tipo: "ingreso",
      ano: anoContableForm,
    });

  const { data: cuentasGastos = [], isLoading: loadingCuentasGastos } =
    useListarCuentasPresupuestariasQuery({
      tipo: "gasto",
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
    presupuesto?.detalle.filter((d: DetalleItem) => d.cuenta.codigo.startsWith("115")) ?? [],
  );
  const detalleGastos = usePresupuestoDetalle(
    presupuesto?.detalle.filter((d: DetalleItem) => d.cuenta.codigo.startsWith("215")) ?? [],
  );

  // Sync cuando cambia el presupuesto del servidor
  useEffect(() => {
    if (!presupuesto) return;
    detalleIngresos.resetFromServer(
      presupuesto.detalle.filter((d: DetalleItem) => d.cuenta.codigo.startsWith("115")),
    );
    detalleGastos.resetFromServer(
      presupuesto.detalle.filter((d: DetalleItem) => d.cuenta.codigo.startsWith("215")),
    );
    form.reset({
      anoContable: presupuesto.anoContable,
      glosa: presupuesto.glosa,
      actaDecreto: presupuesto.actaDecreto ?? "",
    });
  }, [presupuesto]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Importar desde Excel ──────────────────────────────────────────────────
  const { handleImportar } = useImportarExcel(
    cuentasIngresos,
    cuentasGastos,
    detalleIngresos.importarFilas,
    detalleGastos.importarFilas,
  );

  // ── Discrepancias y equilibrio ────────────────────────────────────────────
  const { discrepanciasIngresosMap, discrepanciasGastosMap, totalDiscrepancias, equilibrio } =
    useDiscrepancias(detalleIngresos.filasDisplay, detalleGastos.filasDisplay);

  // ── Detalle activo según tab ──────────────────────────────────────────────
  const detalleActivo = tabActivo === "ingresos" ? detalleIngresos : detalleGastos;
  const discrepanciasActivoMap =
    tabActivo === "ingresos" ? discrepanciasIngresosMap : discrepanciasGastosMap;
  const searchActivo = tabActivo === "ingresos" ? searchIngresos : searchGastos;
  const setSearchActivo = tabActivo === "ingresos" ? setSearchIngresos : setSearchGastos;
  const cuentasDisponibles = tabActivo === "ingresos" ? cuentasIngresos : cuentasGastos;

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

  const totalTab = tabActivo === "ingresos" ? totalIngresos : totalGastos;

  // ── Handlers de Tab ───────────────────────────────────────────────────────
  const handleTabNavigation = useCallback(
    (clientId: string, shiftKey: boolean) => {
      const display = detalleActivo.filasDisplay;
      const idx = display.findIndex((f) => f._clientId === clientId);
      if (idx === -1) return;

      const targetIdx = shiftKey ? idx - 1 : idx + 1;

      if (targetIdx >= 0 && targetIdx < display.length) {
        const targetId = display[targetIdx]._clientId;
        // Abrir el MontoInput de la fila destino simulando un click
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(`[data-monto-id="${targetId}"]`);
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
      const display = detalleActivo.filasDisplay.find((f) => f._clientId === clientId);
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
      toast.error("Agregue al menos una línea de detalle antes de guardar.");
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

      toast.success("Presupuesto guardado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el presupuesto.");
    } finally {
      setIsSaving(false);
    }
  });

  // ── Eliminar documento ────────────────────────────────────────────────────
  const handleEliminarPresupuesto = useCallback(async () => {
    if (!presupuestoId) return;
    try {
      await eliminarPresupuesto(presupuestoId).unwrap();
      toast.success("Presupuesto eliminado.");
      setConfirmDelete(false);
    } catch {
      toast.error("Error al eliminar el presupuesto.");
    }
  }, [presupuestoId, eliminarPresupuesto]);

  // ── Eliminar línea ────────────────────────────────────────────────────────
  const handleEliminarLinea = useCallback(
    async (clientId: string) => {
      const fila = detalleActivo.filasDisplay.find((f) => f._clientId === clientId);
      if (!fila) return;

      if (fila.isNew || !fila.id) {
        detalleActivo.eliminarFila(clientId);
        return;
      }
      detalleActivo.setPendingDelete(clientId);
    },
    [detalleActivo],
  );

  const handleConfirmEliminarLinea = useCallback(async () => {
    const clientId = detalleActivo.pendingDelete;
    if (!clientId || !presupuestoId) return;

    const fila = detalleActivo.filasDisplay.find((f) => f._clientId === clientId);
    if (!fila?.id) return;

    try {
      await eliminarLinea({ presupuestoId, detalleId: fila.id }).unwrap();
      detalleActivo.eliminarFila(clientId);
      detalleActivo.setPendingDelete(null);
      toast.success("Línea eliminada.");
    } catch {
      toast.error("Error al eliminar la línea.");
    }
  }, [detalleActivo, presupuestoId, eliminarLinea]);

  return {
    // Estado UI
    tabActivo,
    setTabActivo,
    headerCollapsed,
    setHeaderCollapsed: () => setHeaderCollapsed((p) => !p),
    searchActivo,
    setSearchActivo,
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
    loadingCuentas: tabActivo === "ingresos" ? loadingCuentasIngresos : loadingCuentasGastos,
    loadingCuentasIngresos,
    loadingCuentasGastos,
    // Detalle por tab (para render simultáneo)
    detalleIngresos,
    detalleGastos,
    // Detalle activo (para handlers)
    detalleActivo,
    discrepanciasActivoMap,
    // Búsqueda por tab
    searchIngresos,
    setSearchIngresos,
    searchGastos,
    setSearchGastos,
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
    // Mapas individuales para badges de tabs
    discrepanciasIngresosMap,
    discrepanciasGastosMap,
  };
};
