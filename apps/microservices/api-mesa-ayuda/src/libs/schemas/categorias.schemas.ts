import { z } from "zod";

export const crearCategoriaSchema = z.object({
  codigo: z.string().min(2).max(50),
  nombre: z.string().min(2).max(100),
  descripcion: z.string().nullable().optional(),
  icono: z.string().default("tag"),
  color: z.string().default("primary"),
  orden: z.number().int().default(0),
});

export const actualizarCategoriaSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  descripcion: z.string().nullable().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
  orden: z.number().int().optional(),
  activo: z.boolean().optional(),
});

export type CrearCategoriaInput = z.infer<typeof crearCategoriaSchema>;
export type ActualizarCategoriaInput = z.infer<typeof actualizarCategoriaSchema>;
