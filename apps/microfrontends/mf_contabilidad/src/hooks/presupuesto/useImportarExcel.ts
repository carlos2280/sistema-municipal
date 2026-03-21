import { startTransition, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { read, utils } from 'xlsx';
import type {
  CuentaPresupuestaria,
  FilaDetalle,
  SubprogramaItem,
} from '@/types/presupuesto.types';

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
  const st = row.subtitulo.padStart(2, '0');
  let code = `${prefijo}${st}`;
  if (row.nivel >= 2) code += row.item.padStart(2, '0');
  if (row.nivel >= 3) code += row.asignacion.padStart(3, '0');
  if (row.nivel >= 4) code += row.subasignacion.padStart(3, '0');
  if (row.nivel >= 5) code += row.subsubasignacion.padStart(3, '0');
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
    const headerText = row.map((c) => String(c ?? '').toUpperCase()).join('|');
    if (
      headerText.includes('SUBTITULO') ||
      headerText.includes('SUB TIT') ||
      (headerText.includes('DENOMINACION') && headerText.includes('ITEM'))
    ) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) {
    throw new Error('No se encontró el encabezado en la hoja');
  }

  // Parsear filas de datos (después del encabezado)
  // Propagar clasificación hacia abajo (el Excel solo muestra el valor en la primera fila del grupo)
  let lastSt = '';
  let lastIt = '';
  let lastAsg = '';
  let lastSasg = '';

  for (let i = headerRow + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length < 7) continue;

    const denominacion = String(row[6] ?? '').trim();
    if (!denominacion) continue;

    const nivel = inferNivel(row);
    if (nivel === 0) continue;

    // Leer clasificadores de esta fila
    const st = String(row[1] ?? '').trim();
    const it = String(row[2] ?? '').trim();
    const asg = String(row[3] ?? '').trim();
    const sasg = String(row[4] ?? '').trim();
    const ssasg = String(row[5] ?? '').trim();

    // Propagar clasificadores desde filas anteriores
    if (st) lastSt = st;
    if (it) lastIt = it;
    if (asg) lastAsg = asg;
    if (sasg) lastSasg = sasg;

    const monto = Number(row[7]) || 0;

    rows.push({
      nivel,
      subtitulo: lastSt,
      item: nivel >= 2 ? lastIt : '00',
      asignacion: nivel >= 3 ? lastAsg : '000',
      subasignacion: nivel >= 4 ? lastSasg : '000',
      subsubasignacion: nivel >= 5 ? ssasg || '000' : '000',
      denominacion,
      monto,
    });
  }

  return rows;
}

// ─── Mapeo de headers Excel → códigos de subprograma ────────────────────────

const AREA_HEADER_MAP: Array<{ pattern: RegExp; codigo: string }> = [
  { pattern: /gesti[oó]n/i, codigo: 'GESTION' },
  { pattern: /serv(?:icios)?[\s._]*com(?:unitarios)?/i, codigo: 'SERV_COM' },
  { pattern: /act(?:ividades)?[\s._]*mun(?:icipales)?/i, codigo: 'ACT_MUN' },
  { pattern: /prog(?:ramas)?[\s._]*soc(?:iales)?/i, codigo: 'PROG_SOC' },
  { pattern: /prog(?:ramas)?[\s._]*dep(?:ortivos)?/i, codigo: 'PROG_DEP' },
  { pattern: /prog(?:ramas)?[\s._]*cul(?:turales)?/i, codigo: 'PROG_CUL' },
];

/** Detecta columnas de áreas en el header del Excel */
function detectAreaColumns(
  headerRow: unknown[],
): Array<{ colIdx: number; codigo: string }> {
  const areas: Array<{ colIdx: number; codigo: string }> = [];
  for (let col = 7; col < headerRow.length; col++) {
    const header = String(headerRow[col] ?? '').trim();
    if (!header) continue;
    for (const { pattern, codigo } of AREA_HEADER_MAP) {
      if (pattern.test(header)) {
        areas.push({ colIdx: col, codigo });
        break;
      }
    }
  }
  return areas;
}

/** Parsea una hoja de gastos con columnas de áreas */
function parseSheetConAreas(
  sheetData: unknown[][],
  subprogramas: SubprogramaItem[],
): {
  excelRows: ExcelRow[];
  areaMontos: Map<number, Map<number, number>>; // rowIndex → Map<subprogramaId, monto M$>
} {
  const excelRows = parseSheet(sheetData);

  // Find header row to detect area columns
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(20, sheetData.length); i++) {
    const row = sheetData[i];
    if (!row) continue;
    const headerText = row.map((c) => String(c ?? '').toUpperCase()).join('|');
    if (
      headerText.includes('SUBTITULO') ||
      headerText.includes('SUB TIT') ||
      (headerText.includes('DENOMINACION') && headerText.includes('ITEM'))
    ) {
      headerRowIdx = i;
      break;
    }
  }

  const areaMontos = new Map<number, Map<number, number>>();
  if (headerRowIdx === -1) return { excelRows, areaMontos };

  const areaCols = detectAreaColumns(sheetData[headerRowIdx]);
  if (areaCols.length === 0) return { excelRows, areaMontos };

  // Map código → subprogramaId
  const codigoToId = new Map(subprogramas.map((s) => [s.codigo, s.id]));

  // Parse area montos for each data row
  let dataRowIdx = 0;
  for (let i = headerRowIdx + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length < 7) continue;

    const denominacion = String(row[6] ?? '').trim();
    if (!denominacion) continue;

    const nivel = inferNivel(row);
    if (nivel === 0) continue;

    // This data row corresponds to excelRows[dataRowIdx]
    if (dataRowIdx >= excelRows.length) break;

    const dist = new Map<number, number>();
    for (const { colIdx, codigo } of areaCols) {
      const monto = Number(row[colIdx]) || 0;
      if (monto <= 0) continue;
      const subId = codigoToId.get(codigo);
      if (subId) dist.set(subId, monto); // Still in M$ at this point
    }

    if (dist.size > 0) {
      areaMontos.set(dataRowIdx, dist);
    }
    dataRowIdx++;
  }

  return { excelRows, areaMontos };
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

/** Convierte filas Excel con áreas en FilaDetalle[] + distribuciones */
function excelRowsConAreasToFilas(
  excelRows: ExcelRow[],
  areaMontos: Map<number, Map<number, number>>,
  cuentas: CuentaPresupuestaria[],
  prefijo: string,
): {
  filas: FilaDetalle[];
  distribuciones: Map<string, Map<number, number>>;
  noEncontradas: string[];
} {
  const cuentaMap = new Map(cuentas.map((c) => [c.codigo, c]));
  const filas: FilaDetalle[] = [];
  const distribuciones = new Map<string, Map<number, number>>();
  const noEncontradas: string[] = [];

  for (let i = 0; i < excelRows.length; i++) {
    const row = excelRows[i];
    const codigo = buildCodigo(prefijo, row);
    const cuenta = cuentaMap.get(codigo);

    if (!cuenta) {
      noEncontradas.push(`${codigo} - ${row.denominacion}`);
      continue;
    }

    const clientId = uuid();
    const areaDist = areaMontos.get(i);

    // Convert area montos from M$ to pesos
    const distPesos = new Map<number, number>();
    if (areaDist) {
      for (const [subId, montoMiles] of areaDist) {
        distPesos.set(subId, Math.round(montoMiles * 1000));
      }
    }

    const totalFromAreas = distPesos.size > 0
      ? [...distPesos.values()].reduce((a, b) => a + b, 0)
      : Math.round(row.monto * 1000);

    filas.push({
      _clientId: clientId,
      cuentaId: cuenta.id,
      cuenta,
      centroCostoId: null,
      centroCosto: null,
      montoAnual: totalFromAreas,
      isNew: true,
      isDirty: true,
    });

    if (distPesos.size > 0) {
      distribuciones.set(clientId, distPesos);
    }
  }

  return { filas, distribuciones, noEncontradas };
}

/**
 * Hook para importar presupuesto desde Excel.
 * Encapsula: file picker, parseo xlsx, mapeo a FilaDetalle[].
 */
export const useImportarExcel = (
  cuentasIngresos: CuentaPresupuestaria[],
  cuentasGastos: CuentaPresupuestaria[],
  importarFilasIngresos: (filas: FilaDetalle[]) => void,
  importarFilasGastos: (filas: FilaDetalle[], distribuciones?: Map<string, Map<number, number>>) => void,
  subprogramas: SubprogramaItem[] = [],
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImportar = useCallback(() => {
    // Validar que las cuentas estén cargadas antes de abrir el file picker
    if (cuentasIngresos.length === 0 && cuentasGastos.length === 0) {
      toast.error(
        'Las cuentas presupuestarias aún no se han cargado. Espere un momento e intente de nuevo.',
      );
      return;
    }

    // Crear input file dinámico
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.style.display = 'none';
      document.body.appendChild(input);
      inputRef.current = input;
    }

    const input = inputRef.current;

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      input.value = ''; // reset para permitir re-importar el mismo archivo

      const toastId = toast.loading('Leyendo archivo Excel...');

      try {
        const buffer = await file.arrayBuffer();

        // Yield para que el toast se muestre antes del parseo pesado
        await yieldToMain();

        toast.loading('Parseando datos del archivo...', { id: toastId });
        const wb = read(buffer, { type: 'array' });

        // Buscar hojas por nombre parcial
        const hojaIngresos = wb.SheetNames.find((n) =>
          n.toLowerCase().includes('ingreso'),
        );
        const hojaGastos = wb.SheetNames.find(
          (n) =>
            n.toLowerCase().includes('gasto') &&
            !n.toLowerCase().includes('(3)'),
        );

        let totalImportados = 0;
        let totalNoEncontradas: string[] = [];

        // Importar ingresos
        if (hojaIngresos) {
          toast.loading('Procesando ingresos...', { id: toastId });
          await yieldToMain();

          const sheet = wb.Sheets[hojaIngresos];
          const data = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
          const excelRows = parseSheet(data);
          const { filas, noEncontradas } = excelRowsToFilas(
            excelRows,
            cuentasIngresos,
            '115',
          );

          if (filas.length > 0) {
            startTransition(() => importarFilasIngresos(filas));
            totalImportados += filas.length;
          }
          totalNoEncontradas = [...totalNoEncontradas, ...noEncontradas];
        } else {
          toast.warning('No se encontró la hoja de Ingresos en el archivo.');
        }

        await yieldToMain();

        // Importar gastos (con detección de columnas de áreas)
        if (hojaGastos) {
          toast.loading('Procesando gastos...', { id: toastId });
          await yieldToMain();

          const sheet = wb.Sheets[hojaGastos];
          const data = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

          if (subprogramas.length > 0) {
            // Parseo con áreas
            const { excelRows, areaMontos } = parseSheetConAreas(data, subprogramas);
            const { filas, distribuciones, noEncontradas } = excelRowsConAreasToFilas(
              excelRows,
              areaMontos,
              cuentasGastos,
              '215',
            );

            if (filas.length > 0) {
              startTransition(() => importarFilasGastos(filas, distribuciones));
              totalImportados += filas.length;
            }
            totalNoEncontradas = [...totalNoEncontradas, ...noEncontradas];
          } else {
            // Parseo sin áreas (fallback)
            const excelRows = parseSheet(data);
            const { filas, noEncontradas } = excelRowsToFilas(
              excelRows,
              cuentasGastos,
              '215',
            );

            if (filas.length > 0) {
              startTransition(() => importarFilasGastos(filas));
              totalImportados += filas.length;
            }
            totalNoEncontradas = [...totalNoEncontradas, ...noEncontradas];
          }
        } else {
          toast.warning('No se encontró la hoja de Gastos en el archivo.');
        }

        // Feedback
        toast.dismiss(toastId);

        if (totalImportados > 0) {
          toast.success(`${totalImportados} líneas importadas desde Excel.`);
        } else {
          toast.warning('No se encontraron líneas para importar.');
        }

        if (totalNoEncontradas.length > 0) {
          toast.warning(
            `${totalNoEncontradas.length} cuenta(s) del Excel no coinciden con el plan de cuentas.`,
            { duration: 8000 },
          );
        }
      } catch (err) {
        toast.dismiss(toastId);
        toast.error(
          err instanceof Error
            ? err.message
            : 'Error al leer el archivo Excel.',
        );
      }
    };

    input.click();
  }, [
    cuentasIngresos,
    cuentasGastos,
    importarFilasIngresos,
    importarFilasGastos,
    subprogramas,
  ]);

  return { handleImportar };
};
