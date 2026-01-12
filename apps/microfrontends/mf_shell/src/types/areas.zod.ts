import * as z from 'zod';

export const schemaAreas = z.object({
  id: z.number(),
  nombre: z.string().min(1),
});

export type TSchemaAreas = z.infer<typeof schemaAreas>;
