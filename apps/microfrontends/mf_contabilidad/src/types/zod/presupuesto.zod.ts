import { z } from "zod";

export const schemaPresupuestoHeader = z.object({
  anoContable: z
    .number({ required_error: "El año contable es requerido" })
    .int()
    .min(2000)
    .max(2100),
  glosa: z
    .string({ required_error: "La glosa es requerida" })
    .min(1, "La glosa es requerida")
    .max(255, "Máximo 255 caracteres"),
  actaDecreto: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
});

export type SchemaPresupuestoHeader = z.infer<typeof schemaPresupuestoHeader>;

export const schemaLinea = z.object({
  cuentaId: z
    .number({ required_error: "Seleccione una cuenta" })
    .int()
    .positive("Seleccione una cuenta"),
  centroCostoId: z.number().int().positive().nullable().optional(),
  montoAnual: z
    .number({ required_error: "El monto es requerido" })
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser mayor a 0"),
  observacion: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
});

export type SchemaLinea = z.infer<typeof schemaLinea>;
