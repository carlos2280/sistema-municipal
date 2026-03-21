import { menus, sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "../types/db";

/**
 * Seed del sistema "Mesa de Ayuda" con su estructura de menu.
 *
 * Estructura:
 *   Mesa de Ayuda
 *   ├── Bandeja de Tickets    (bandeja_tickets)
 *   ├── Nuevo Ticket          (nuevo_ticket)
 *   └── Categorias            (categorias)
 */
export async function seedMesaAyudaSistemas(db: DbExecutor) {
  console.log("🌱 Insertando sistema Mesa de Ayuda...");

  const [sistema] = await db
    .insert(sistemas)
    .values({
      nombre: "Mesa de Ayuda",
      icono: "headphones",
    })
    .returning({ id: sistemas.id });

  const sistemaId = sistema.id;

  await db.insert(menus).values([
    {
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Bandeja de Tickets",
      icono: "inbox",
      componente: "bandeja_tickets",
      visible: true,
      nivel: 1,
      orden: 1,
    },
    {
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Nuevo Ticket",
      icono: "plus-circle",
      componente: "nuevo_ticket",
      visible: true,
      nivel: 1,
      orden: 2,
    },
    {
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Categorias",
      icono: "tag",
      componente: "categorias",
      visible: true,
      nivel: 1,
      orden: 3,
    },
  ]);

  console.log(
    `✅ seedMesaAyudaSistemas insertado correctamente (sistemaId: ${sistemaId})`,
  );
}
