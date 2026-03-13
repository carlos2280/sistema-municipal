import { db } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import {
  modulos,
  municipalidades,
  suscripcionHistorial,
  suscripciones,
} from "@municipal/db-platform";
import { eq } from "drizzle-orm";
import { invalidateTenantCache } from "./cacheInvalidation.service";

type EstadoSuscripcion = "activa" | "trial" | "suspendida" | "cancelada";

export interface CreateSubscriptionInput {
  tenantId: number;
  moduloId: number;
  estado?: EstadoSuscripcion;
  fechaFin?: Date;
  precioMensual?: string;
  notas?: string;
  activadoPor: string;
}

export interface UpdateEstadoInput {
  estado: EstadoSuscripcion;
  motivo?: string;
  ejecutadoPor: string;
}

function mapEstadoToAccion(estado: EstadoSuscripcion): string {
  const map: Record<EstadoSuscripcion, string> = {
    activa: "reactivada",
    trial: "trial_iniciado",
    suspendida: "suspendida",
    cancelada: "cancelada",
  };
  return map[estado];
}

export const listSubscriptions = async (tenantId: number) => {
  return db
    .select({
      id: suscripciones.id,
      estado: suscripciones.estado,
      fechaInicio: suscripciones.fechaInicio,
      fechaFin: suscripciones.fechaFin,
      precioMensual: suscripciones.precioMensual,
      notas: suscripciones.notas,
      activadoPor: suscripciones.activadoPor,
      createdAt: suscripciones.createdAt,
      modulo: {
        id: modulos.id,
        codigo: modulos.codigo,
        nombre: modulos.nombre,
      },
    })
    .from(suscripciones)
    .innerJoin(modulos, eq(modulos.id, suscripciones.moduloId))
    .where(eq(suscripciones.municipalidadId, tenantId));
};

export const createSubscription = async (input: CreateSubscriptionInput) => {
  // Validate tenant
  const [tenant] = await db
    .select({ id: municipalidades.id, slug: municipalidades.slug })
    .from(municipalidades)
    .where(eq(municipalidades.id, input.tenantId));

  if (!tenant) throw new AppError("Municipalidad no encontrada", 404);

  // Validate module
  const [modulo] = await db
    .select({ id: modulos.id })
    .from(modulos)
    .where(eq(modulos.id, input.moduloId));

  if (!modulo) throw new AppError("Módulo no encontrado", 404);

  const estado = input.estado ?? "activa";

  const [subscription] = await db.transaction(async (tx) => {
    const [susc] = await tx
      .insert(suscripciones)
      .values({
        municipalidadId: input.tenantId,
        moduloId: input.moduloId,
        estado,
        fechaFin: input.fechaFin,
        precioMensual: input.precioMensual,
        notas: input.notas,
        activadoPor: input.activadoPor,
      })
      .returning();

    await tx.insert(suscripcionHistorial).values({
      suscripcionId: susc.id,
      accion: "activada",
      estadoAnterior: null,
      estadoNuevo: estado,
      motivo: "Activación inicial via Admin API",
      ejecutadoPor: input.activadoPor,
      metadata: { moduloId: input.moduloId, tenantId: input.tenantId },
    });

    return [susc];
  });

  await invalidateTenantCache(tenant.slug);

  return subscription;
};

export const updateSubscriptionEstado = async (
  subscriptionId: number,
  input: UpdateEstadoInput,
) => {
  // Get current state
  const [current] = await db
    .select({
      id: suscripciones.id,
      estado: suscripciones.estado,
      municipalidadId: suscripciones.municipalidadId,
    })
    .from(suscripciones)
    .where(eq(suscripciones.id, subscriptionId));

  if (!current) throw new AppError("Suscripción no encontrada", 404);

  if (current.estado === input.estado) {
    throw new AppError(
      `La suscripción ya está en estado "${input.estado}"`,
      409,
    );
  }

  // Get tenant slug for cache invalidation
  const [tenant] = await db
    .select({ slug: municipalidades.slug })
    .from(municipalidades)
    .where(eq(municipalidades.id, current.municipalidadId));

  const [updated] = await db.transaction(async (tx) => {
    const [susc] = await tx
      .update(suscripciones)
      .set({ estado: input.estado, updatedAt: new Date() })
      .where(eq(suscripciones.id, subscriptionId))
      .returning();

    await tx.insert(suscripcionHistorial).values({
      suscripcionId: subscriptionId,
      accion: mapEstadoToAccion(input.estado),
      estadoAnterior: current.estado,
      estadoNuevo: input.estado,
      motivo: input.motivo ?? null,
      ejecutadoPor: input.ejecutadoPor,
    });

    return [susc];
  });

  if (tenant) {
    await invalidateTenantCache(tenant.slug);
  }

  return updated;
};
