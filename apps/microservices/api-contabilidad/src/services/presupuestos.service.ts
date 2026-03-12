import type { DbClient } from "@/db/client";
import {
  centrosCosto,
  type NewPresupuesto,
  type NewPresupuestoDetalle,
  planesCuentas,
  presupuestos,
  presupuestosDetalle,
} from "@/db/schemas";
import { and, eq, like, sql } from "drizzle-orm";

// ─── Tipos de respuesta enriquecidos ────────────────────────────────────────

export interface DetalleConCuenta {
  id: number;
  presupuestoId: number;
  cuentaId: number;
  centroCostoId: number | null;
  montoAnual: number;
  observacion: string | null;
  createdAt: Date;
  updatedAt: Date;
  cuenta: {
    id: number;
    codigo: string;
    nombre: string;
    tipoCuentaId: number;
    parentId: number | null;
    subgrupoId: number;
  };
  centroCosto: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
}

export interface EquilibrioResult {
  totalIngresos: number;
  totalGastos: number;
  diferencia: number;
  discrepancias: DiscrepanciaItem[];
}

export interface DiscrepanciaItem {
  cuentaPadreId: number;
  codigoPadre: string;
  nombrePadre: string;
  montoPadre: number;
  sumaHijos: number;
  delta: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Siguiente número correlativo de presupuesto para un año dado */
const siguienteNumero = async (db: DbClient, anoContable: number): Promise<number> => {
  const [{ max }] = await db
    .select({ max: sql<number>`COALESCE(MAX(numero), 0)` })
    .from(presupuestos)
    .where(eq(presupuestos.anoContable, anoContable));
  return max + 1;
};

// ─── CRUD Presupuestos ────────────────────────────────────────────────────────

export const listarPresupuestos = async (db: DbClient, ano?: number) => {
  const query = db.select().from(presupuestos);
  if (ano) {
    return query.where(eq(presupuestos.anoContable, ano)).orderBy(presupuestos.anoContable);
  }
  return query.orderBy(presupuestos.anoContable);
};

export const obtenerPresupuestoPorId = async (db: DbClient, id: number) => {
  const [row] = await db.select().from(presupuestos).where(eq(presupuestos.id, id));
  return row ?? null;
};

export const obtenerPresupuestoConDetalle = async (
  db: DbClient,
  id: number,
): Promise<{ presupuesto: typeof presupuestos.$inferSelect | null; detalle: DetalleConCuenta[] }> => {
  const [presupuesto] = await db
    .select()
    .from(presupuestos)
    .where(eq(presupuestos.id, id));

  if (!presupuesto) return { presupuesto: null, detalle: [] };

  // Join con planes_cuentas y centros_costo
  const rows = await db
    .select({
      id: presupuestosDetalle.id,
      presupuestoId: presupuestosDetalle.presupuestoId,
      cuentaId: presupuestosDetalle.cuentaId,
      centroCostoId: presupuestosDetalle.centroCostoId,
      montoAnual: presupuestosDetalle.montoAnual,
      observacion: presupuestosDetalle.observacion,
      createdAt: presupuestosDetalle.createdAt,
      updatedAt: presupuestosDetalle.updatedAt,
      cuenta: {
        id: planesCuentas.id,
        codigo: planesCuentas.codigo,
        nombre: planesCuentas.nombre,
        tipoCuentaId: planesCuentas.tipoCuentaId,
        parentId: planesCuentas.parentId,
        subgrupoId: planesCuentas.subgrupoId,
      },
      centroCosto: {
        id: centrosCosto.id,
        codigo: centrosCosto.codigo,
        nombre: centrosCosto.nombre,
      },
    })
    .from(presupuestosDetalle)
    .innerJoin(planesCuentas, eq(presupuestosDetalle.cuentaId, planesCuentas.id))
    .leftJoin(centrosCosto, eq(presupuestosDetalle.centroCostoId, centrosCosto.id))
    .where(eq(presupuestosDetalle.presupuestoId, id))
    .orderBy(planesCuentas.codigo);

  // Limpiar null de leftJoin en centroCosto
  const detalle: DetalleConCuenta[] = rows.map((r) => ({
    ...r,
    centroCosto: r.centroCosto.id ? r.centroCosto as DetalleConCuenta["centroCosto"] : null,
  }));

  return { presupuesto, detalle };
};

export const crearPresupuesto = async (
  db: DbClient,
  data: Omit<NewPresupuesto, "numero">,
) => {
  const numero = await siguienteNumero(db, data.anoContable);
  const [inserted] = await db
    .insert(presupuestos)
    .values({ ...data, numero })
    .returning();
  return inserted;
};

export const actualizarPresupuesto = async (
  db: DbClient,
  id: number,
  updates: Partial<{ glosa: string; actaDecreto: string; usuarioModificacion: number }>,
) => {
  const [row] = await db
    .update(presupuestos)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(presupuestos.id, id))
    .returning();
  return row ?? null;
};

export const eliminarPresupuesto = async (db: DbClient, id: number) => {
  // ON DELETE CASCADE en detalle → se elimina automáticamente
  await db.delete(presupuestos).where(eq(presupuestos.id, id));
};

// ─── CRUD Detalle ─────────────────────────────────────────────────────────────

export const agregarLinea = async (
  db: DbClient,
  presupuestoId: number,
  data: Omit<NewPresupuestoDetalle, "presupuestoId">,
) => {
  const [inserted] = await db
    .insert(presupuestosDetalle)
    .values({ ...data, presupuestoId })
    .returning();
  return inserted;
};

export const actualizarLinea = async (
  db: DbClient,
  presupuestoId: number,
  detalleId: number,
  updates: Partial<{ montoAnual: number; centroCostoId: number | null; observacion: string }>,
) => {
  const [row] = await db
    .update(presupuestosDetalle)
    .set({ ...updates, updatedAt: new Date() })
    .where(
      and(
        eq(presupuestosDetalle.id, detalleId),
        eq(presupuestosDetalle.presupuestoId, presupuestoId),
      ),
    )
    .returning();
  return row ?? null;
};

export const eliminarLinea = async (
  db: DbClient,
  presupuestoId: number,
  detalleId: number,
) => {
  await db
    .delete(presupuestosDetalle)
    .where(
      and(
        eq(presupuestosDetalle.id, detalleId),
        eq(presupuestosDetalle.presupuestoId, presupuestoId),
      ),
    );
};

// ─── Equilibrio y Discrepancias ───────────────────────────────────────────────

export const calcularEquilibrio = async (
  db: DbClient,
  presupuestoId: number,
): Promise<EquilibrioResult> => {
  // Totales por tipo de cuenta (115xx = ingresos, 215xx = gastos)
  const rows = await db
    .select({
      codigo: planesCuentas.codigo,
      parentId: planesCuentas.parentId,
      cuentaId: presupuestosDetalle.cuentaId,
      montoAnual: presupuestosDetalle.montoAnual,
    })
    .from(presupuestosDetalle)
    .innerJoin(planesCuentas, eq(presupuestosDetalle.cuentaId, planesCuentas.id))
    .where(eq(presupuestosDetalle.presupuestoId, presupuestoId));

  let totalIngresos = 0;
  let totalGastos = 0;

  // Mapa cuentaId → { codigo, parentId, monto }
  const montoMap = new Map<number, { codigo: string; parentId: number | null; monto: number; nombre?: string }>();

  for (const row of rows) {
    const isIngreso = row.codigo.startsWith("115");
    const isGasto = row.codigo.startsWith("215");

    // Solo sumar cuentas raíz (parentId = null) para evitar doble conteo
    if (!row.parentId) {
      if (isIngreso) totalIngresos += row.montoAnual;
      if (isGasto) totalGastos += row.montoAnual;
    }

    montoMap.set(row.cuentaId, {
      codigo: row.codigo,
      parentId: row.parentId,
      monto: row.montoAnual,
    });
  }

  // Detectar discrepancias: para cada cuenta padre, comparar con suma de hijos
  const parentIds = new Set<number>();
  for (const [, v] of montoMap) {
    if (v.parentId !== null && montoMap.has(v.parentId)) {
      parentIds.add(v.parentId);
    }
  }

  const discrepancias: DiscrepanciaItem[] = [];

  // Obtener nombres de cuentas padre para enriquecer la respuesta
  if (parentIds.size > 0) {
    const padresIds = Array.from(parentIds);
    const cuentasPadre = await db
      .select({ id: planesCuentas.id, codigo: planesCuentas.codigo, nombre: planesCuentas.nombre })
      .from(planesCuentas)
      .where(sql`${planesCuentas.id} = ANY(${sql.raw(`ARRAY[${padresIds.join(",")}]`)})`);

    const nombreMap = new Map(cuentasPadre.map((c) => [c.id, c]));

    for (const padreId of parentIds) {
      const padre = montoMap.get(padreId);
      if (!padre) continue;

      const sumaHijos = Array.from(montoMap.values())
        .filter((v) => v.parentId === padreId)
        .reduce((sum, v) => sum + v.monto, 0);

      const delta = sumaHijos - padre.monto;

      if (delta !== 0) {
        const info = nombreMap.get(padreId);
        discrepancias.push({
          cuentaPadreId: padreId,
          codigoPadre: padre.codigo,
          nombrePadre: info?.nombre ?? "",
          montoPadre: padre.monto,
          sumaHijos,
          delta,
        });
      }
    }
  }

  return {
    totalIngresos,
    totalGastos,
    diferencia: totalIngresos - totalGastos,
    discrepancias,
  };
};

// ─── Cuentas Presupuestarias ──────────────────────────────────────────────────

export const listarCuentasPresupuestarias = async (
  db: DbClient,
  tipo: "ingreso" | "gasto",
  prefijoPadre?: string,
  anoContable?: number,
) => {
  const prefijo = tipo === "ingreso" ? "115" : "215";
  const filtro = prefijoPadre ? `${prefijoPadre}%` : `${prefijo}%`;

  const query = db
    .select({
      id: planesCuentas.id,
      codigo: planesCuentas.codigo,
      nombre: planesCuentas.nombre,
      tipoCuentaId: planesCuentas.tipoCuentaId,
      parentId: planesCuentas.parentId,
      subgrupoId: planesCuentas.subgrupoId,
    })
    .from(planesCuentas)
    .where(
      anoContable
        ? and(
            like(planesCuentas.codigo, filtro),
            eq(planesCuentas.anoContable, anoContable),
          )
        : like(planesCuentas.codigo, filtro),
    )
    .orderBy(planesCuentas.codigo);

  return query;
};
