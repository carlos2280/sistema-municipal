import { z } from "zod";

export const createUsuarioSchema = z.object({
  nombreCompleto: z.string().min(1, "Nombre completo requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  idOficina: z.number().int().positive("idOficina inválido"),
  activo: z.boolean().optional(),
  passwordTemp: z.boolean().optional(),
});

export const updateUsuarioSchema = createUsuarioSchema.partial();
