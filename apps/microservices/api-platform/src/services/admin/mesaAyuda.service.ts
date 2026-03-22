import { db, transversalDb } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import type {
  AgregarComentarioInput,
  AsignarTicketInput,
  CambiarCategoriaInput,
  CambiarEstadoInput,
  CambiarPrioridadInput,
  CreateCategoriaInput,
  EstadoTicket,
  TicketFilters,
  UpdateCategoriaInput,
  UpdatePrioridadInput,
} from "@/libs/schemas/mesaAyuda.schemas";
import {
  categorias,
  comentarios,
  historialEstados,
  prioridades,
  tickets,
} from "@municipal/db-mesa-ayuda";
import { municipalidades } from "@municipal/db-platform";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  lt,
  notInArray,
  sql,
} from "drizzle-orm";

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface DashboardData {
  totalTickets: number;
  abiertos: number;
  enProgreso: number;
  enEspera: number;
  vencidosSla: number;
  slaCompliance: number;
  tiempoPromedioHoras: number;
  tendencia30Dias: TendenciaDia[];
  porMunicipalidad: MunicipalidadResumen[];
  porCategoria: CategoriaResumen[];
  porPrioridad: PrioridadResumen[];
}

interface TendenciaDia {
  fecha: string;
  creados: number;
  resueltos: number;
}

interface MunicipalidadResumen {
  tenantSlug: string;
  nombre: string;
  totalTickets: number;
  abiertos: number;
  slaCompliance: number;
}

interface CategoriaResumen {
  categoria: string;
  cantidad: number;
}

interface PrioridadResumen {
  prioridad: string;
  cantidad: number;
}

export interface TicketListItem {
  id: number;
  numero: string;
  tenantId: number;
  tenantSlug: string;
  tenantNombre: string;
  titulo: string;
  estado: string;
  prioridadId: number;
  prioridadNombre: string;
  prioridadColor: string;
  prioridadCodigo: string;
  categoriaId: number;
  categoriaNombre: string;
  categoriaColor: string;
  solicitante: string;
  asignado: string | null;
  slaVencido: boolean;
  fechaLimite: string | null;
  createdAt: string;
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComentarioDetalle {
  id: number;
  autorNombre: string;
  contenido: string;
  esInterno: boolean;
  createdAt: string;
}

export interface HistorialDetalle {
  id: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivo: string | null;
  ejecutadoPor: number;
  createdAt: string;
}

export interface TicketDetail {
  id: number;
  numero: string;
  tenantId: number;
  tenantSlug: string;
  tenantNombre: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridadId: number;
  prioridadNombre: string;
  prioridadColor: string;
  prioridadCodigo: string;
  categoriaId: number;
  categoriaNombre: string;
  categoriaColor: string;
  solicitante: string;
  emailSolicitante: string | null;
  asignado: string | null;
  slaVencido: boolean;
  fechaLimite: string | null;
  fechaResolucion: string | null;
  createdAt: string;
  updatedAt: string;
  comentarios: ComentarioDetalle[];
  historial: HistorialDetalle[];
}

export interface TenantResumen {
  tenantId: number;
  tenantSlug: string;
  nombre: string;
  totalTickets: number;
  abiertos: number;
  enProgreso: number;
  resueltos: number;
  slaCompliance: number;
  activo: boolean | null;
}

export interface SlaMonitoreo {
  global: {
    totalTickets: number;
    totalVencidos: number;
    complianceGlobal: number;
    tiempoPromedioResolucionHoras: number;
  };
  porPrioridad: SlaPrioridadResumen[];
  porTenant: SlaTenantResumen[];
  ticketsVencidos: SlaTicketResumen[];
  ticketsEnRiesgo: SlaTicketResumen[];
}

interface SlaPrioridadResumen {
  prioridadCodigo: string;
  prioridadNombre: string;
  slaHoras: number;
  totalTickets: number;
  cumplidos: number;
  vencidos: number;
  compliance: number;
}

interface SlaTenantResumen {
  tenantId: number;
  tenantSlug: string;
  tenantNombre: string;
  totalTickets: number;
  compliance: number;
  vencidos: number;
}

interface SlaTicketResumen {
  ticketId: number;
  tenantSlug: string;
  tenantNombre: string;
  numero: string;
  titulo: string;
  prioridadNombre: string;
  fechaLimite: string;
  horasVencido?: number;
  horasRestantes?: number;
}

// ─── Tipo auxiliar para el mapa de municipalidades ────────────────────────────

interface MuniInfo {
  id: number;
  slug: string;
  nombre: string;
}

// ─── Constantes de transición de estados ──────────────────────────────────────

const TRANSICIONES_VALIDAS: Record<EstadoTicket, EstadoTicket[]> = {
  abierto: ["en_progreso", "en_espera", "cerrado"],
  en_progreso: ["en_espera", "resuelto", "cerrado"],
  en_espera: ["en_progreso", "resuelto", "cerrado"],
  resuelto: ["cerrado", "en_progreso"],
  cerrado: [],
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (): Promise<DashboardData> => {
  const estadosAbiertos = ["abierto", "en_progreso", "en_espera"];

  // Paso 1: todas las queries a transversalDb (solo tablas mesa_ayuda)
  const [
    statsByEstado,
    vencidosResult,
    totalResult,
    tiempoPromedioResult,
    tendenciaResult,
    porMunicipalidadRaw,
    porCategoriaResult,
    porPrioridadResult,
  ] = await Promise.all([
    transversalDb
      .select({
        estado: tickets.estado,
        cantidad: count(),
      })
      .from(tickets)
      .groupBy(tickets.estado),

    transversalDb
      .select({ cantidad: count() })
      .from(tickets)
      .where(
        and(
          lt(tickets.fechaLimite, sql`now()`),
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    transversalDb.select({ cantidad: count() }).from(tickets),

    transversalDb
      .select({
        promedioHoras: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (fecha_resolucion - created_at)) / 3600
            )::numeric(10,2),
            0
          )
        `.as("promedioHoras"),
      })
      .from(tickets)
      .where(eq(tickets.estado, "resuelto")),

    transversalDb
      .select({
        fecha: sql<string>`DATE(created_at)::text`.as("fecha"),
        creados: count(),
        resueltos: sql<number>`
          COUNT(*) FILTER (WHERE estado = 'resuelto')::int
        `.as("resueltos"),
      })
      .from(tickets)
      .where(sql`created_at >= now() - interval '30 days'`)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`),

    // Agregados por tenantId — sin JOIN a municipalidades (cross-DB no permitido)
    transversalDb
      .select({
        tenantId: tickets.tenantId,
        total: count(),
        abiertos: sql<number>`
          COUNT(*) FILTER (WHERE ${tickets.estado} = ANY(ARRAY['abierto','en_progreso','en_espera']))::int
        `.as("abiertos"),
        vencidos: sql<number>`
          COUNT(*) FILTER (
            WHERE ${tickets.fechaLimite} < now()
            AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
          )::int
        `.as("vencidos"),
      })
      .from(tickets)
      .groupBy(tickets.tenantId),

    transversalDb
      .select({
        categoriaId: tickets.categoriaId,
        nombre: categorias.nombre,
        cantidad: count(),
      })
      .from(tickets)
      .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
      .groupBy(tickets.categoriaId, categorias.nombre)
      .orderBy(desc(count())),

    transversalDb
      .select({
        prioridadId: tickets.prioridadId,
        nombre: prioridades.nombre,
        cantidad: count(),
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .groupBy(tickets.prioridadId, prioridades.nombre)
      .orderBy(desc(count())),
  ]);

  // Paso 2: enriquecer porMunicipalidad con datos de platform DB
  const tenantIds = porMunicipalidadRaw.map((r) => r.tenantId);
  const munis =
    tenantIds.length > 0
      ? await db
          .select({
            id: municipalidades.id,
            slug: municipalidades.slug,
            nombre: municipalidades.nombre,
          })
          .from(municipalidades)
          .where(inArray(municipalidades.id, tenantIds))
      : [];
  const muniMap = new Map<number, MuniInfo>(munis.map((m) => [m.id, m]));

  // Cálculos finales
  const totalTickets = totalResult[0]?.cantidad ?? 0;
  const vencidos = vencidosResult[0]?.cantidad ?? 0;

  const byEstado = Object.fromEntries(
    statsByEstado.map((r) => [r.estado, r.cantidad]),
  );

  const abiertos = byEstado.abierto ?? 0;
  const enProgreso = byEstado.en_progreso ?? 0;
  const enEspera = byEstado.en_espera ?? 0;

  const totalActivos = estadosAbiertos.reduce(
    (sum, e) => sum + (byEstado[e] ?? 0),
    0,
  );
  const slaCompliance =
    totalActivos > 0
      ? Math.round(((totalActivos - vencidos) / totalActivos) * 100)
      : 100;

  const tiempoPromedioHoras = Number(
    tiempoPromedioResult[0]?.promedioHoras ?? 0,
  );

  const tendencia30Dias: TendenciaDia[] = tendenciaResult.map((r) => ({
    fecha: r.fecha,
    creados: r.creados,
    resueltos: r.resueltos,
  }));

  const porMunicipalidad: MunicipalidadResumen[] = porMunicipalidadRaw
    .map((r) => {
      const muni = muniMap.get(r.tenantId);
      if (!muni) return null;
      const totalActiv = r.abiertos;
      const mVencidos = r.vencidos;
      const mCompliance =
        totalActiv > 0
          ? Math.round(((totalActiv - mVencidos) / totalActiv) * 100)
          : 100;
      return {
        tenantSlug: muni.slug,
        nombre: muni.nombre,
        totalTickets: r.total,
        abiertos: r.abiertos,
        slaCompliance: mCompliance,
      };
    })
    .filter((r): r is MunicipalidadResumen => r !== null);

  const porCategoria: CategoriaResumen[] = porCategoriaResult.map((r) => ({
    categoria: r.nombre,
    cantidad: r.cantidad,
  }));

  const porPrioridad: PrioridadResumen[] = porPrioridadResult.map((r) => ({
    prioridad: r.nombre,
    cantidad: r.cantidad,
  }));

  return {
    totalTickets,
    abiertos,
    enProgreso,
    enEspera,
    vencidosSla: vencidos,
    slaCompliance,
    tiempoPromedioHoras,
    tendencia30Dias,
    porMunicipalidad,
    porCategoria,
    porPrioridad,
  };
};

// ─── SLA Monitoreo ────────────────────────────────────────────────────────────

export const getSlaMonitoreo = async (): Promise<SlaMonitoreo> => {
  const now = new Date();

  // Paso 1: queries paralelas a transversalDb
  const [
    totalResult,
    vencidosResult,
    enRiesgoTickets,
    vencidosTickets,
    promedioResult,
    prioridadResult,
    tenantRaw,
  ] = await Promise.all([
    transversalDb
      .select({ cantidad: count() })
      .from(tickets)
      .where(notInArray(tickets.estado, ["resuelto", "cerrado"])),

    transversalDb
      .select({ cantidad: count() })
      .from(tickets)
      .where(
        and(
          lt(tickets.fechaLimite, sql`now()`),
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    // Tickets en riesgo (vencen en las próximas 4 horas)
    transversalDb
      .select({
        id: tickets.id,
        tenantId: tickets.tenantId,
        numero: tickets.numero,
        titulo: tickets.titulo,
        fechaLimite: tickets.fechaLimite,
        prioridadNombre: prioridades.nombre,
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .where(
        and(
          sql`${tickets.fechaLimite} BETWEEN now() AND now() + interval '4 hours'`,
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    // Tickets vencidos
    transversalDb
      .select({
        id: tickets.id,
        tenantId: tickets.tenantId,
        numero: tickets.numero,
        titulo: tickets.titulo,
        fechaLimite: tickets.fechaLimite,
        prioridadNombre: prioridades.nombre,
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .where(
        and(
          lt(tickets.fechaLimite, sql`now()`),
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    transversalDb
      .select({
        promedio: sql<number>`
          COALESCE(AVG(EXTRACT(EPOCH FROM (fecha_resolucion - created_at)) / 3600)::numeric(10,2), 0)
        `.as("promedio"),
      })
      .from(tickets)
      .where(eq(tickets.estado, "resuelto")),

    transversalDb
      .select({
        prioridadId: tickets.prioridadId,
        codigo: prioridades.codigo,
        nombre: prioridades.nombre,
        slaHoras: prioridades.slaHoras,
        total: count(),
        vencidos: sql<number>`
          COUNT(*) FILTER (
            WHERE ${tickets.fechaLimite} < now()
            AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
          )::int
        `.as("vencidos"),
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .groupBy(
        tickets.prioridadId,
        prioridades.codigo,
        prioridades.nombre,
        prioridades.slaHoras,
        prioridades.nivel,
      )
      .orderBy(prioridades.nivel),

    transversalDb
      .select({
        tenantId: tickets.tenantId,
        total: count(),
        vencidos: sql<number>`
          COUNT(*) FILTER (
            WHERE ${tickets.fechaLimite} < now()
            AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
          )::int
        `.as("vencidos"),
      })
      .from(tickets)
      .groupBy(tickets.tenantId),
  ]);

  // Paso 2: enriquecer con municipalidades de platform DB
  const allTenantIds = [
    ...new Set([
      ...tenantRaw.map((r) => r.tenantId),
      ...vencidosTickets.map((t) => t.tenantId),
      ...enRiesgoTickets.map((t) => t.tenantId),
    ]),
  ];
  const munis =
    allTenantIds.length > 0
      ? await db
          .select({
            id: municipalidades.id,
            slug: municipalidades.slug,
            nombre: municipalidades.nombre,
          })
          .from(municipalidades)
          .where(inArray(municipalidades.id, allTenantIds))
      : [];
  const muniMap = new Map<number, MuniInfo>(munis.map((m) => [m.id, m]));

  const totalTickets = totalResult[0]?.cantidad ?? 0;
  const totalVencidos = vencidosResult[0]?.cantidad ?? 0;
  const complianceGlobal =
    totalTickets > 0
      ? Math.round(((totalTickets - totalVencidos) / totalTickets) * 100)
      : 100;

  const porPrioridad: SlaPrioridadResumen[] = prioridadResult.map((r) => {
    const total = r.total;
    const venc = r.vencidos;
    return {
      prioridadCodigo: r.codigo,
      prioridadNombre: r.nombre,
      slaHoras: r.slaHoras ?? 0,
      totalTickets: total,
      cumplidos: total - venc,
      vencidos: venc,
      compliance:
        total > 0 ? Math.round(((total - venc) / total) * 100) : 100,
    };
  });

  const porTenant: SlaTenantResumen[] = tenantRaw
    .map((r) => {
      const muni = muniMap.get(r.tenantId);
      if (!muni) return null;
      const total = r.total;
      const venc = r.vencidos;
      return {
        tenantId: r.tenantId,
        tenantSlug: muni.slug,
        tenantNombre: muni.nombre,
        totalTickets: total,
        vencidos: venc,
        compliance:
          total > 0 ? Math.round(((total - venc) / total) * 100) : 100,
      };
    })
    .filter((r): r is SlaTenantResumen => r !== null);

  const ticketsVencidosRes: SlaTicketResumen[] = vencidosTickets.map((t) => {
    const muni = muniMap.get(t.tenantId);
    const horasVencido = t.fechaLimite
      ? Math.round(
          (now.getTime() - new Date(t.fechaLimite).getTime()) / 3600000,
        )
      : 0;
    return {
      ticketId: t.id,
      tenantSlug: muni?.slug ?? "",
      tenantNombre: muni?.nombre ?? "",
      numero: t.numero,
      titulo: t.titulo,
      prioridadNombre: t.prioridadNombre,
      fechaLimite: t.fechaLimite?.toISOString() ?? "",
      horasVencido,
    };
  });

  const ticketsEnRiesgoRes: SlaTicketResumen[] = enRiesgoTickets.map((t) => {
    const muni = muniMap.get(t.tenantId);
    const horasRestantes = t.fechaLimite
      ? Math.round(
          (new Date(t.fechaLimite).getTime() - now.getTime()) / 3600000,
        )
      : 0;
    return {
      ticketId: t.id,
      tenantSlug: muni?.slug ?? "",
      tenantNombre: muni?.nombre ?? "",
      numero: t.numero,
      titulo: t.titulo,
      prioridadNombre: t.prioridadNombre,
      fechaLimite: t.fechaLimite?.toISOString() ?? "",
      horasRestantes,
    };
  });

  return {
    global: {
      totalTickets,
      totalVencidos,
      complianceGlobal,
      tiempoPromedioResolucionHoras: Number(promedioResult[0]?.promedio ?? 0),
    },
    porPrioridad,
    porTenant,
    ticketsVencidos: ticketsVencidosRes,
    ticketsEnRiesgo: ticketsEnRiesgoRes,
  };
};

// ─── Tickets — lectura ────────────────────────────────────────────────────────

export const getTickets = async (
  filters: TicketFilters,
): Promise<TicketListResponse> => {
  const { page, pageSize, sortBy, sortOrder } = filters;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  // Lookup de tenantSlug → tenantId en platform DB
  let tenantIdFilter: number | undefined;
  if (filters.tenantSlug) {
    const [muni] = await db
      .select({ id: municipalidades.id })
      .from(municipalidades)
      .where(eq(municipalidades.slug, filters.tenantSlug));
    if (!muni) {
      return { tickets: [], total: 0, page, pageSize };
    }
    tenantIdFilter = muni.id;
    conditions.push(eq(tickets.tenantId, muni.id));
  }

  if (filters.estado) {
    conditions.push(eq(tickets.estado, filters.estado));
  }

  // Lookup de prioridad/categoria en transversalDb
  if (filters.prioridad) {
    const [prio] = await transversalDb
      .select({ id: prioridades.id })
      .from(prioridades)
      .where(eq(prioridades.codigo, filters.prioridad));
    if (prio) conditions.push(eq(tickets.prioridadId, prio.id));
  }

  if (filters.categoria) {
    const [cat] = await transversalDb
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.codigo, filters.categoria));
    if (cat) conditions.push(eq(tickets.categoriaId, cat.id));
  }

  if (filters.search) {
    conditions.push(
      sql`(
        ${tickets.titulo} ILIKE ${`%${filters.search}%`}
        OR ${tickets.numero} ILIKE ${`%${filters.search}%`}
        OR ${tickets.solicitanteNombre} ILIKE ${`%${filters.search}%`}
      )`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderColumn = (() => {
    switch (sortBy) {
      case "updatedAt":
        return tickets.updatedAt;
      case "estado":
        return tickets.estado;
      case "prioridad":
        return tickets.prioridadId;
      case "fechaLimite":
        return tickets.fechaLimite;
      default:
        return tickets.createdAt;
    }
  })();

  const orderFn = sortOrder === "asc" ? asc : desc;

  // Paso 1: queries a transversalDb (tickets con sus relaciones internas)
  const [rows, countResult] = await Promise.all([
    transversalDb
      .select({
        id: tickets.id,
        numero: tickets.numero,
        tenantId: tickets.tenantId,
        titulo: tickets.titulo,
        estado: tickets.estado,
        prioridadId: tickets.prioridadId,
        prioridadNombre: prioridades.nombre,
        prioridadColor: prioridades.color,
        prioridadCodigo: prioridades.codigo,
        categoriaId: tickets.categoriaId,
        categoriaNombre: categorias.nombre,
        categoriaColor: categorias.color,
        solicitante: tickets.solicitanteNombre,
        asignado: tickets.asignadoNombre,
        fechaLimite: tickets.fechaLimite,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
      .where(whereClause)
      .orderBy(orderFn(orderColumn))
      .limit(pageSize)
      .offset(offset),

    transversalDb
      .select({ total: count() })
      .from(tickets)
      .where(whereClause),
  ]);

  // Paso 2: enriquecer con municipalidades desde platform DB
  const tenantIdsEnPagina = [...new Set(rows.map((r) => r.tenantId))];
  const munis =
    tenantIdsEnPagina.length > 0
      ? await db
          .select({
            id: municipalidades.id,
            slug: municipalidades.slug,
            nombre: municipalidades.nombre,
          })
          .from(municipalidades)
          .where(inArray(municipalidades.id, tenantIdsEnPagina))
      : [];
  const muniMap = new Map<number, MuniInfo>(munis.map((m) => [m.id, m]));

  // Paso 3: combinar
  const now = new Date();
  const items: TicketListItem[] = rows.map((r) => {
    const muni = muniMap.get(r.tenantId);
    return {
      id: r.id,
      numero: r.numero,
      tenantId: r.tenantId,
      tenantSlug: muni?.slug ?? String(r.tenantId),
      tenantNombre: muni?.nombre ?? String(r.tenantId),
      titulo: r.titulo,
      estado: r.estado,
      prioridadId: r.prioridadId,
      prioridadNombre: r.prioridadNombre,
      prioridadColor: r.prioridadColor,
      prioridadCodigo: r.prioridadCodigo,
      categoriaId: r.categoriaId,
      categoriaNombre: r.categoriaNombre,
      categoriaColor: r.categoriaColor,
      solicitante: r.solicitante,
      asignado: r.asignado,
      slaVencido:
        r.fechaLimite !== null &&
        r.fechaLimite < now &&
        !["resuelto", "cerrado"].includes(r.estado),
      fechaLimite: r.fechaLimite?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  });

  // Si se filtró por tenant y no hubo resultados del filtro tenantIdFilter,
  // el total ya no incluye el JOIN a municipalidades — es correcto.
  void tenantIdFilter;

  return {
    tickets: items,
    total: countResult[0]?.total ?? 0,
    page,
    pageSize,
  };
};

export const getTicketDetail = async (
  tenantSlug: string,
  ticketId: number,
): Promise<TicketDetail> => {
  // Paso 1: buscar municipalidad en platform DB
  const [muni] = await db
    .select({
      id: municipalidades.id,
      slug: municipalidades.slug,
      nombre: municipalidades.nombre,
    })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!muni) throw new AppError(`Tenant '${tenantSlug}' no encontrado`, 404);

  // Paso 2: buscar ticket con sus relaciones en transversalDb
  const [ticket] = await transversalDb
    .select({
      id: tickets.id,
      numero: tickets.numero,
      titulo: tickets.titulo,
      descripcion: tickets.descripcion,
      estado: tickets.estado,
      prioridadId: tickets.prioridadId,
      prioridadNombre: prioridades.nombre,
      prioridadColor: prioridades.color,
      prioridadCodigo: prioridades.codigo,
      categoriaId: tickets.categoriaId,
      categoriaNombre: categorias.nombre,
      categoriaColor: categorias.color,
      solicitante: tickets.solicitanteNombre,
      emailSolicitante: tickets.solicitanteEmail,
      asignado: tickets.asignadoNombre,
      fechaLimite: tickets.fechaLimite,
      fechaResolucion: tickets.fechaResolucion,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
    .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, muni.id)));

  if (!ticket) throw new AppError("Ticket no encontrado", 404);

  // Paso 3: comentarios e historial en transversalDb
  const [comsRows, histRows] = await Promise.all([
    transversalDb
      .select()
      .from(comentarios)
      .where(eq(comentarios.ticketId, ticketId))
      .orderBy(asc(comentarios.createdAt)),

    transversalDb
      .select()
      .from(historialEstados)
      .where(eq(historialEstados.ticketId, ticketId))
      .orderBy(asc(historialEstados.createdAt)),
  ]);

  const now = new Date();
  const slaVencido =
    ticket.fechaLimite !== null &&
    ticket.fechaLimite < now &&
    !["resuelto", "cerrado"].includes(ticket.estado);

  return {
    id: ticket.id,
    numero: ticket.numero,
    tenantId: muni.id,
    tenantSlug: muni.slug,
    tenantNombre: muni.nombre,
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    estado: ticket.estado,
    prioridadId: ticket.prioridadId,
    prioridadNombre: ticket.prioridadNombre,
    prioridadColor: ticket.prioridadColor,
    prioridadCodigo: ticket.prioridadCodigo,
    categoriaId: ticket.categoriaId,
    categoriaNombre: ticket.categoriaNombre,
    categoriaColor: ticket.categoriaColor,
    solicitante: ticket.solicitante,
    emailSolicitante: ticket.emailSolicitante,
    asignado: ticket.asignado,
    slaVencido,
    fechaLimite: ticket.fechaLimite?.toISOString() ?? null,
    fechaResolucion: ticket.fechaResolucion?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    comentarios: comsRows.map((c) => ({
      id: c.id,
      autorNombre: c.autorNombre,
      contenido: c.contenido,
      esInterno: c.esInterno,
      createdAt: c.createdAt.toISOString(),
    })),
    historial: histRows.map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      motivo: h.motivo,
      ejecutadoPor: h.ejecutadoPor,
      createdAt: h.createdAt.toISOString(),
    })),
  };
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function resolveTicketConTenant(
  tenantSlug: string,
  ticketId: number,
): Promise<{ ticket: typeof tickets.$inferSelect; tenantId: number }> {
  // municipalidades vive en platform DB
  const [muni] = await db
    .select({ id: municipalidades.id })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!muni) throw new AppError(`Tenant '${tenantSlug}' no encontrado`, 404);

  // ticket vive en transversal DB
  const [ticket] = await transversalDb
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, muni.id)));

  if (!ticket) throw new AppError("Ticket no encontrado", 404);

  return { ticket, tenantId: muni.id };
}

// ─── Tickets — gestión operativa ─────────────────────────────────────────────

export const cambiarEstado = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarEstadoInput,
  ejecutadoPor: number,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  const estadoActual = ticket.estado as EstadoTicket;
  const estadoNuevo = input.estado;

  if (estadoActual === "cerrado") {
    throw new AppError(
      "El ticket está cerrado y no puede cambiar de estado",
      400,
    );
  }

  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];
  if (!transicionesPermitidas.includes(estadoNuevo)) {
    throw new AppError(
      `Transición inválida: '${estadoActual}' → '${estadoNuevo}'. Permitidas: ${transicionesPermitidas.join(", ")}`,
      400,
    );
  }

  const ahora = new Date();
  const updates: Partial<typeof tickets.$inferInsert> = {
    estado: estadoNuevo,
    updatedAt: ahora,
  };

  if (estadoNuevo === "resuelto") {
    updates.fechaResolucion = ahora;
  }

  // Reapertura: limpiar fecha_resolucion
  if (estadoActual === "resuelto" && estadoNuevo === "en_progreso") {
    updates.fechaResolucion = null;
  }

  await transversalDb.transaction(async (tx) => {
    await tx.update(tickets).set(updates).where(eq(tickets.id, ticketId));

    await tx.insert(historialEstados).values({
      ticketId,
      estadoAnterior: estadoActual,
      estadoNuevo,
      motivo: input.motivo,
      ejecutadoPor,
    });
  });
};

export const asignarTicket = async (
  tenantSlug: string,
  ticketId: number,
  input: AsignarTicketInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError("No se puede asignar un ticket cerrado", 400);
  }

  await transversalDb
    .update(tickets)
    .set({
      asignadoId: input.asignadoId,
      asignadoNombre: input.asignadoNombre,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));
};

export const cambiarPrioridad = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarPrioridadInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError(
      "No se puede cambiar la prioridad de un ticket cerrado",
      400,
    );
  }

  const [prio] = await transversalDb
    .select()
    .from(prioridades)
    .where(eq(prioridades.id, input.prioridadId));

  if (!prio) throw new AppError("Prioridad no encontrada", 404);

  const updates: Partial<typeof tickets.$inferInsert> = {
    prioridadId: input.prioridadId,
    updatedAt: new Date(),
  };

  if (input.recalcularSla && prio.slaHoras) {
    const nuevaFechaLimite = new Date(ticket.createdAt);
    nuevaFechaLimite.setHours(nuevaFechaLimite.getHours() + prio.slaHoras);
    updates.fechaLimite = nuevaFechaLimite;
  }

  await transversalDb
    .update(tickets)
    .set(updates)
    .where(eq(tickets.id, ticketId));
};

export const cambiarCategoria = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarCategoriaInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError(
      "No se puede cambiar la categoría de un ticket cerrado",
      400,
    );
  }

  const [cat] = await transversalDb
    .select({ id: categorias.id })
    .from(categorias)
    .where(
      and(eq(categorias.id, input.categoriaId), eq(categorias.activo, true)),
    );

  if (!cat) throw new AppError("Categoría no encontrada o inactiva", 404);

  await transversalDb
    .update(tickets)
    .set({ categoriaId: input.categoriaId, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));
};

export const agregarComentario = async (
  tenantSlug: string,
  ticketId: number,
  input: AgregarComentarioInput,
  autorId: number,
  autorNombre: string,
): Promise<ComentarioDetalle> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError("No se puede comentar en un ticket cerrado", 400);
  }

  const [nuevo] = await transversalDb
    .insert(comentarios)
    .values({
      ticketId,
      autorId,
      autorNombre,
      contenido: input.contenido,
      esInterno: input.esInterno,
    })
    .returning();

  await transversalDb
    .update(tickets)
    .set({ updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  return {
    id: nuevo.id,
    autorNombre: nuevo.autorNombre,
    contenido: nuevo.contenido,
    esInterno: nuevo.esInterno,
    createdAt: nuevo.createdAt.toISOString(),
  };
};

// ─── Tenants resumen ──────────────────────────────────────────────────────────

export const getTenantsSummary = async (): Promise<TenantResumen[]> => {
  // Paso 1: agregados por tenantId en transversalDb
  const rows = await transversalDb
    .select({
      tenantId: tickets.tenantId,
      total: count(),
      abiertos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} = 'abierto')::int`.as(
          "abiertos",
        ),
      enProgreso:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} = 'en_progreso')::int`.as(
          "enProgreso",
        ),
      resueltos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} IN ('resuelto', 'cerrado'))::int`.as(
          "resueltos",
        ),
      vencidos: sql<number>`
        COUNT(*) FILTER (
          WHERE ${tickets.fechaLimite} < now()
          AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
        )::int
      `.as("vencidos"),
      activos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} NOT IN ('resuelto', 'cerrado'))::int`.as(
          "activos",
        ),
    })
    .from(tickets)
    .groupBy(tickets.tenantId);

  // Paso 2: enriquecer con datos de platform DB
  const tenantIds = rows.map((r) => r.tenantId);
  const munis =
    tenantIds.length > 0
      ? await db
          .select({
            id: municipalidades.id,
            slug: municipalidades.slug,
            nombre: municipalidades.nombre,
            activo: municipalidades.activo,
          })
          .from(municipalidades)
          .where(inArray(municipalidades.id, tenantIds))
      : [];
  const muniMap = new Map(
    munis.map((m) => [m.id, m]),
  );

  // Paso 3: combinar
  return rows
    .map((r) => {
      const muni = muniMap.get(r.tenantId);
      if (!muni) return null;
      const totalActiv = r.activos;
      const venc = r.vencidos;
      const slaCompliance =
        totalActiv > 0
          ? Math.round(((totalActiv - venc) / totalActiv) * 100)
          : 100;
      return {
        tenantId: r.tenantId,
        tenantSlug: muni.slug,
        nombre: muni.nombre,
        totalTickets: r.total,
        abiertos: r.abiertos,
        enProgreso: r.enProgreso,
        resueltos: r.resueltos,
        slaCompliance,
        activo: muni.activo,
      };
    })
    .filter((r): r is TenantResumen => r !== null);
};

// ─── Categorías ───────────────────────────────────────────────────────────────

export const getCategorias = async () => {
  return transversalDb
    .select()
    .from(categorias)
    .orderBy(asc(categorias.orden), asc(categorias.nombre));
};

export const createCategoria = async (input: CreateCategoriaInput) => {
  const [existing] = await transversalDb
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.codigo, input.codigo));

  if (existing) {
    throw new AppError(
      `Ya existe una categoría con el código '${input.codigo}'`,
      400,
    );
  }

  const [nueva] = await transversalDb
    .insert(categorias)
    .values(input)
    .returning();
  return nueva;
};

export const updateCategoria = async (
  id: number,
  input: UpdateCategoriaInput,
) => {
  const [existing] = await transversalDb
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) throw new AppError("Categoría no encontrada", 404);

  const [updated] = await transversalDb
    .update(categorias)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(categorias.id, id))
    .returning();

  return updated;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  const [existing] = await transversalDb
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) throw new AppError("Categoría no encontrada", 404);

  // Verificar si hay tickets usando esta categoría
  const [usage] = await transversalDb
    .select({ cantidad: count() })
    .from(tickets)
    .where(
      and(
        eq(tickets.categoriaId, id),
        inArray(tickets.estado, ["abierto", "en_progreso", "en_espera"]),
      ),
    );

  if ((usage?.cantidad ?? 0) > 0) {
    throw new AppError(
      "No se puede eliminar la categoría: tiene tickets activos asociados",
      400,
    );
  }

  // Soft delete
  await transversalDb
    .update(categorias)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(categorias.id, id));
};

// ─── Prioridades ──────────────────────────────────────────────────────────────

export const getPrioridades = async () => {
  return transversalDb
    .select()
    .from(prioridades)
    .orderBy(asc(prioridades.nivel));
};

export const updatePrioridad = async (
  id: number,
  input: UpdatePrioridadInput,
) => {
  const [existing] = await transversalDb
    .select({ id: prioridades.id })
    .from(prioridades)
    .where(eq(prioridades.id, id));

  if (!existing) throw new AppError("Prioridad no encontrada", 404);

  const updateData: Partial<typeof prioridades.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.nombre !== undefined) updateData.nombre = input.nombre;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.slaHoras !== undefined) updateData.slaHoras = input.slaHoras;

  const [updated] = await transversalDb
    .update(prioridades)
    .set(updateData)
    .where(eq(prioridades.id, id))
    .returning();

  return updated;
};
