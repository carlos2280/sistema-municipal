import { z } from "zod";

export const crearPresupuestoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  ano: z.number().int().min(2000).max(2100, "Año inválido"),
  descripcion: z.string().optional(),
  estado: z.enum(["borrador", "aprobado", "cerrado"]).optional(),
});

export const actualizarPresupuestoSchema = crearPresupuestoSchema.partial();

export const agregarLineaSchema = z.object({
  cuentaId: z.number().int().positive("cuentaId inválido"),
  monto: z.number().nonnegative("El monto no puede ser negativo"),
  descripcion: z.string().optional(),
});

export const actualizarLineaSchema = agregarLineaSchema.partial();
