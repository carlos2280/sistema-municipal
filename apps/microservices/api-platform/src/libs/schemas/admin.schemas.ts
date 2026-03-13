import { z } from "zod";

export const createTenantSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido").regex(/^[a-z0-9-]+$/, "Slug solo puede contener letras minúsculas, números y guiones"),
  dominioBase: z.string().min(1, "Dominio base requerido"),
  rut: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  emailContacto: z.string().email("Email de contacto inválido").optional(),
  maxUsuarios: z.number().int().positive().optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const createSubscriptionSchema = z.object({
  tenantId: z.coerce.number().int().positive("tenantId inválido"),
  moduloId: z.coerce.number().int().positive("moduloId inválido"),
  activadoPor: z.string().min(1, "activadoPor requerido"),
  estado: z.enum(["activa", "trial", "suspendida", "cancelada"]).optional(),
  fechaFin: z.string().datetime({ offset: true }).optional(),
  precioMensual: z.number().nonnegative().optional(),
  notas: z.string().optional(),
});

export const updateSubscriptionEstadoSchema = z.object({
  estado: z.enum(["activa", "trial", "suspendida", "cancelada"], {
    errorMap: () => ({ message: "estado debe ser 'activa', 'trial', 'suspendida' o 'cancelada'" }),
  }),
  ejecutadoPor: z.string().min(1, "ejecutadoPor requerido"),
  motivo: z.string().optional(),
});
