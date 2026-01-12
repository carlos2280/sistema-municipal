import * as z from 'zod';

// 1) El objeto base sin efectos
const baseObject = z.object({
  id: z.number().int().positive().optional(),
  anoContable: z
    .number()
    .int()
    .gte(1000, { message: 'Debe ser un año de 4 dígitos' })
    .lte(9999, { message: 'Debe ser un año de 4 dígitos' }),
  tipoCuentaId: z.number().int().positive(),
  subgrupoId: z.number().int().positive().optional(),
  parentId: z.number().optional().nullable(),
  contraCuenta: z.string().optional(),
  valorPadre: z.string().min(1, { message: 'El código es obligatorio' }),
  nombre: z
    .string({ message: 'El nombre cuenta es obligatorio.' })
    .min(1, { message: 'El nombre cuenta es obligatorio.' }),
  codigo: z.string(),
});

// Ayuda tipada para el refine de 'codigo'
type Base = z.infer<typeof baseObject>;

// 2) Función reutilizable para añadir la validación de longitud de 'codigo'
/**
 * Agrega una validación personalizada a `codigo` según `tipoCuentaId`.
 * - tipoCuentaId 3 o 4 → código debe tener 2 dígitos numéricos
 * - tipoCuentaId 5, 6 o 7 → código debe tener 3 dígitos numéricos
 */
/**
 * Valida la longitud exacta del código según tipoCuentaId
 */
export function withCodigoLength<
  T extends { tipoCuentaId: number; codigo: string },
>(schema: z.ZodType<T>) {
  return schema.superRefine((data: T, ctx) => {
    const { tipoCuentaId, codigo } = data;

    const expectedLength =
      tipoCuentaId === 3 || tipoCuentaId === 4
        ? 2
        : [5, 6, 7].includes(tipoCuentaId)
          ? 3
          : 0;

    if (expectedLength > 0) {
      const re = new RegExp(`^\\d{${expectedLength}}$`);
      if (!re.test(codigo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['codigo'],
          // message: `el código debe tener exactamente ${expectedLength} dígitos numéricos.`,
          message: 'el código es obligatorio.',
        });
      }
    }
  });
}

// 3) CREATE: omitimos 'id', validamos parentId≠subgrupoId, y luego añadimos la longitud de 'codigo'
export const schemaPlanesCuentasCreate = withCodigoLength(baseObject);

// 4) UPDATE: hacemos todo opcional, reponemos 'id' obligatorio, y luego la longitud
export const schemaPlanesCuentasUpdate = withCodigoLength(
  baseObject.partial().extend({
    id: z.number().int().positive(),
  }) as z.ZodType<Base>, // indicamos que vuelve a tener la forma de Base
);

// 5) DELETE: sólo 'id'
export const schemaPlanesCuentasDelete = z.object({
  id: z.number().int().positive(),
});

// 6) Inferimos tipos TS
export type TSchemaPlanesCuentasBase = Base;
export type TSchemaPlanesCuentasCreate = z.infer<
  typeof schemaPlanesCuentasCreate
>;
export type TSchemaPlanesCuentasUpdate = z.infer<
  typeof schemaPlanesCuentasUpdate
>;
export type TSchemaPlanesCuentasDelete = z.infer<
  typeof schemaPlanesCuentasDelete
>;
