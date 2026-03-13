import { z } from "zod";

export const areasSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "Contraseña requerida"),
});

export const sistemasSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "Contraseña requerida"),
  areaId: z.coerce.number().int().positive("areaId debe ser un número positivo"),
});

export const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "Contraseña requerida"),
  areaId: z.coerce.number().int().positive("areaId inválido"),
  sistemaId: z.coerce.number().int().positive("sistemaId inválido"),
  tenantSlug: z.string().min(1, "tenantSlug requerido"),
  mfaCode: z.string().optional(),
});

export const cambiarSistemaSchema = z.object({
  sistemaId: z.coerce.number().int().positive("sistemaId inválido"),
});

export const mfaSetupIniciarSchema = z.object({
  setupToken: z.string().min(1, "setupToken requerido"),
});

export const mfaSetupActivarSchema = z.object({
  setupToken: z.string().min(1, "setupToken requerido"),
  code: z.string().regex(/^\d{6}$/, "El código MFA debe ser de 6 dígitos"),
});

export const cambiarContrasenaTemporalSchema = z.object({
  contrasenaTemporal: z.string().min(1, "Contraseña temporal requerida"),
  contrasenaNueva: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

export const mfaPolicySchema = z.object({
  mfaPolicy: z.enum(["required", "optional", "disabled"], {
    errorMap: () => ({ message: "mfaPolicy debe ser 'required', 'optional' o 'disabled'" }),
  }),
});
