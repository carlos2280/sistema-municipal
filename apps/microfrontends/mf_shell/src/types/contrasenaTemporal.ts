import * as z from 'zod';
export const schemaFormContrasenaTemporal = z.object({
  correo: z
    .string()
    .email({ message: 'Este no es un correo electrónico válido.' }),
  contrasenaTemporal: z
    .string()
    .min(4, { message: 'Debe tener al menos 4 caracteres' }),
  contrasenaNueva: z
    .string()
    .min(4, { message: 'Debe tener al menos 4 caracteres' }),
});

export type TSchemaFormContrasenaTemporal = z.infer<
  typeof schemaFormContrasenaTemporal
>;
