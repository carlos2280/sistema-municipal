import { eq } from "drizzle-orm";
import { menus, sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "../../types/db";

/**
 * Menus del sistema Mesa de Ayuda.
 * Idempotente: verifica existencia por sistemaId antes de insertar.
 */
export async function seedMenusMesaAyuda(db: DbExecutor): Promise<void> {
  process.stdout.write("  seedMenusMesaAyuda: verificando sistema...\n");

  const [sistema] = await db
    .select({ id: sistemas.id })
    .from(sistemas)
    .where(eq(sistemas.codigo, "mesa_ayuda"));

  if (!sistema) {
    process.stdout.write("  seedMenusMesaAyuda: sistema 'mesa_ayuda' no existe, saltando\n");
    return;
  }

  const sistemaId = sistema.id;

  const existentes = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.idSistema, sistemaId));

  if (existentes.length > 0) {
    process.stdout.write(`  seedMenusMesaAyuda: ya existen ${existentes.length} menus, saltando\n`);
    return;
  }

  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: null, nombre: "Bandeja de Tickets", icono: "inbox", componente: "bandeja_tickets", visible: true, nivel: 1, orden: 1 },
    { idSistema: sistemaId, idPadre: null, nombre: "Nuevo Ticket", icono: "plus-circle", componente: "nuevo_ticket", visible: true, nivel: 1, orden: 2 },
    { idSistema: sistemaId, idPadre: null, nombre: "Categorias", icono: "tag", componente: "categorias", visible: true, nivel: 1, orden: 3 },
  ]);

  process.stdout.write("  seedMenusMesaAyuda: menus insertados correctamente\n");
}
