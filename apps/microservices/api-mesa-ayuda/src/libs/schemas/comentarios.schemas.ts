import { z } from "zod";

export const crearComentarioSchema = z.object({
  contenido: z.string().min(1, "El comentario no puede estar vacio"),
  esInterno: z.boolean().default(false),
});

export type CrearComentarioInput = z.infer<typeof crearComentarioSchema>;
