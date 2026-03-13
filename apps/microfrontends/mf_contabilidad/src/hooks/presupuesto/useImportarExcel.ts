import { startTransition, useCallback, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { read, utils } from "xlsx";
import type { CuentaPresupuestaria, FilaDetalle } from "../../types/presupuesto.types";

/** Yield al event loop para no bloquear la UI */
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

/** Estructura de una fila parseada del Excel */
interface ExcelRow {
  nivel: number;
  subtitulo: string;
  item: string;
  asignacion: string;
  subasignacion: string;
  subsubasignacion: string;
  denominacion: string;
  monto: number; // en M$ (miles de pesos)
}

/**
 * Construye el código clasificador presupuestario a partir de los campos del Excel.
 * El largo depende del nivel jerárquico:
 *   Nivel 1: {prefijo}{ST:2}           → 5 chars (ej: 11503)
 *   Nivel 2: +{IT:2}                   → 7 chars (ej: 1150301)
 *   Nivel 3: +{ASG:3}                  → 10 chars (ej: 1150301001)
 *   Nivel 4: +{SASG:3}                 → 13 chars (ej: 1150301001001)
 *   Nivel 5: +{SSASG:3}               → 16 chars (ej: 1150301001001001)
 */
function buildCodigo(prefijo: string, row: ExcelRow): string {
  const st = row.subtitulo.padStart(2, "0");
  let code = `${prefijo}${st}`;
  if (row.nivel >= 2) code += row.item.padStart(2, "0");
  if (row.nivel >= 3) code += row.asignacion.padStart(3, "0");
  if (row.nivel >= 4) code += row.subasignacion.padStart(3, "0");
  if (row.nivel >= 5) code += row.subsubasignacion.padStart(3, "0");
  return code;
}

/**
 * Determina el nivel jerárquico a partir de cuál columna de clasificación tiene valor.
 * Col 1=subtítulo(nivel 1), Col 2=item(nivel 2), Col 3=asig(nivel 3),
 * Col 4=subasig(nivel 4), Col 5=subsubasig(nivel 5).
 */
function inferNivel(row: unknown[]): number {
  // El nivel más profundo con valor define el nivel de la fila
  if (row[5] != null && String(row[5]).trim()) return 5;
  if (row[4] != null && String(row[4]).trim()) return 4;
  if (row[3] != null && String(row[3]).trim()) return 3;
  if (row[2] != null && String(row[2]).trim()) return 2;
  if (row[1] != null && String(row[1]).trim()) return 1;
  return 0;
}

/**
 * Parsea una hoja del Excel de presupuesto municipal.
 * Detecta el encabezado buscando "SUBTITULO", "SUB TIT" o "DENOMINACION".
 * Columna 0 puede ser "N"/"No"/"S"/"Si" o numérica — el nivel se infiere
 * de qué columnas de clasificación tienen valor.
 */
function parseSheet(sheetData: unknown[][]): ExcelRow[] {
  const rows: ExcelRow[] = [];

  // Buscar fila de encabezado (acepta variantes: SUBTITULO, SUB TIT, DENOMINACION)
  let headerRow = -1;
  for (let i = 0; i < Math.min(20, sheetData.length); i++) {
    const row = sheetData[i];
    if (!row) continue;
    const headerText = row.map((c) => String(c ?? "").toUpperCase()).join("|");
    if (
      headerText.includes("SUBTITULO") ||
      headerText.includes("SUB TIT") ||
      (headerText.includes("DENOMINACION") && headerText.includes("ITEM"))
    ) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) {
    throw new Error("No se encontró el encabezado en la hoja");
  }

  // Parsear filas de datos (después del encabezado)
  // Propagar clasificación hacia abajo (el Excel solo muestra el valor en la primera fila del grupo)
  let lastSt = "", lastIt = "", lastAsg = "", lastSasg = "";

  for (let i = headerRow + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length < 7) continue;

    const denominacion = String(row[6] ?? "").trim();
    if (!denominacion) continue;

    const nivel = inferNivel(row);
    if (nivel === 0) continue;

    // Leer clasificadores de esta fila
    const st = String(row[1] ?? "").trim();
    const it = String(row[2] ?? "").trim();
    const asg = String(row[3] ?? "").trim();
    const sasg = String(row[4] ?? "").trim();
    const ssasg = String(row[5] ?? "").trim();

    // Propagar clasificadores desde filas anteriores
    if (st) lastSt = st;
    if (it) lastIt = it;
    if (asg) lastAsg = asg;
    if (sasg) lastSasg = sasg;

    const monto = Number(row[7]) || 0;

    rows.push({
      nivel,
      subtitulo: lastSt,
      item: nivel >= 2 ? lastIt : "00",
      asignacion: nivel >= 3 ? lastAsg : "000",
      subasignacion: nivel >= 4 ? lastSasg : "000",
      subsubasignacion: nivel >= 5 ? ssasg || "000" : "000",
      denominacion,
      monto,
    });
  }

  return rows;
}

/**
 * Convierte filas del Excel en FilaDetalle[] mapeadas a cuentas existentes.
 * Montos en M$ se convierten a pesos (×1000).
 */
function excelRowsToFilas(
  excelRows: ExcelRow[],
  cuentas: CuentaPresupuestaria[],
  prefijo: string,
): { filas: FilaDetalle[]; noEncontradas: string[] } {
  const cuentaMap = new Map(cuentas.map((c) => [c.codigo, c]));
  const filas: FilaDetalle[] = [];
  const noEncontradas: string[] = [];

  for (const row of excelRows) {
    const codigo = buildCodigo(prefijo, row);
    const cuenta = cuentaMap.get(codigo);

    if (!cuenta) {
      noEncontradas.push(`${codigo} - ${row.denominacion}`);
      continue;
    }

    filas.push({
      _clientId: uuid(),
      cuentaId: cuenta.id,
      cuenta,
      centroCostoId: null,
      centroCosto: null,
      montoAnual: Math.round(row.monto * 1000), // M$ → pesos
      isNew: true,
      isDirty: true,
    });
  }

  return { filas, noEncontradas };
}

/**
 * Hook para importar presupuesto desde Excel.
 * Encapsula: file picker, parseo xlsx, mapeo a FilaDetalle[].
 */
export const useImportarExcel = (
  cuentasIngresos: CuentaPresupuestaria[],
  cuentasGastos: CuentaPresupuestaria[],
  importarFilasIngresos: (filas: FilaDetalle[]) => void,
  importarFilasGastos: (filas: FilaDetalle[]) => void,
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImportar = useCallback(() => {
    // Validar que las cuentas estén cargadas antes de abrir el file picker
    if (cuentasIngresos.length === 0 && cuentasGastos.length === 0) {
      toast.error("Las cuentas presupuestarias aún no se han cargado. Espere un momento e intente de nuevo.");
      return;
    }

    // Crear input file dinámico
    if (!inputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls";
      input.style.display = "none";
      document.body.appendChild(input);
      inputRef.current = input;
    }

    const input = inputRef.current;

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      input.value = ""; // reset para permitir re-importar el mismo archivo

      const toastId = toast.loading("Leyendo archivo Excel...");

      try {
        const buffer = await file.arrayBuffer();

        // Yield para que el toast se muestre antes del parseo pesado
        await yieldToMain();

        toast.loading("Parseando datos del archivo...", { id: toastId });
        const wb = read(buffer, { type: "array" });

        // Buscar hojas por nombre parcial
        const hojaIngresos = wb.SheetNames.find((n) =>
          n.toLowerCase().includes("ingreso"),
        );
        const hojaGastos = wb.SheetNames.find(
          (n) => n.toLowerCase().includes("gasto") && !n.toLowerCase().includes("(3)"),
        );

        let totalImportados = 0;
        let totalNoEncontradas: string[] = [];

        // Importar ingresos
        if (hojaIngresos) {
          toast.loading("Procesando ingresos...", { id: toastId });
          await yieldToMain();

          const sheet = wb.Sheets[hojaIngresos];
          const data = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
          const excelRows = parseSheet(data);
          const { filas, noEncontradas } = excelRowsToFilas(excelRows, cuentasIngresos, "115");

          if (filas.length > 0) {
            startTransition(() => importarFilasIngresos(filas));
            totalImportados += filas.length;
          }
          totalNoEncontradas = [...totalNoEncontradas, ...noEncontradas];
        } else {
          toast.warning("No se encontró la hoja de Ingresos en el archivo.");
        }

        await yieldToMain();

        // Importar gastos
        if (hojaGastos) {
          toast.loading("Procesando gastos...", { id: toastId });
          await yieldToMain();

          const sheet = wb.Sheets[hojaGastos];
          const data = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
          const excelRows = parseSheet(data);
          const { filas, noEncontradas } = excelRowsToFilas(excelRows, cuentasGastos, "215");

          if (filas.length > 0) {
            startTransition(() => importarFilasGastos(filas));
            totalImportados += filas.length;
          }
          totalNoEncontradas = [...totalNoEncontradas, ...noEncontradas];
        } else {
          toast.warning("No se encontró la hoja de Gastos en el archivo.");
        }

        // Feedback
        toast.dismiss(toastId);

        if (totalImportados > 0) {
          toast.success(`${totalImportados} líneas importadas desde Excel.`);
        } else {
          toast.warning("No se encontraron líneas para importar.");
        }

        if (totalNoEncontradas.length > 0) {
          console.warn("Cuentas no encontradas en el plan de cuentas:", totalNoEncontradas);
          toast.warning(
            `${totalNoEncontradas.length} cuenta(s) del Excel no coinciden con el plan de cuentas. Ver consola para detalles.`,
            { duration: 8000 },
          );
        }
      } catch (err) {
        toast.dismiss(toastId);
        console.error("Error al importar Excel:", err);
        toast.error(
          err instanceof Error ? err.message : "Error al leer el archivo Excel.",
        );
      }
    };

    input.click();
  }, [cuentasIngresos, cuentasGastos, importarFilasIngresos, importarFilasGastos]);

  return { handleImportar };
};
