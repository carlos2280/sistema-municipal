import { departamentos, direcciones, oficinas } from "@municipal/db-identidad";
import type { DbExecutor } from "../../types/db";

/**
 * Crea la estructura organizacional minima requerida para el usuario admin.
 * Idempotente: retorna el ID de la primera oficina si ya existe.
 *
 * Estructura: Direccion General → Departamento Admin → Oficina Administracion
 *
 * @returns idOficina - ID de la oficina base para asignar al usuario admin
 */
export async function seedOficinaBase(db: DbExecutor): Promise<number> {
  process.stdout.write("  seedOficinaBase: verificando estructura base...\n");

  // Verificar si ya existe una oficina (idempotente)
  const [existente] = await db
    .select({ id: oficinas.id })
    .from(oficinas);

  if (existente) {
    process.stdout.write(`  seedOficinaBase: ya existe oficina id=${existente.id}, reutilizando\n`);
    return existente.id;
  }

  // Crear cadena minima: direccion → departamento → oficina
  const [direccion] = await db
    .insert(direcciones)
    .values({ nombre: "Direccion General", responsable: "Administrador" })
    .returning({ id: direcciones.id });

  const [departamento] = await db
    .insert(departamentos)
    .values({ nombreDepartamento: "Administracion", responsable: "Administrador", idDireccion: direccion.id })
    .returning({ id: departamentos.id });

  const [oficina] = await db
    .insert(oficinas)
    .values({ nombreOficina: "Oficina Administracion", responsable: "Administrador", idDepartamento: departamento.id })
    .returning({ id: oficinas.id });

  process.stdout.write(`  seedOficinaBase: estructura base creada (idOficina=${oficina.id})\n`);

  return oficina.id;
}
