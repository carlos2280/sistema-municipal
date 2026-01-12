import * as z from 'zod';

export const schemaCredenciales = z
  .object({
    correo: z
      .string()
      .email({ message: 'Este no es un correo electrónico válido.' }),
    contrasena: z
      .string()
      .min(4, { message: 'Debe tener al menos 4 caracteres' }),
    areaId: z.number().optional(),
    sistemaId: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if ('areaId' in data && (data.areaId === undefined || data.areaId < 1)) {
      ctx.addIssue({
        path: ['areaId'],
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar un área',
      });
    }
    if (
      'sistemaId' in data &&
      (data.sistemaId === undefined || data.sistemaId < 1)
    ) {
      ctx.addIssue({
        path: ['sistemaId'],
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar un sistema',
      });
    }
  });

export type TSchemaCredenciales = z.infer<typeof schemaCredenciales>;
