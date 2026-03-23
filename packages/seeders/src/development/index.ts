import type { DbExecutor } from "../types/db";
import { seedDirecciones } from "../direcciones.seeder";
import { seedDepartamentos } from "../departamentos.seeder";
import { seedOficinas } from "../oficinas.seeder";
import { seedUsuarios } from "../usuarios.seeder";
import { seedPerfiles } from "../perfiles.seeder";
import { seedAreas } from "../areas.seeder";
import { seedPerfilAreaUsuario } from "../perfilAreaUsuario.seeder";
import { seedSistemaPerfil } from "../sistemaPerfil.seeder";

/**
 * Seed de datos mock para desarrollo y staging.
 * NUNCA ejecutar en produccion.
 *
 * Incluye: estructura organizacional ficticia, usuarios de prueba,
 * perfiles y asignaciones de ejemplo.
 */
export async function seedDevelopment(tenantDb: DbExecutor): Promise<void> {
  process.stdout.write("\n--- Seed development: datos mock ---\n");

  await seedDirecciones(tenantDb);
  await seedDepartamentos(tenantDb);
  await seedOficinas(tenantDb);
  await seedUsuarios(tenantDb);
  await seedPerfiles(tenantDb);
  await seedAreas(tenantDb);
  await seedPerfilAreaUsuario(tenantDb);
  await seedSistemaPerfil(tenantDb);

  process.stdout.write("--- Seed development completado ---\n");
}
