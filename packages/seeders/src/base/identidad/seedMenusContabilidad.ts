import { eq } from "drizzle-orm";
import { menus, sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "../../types/db";

/**
 * Menus del sistema Contabilidad.
 * Idempotente: busca el sistemaId por codigo, luego onConflictDoNothing sobre componente.
 *
 * NOTA: los menus raiz no tienen componente unico, se eliminan y reinsertan
 * solo si el sistema existe y no tiene menus aun.
 */
export async function seedMenusContabilidad(db: DbExecutor): Promise<void> {
  process.stdout.write("  seedMenusContabilidad: verificando sistema...\n");

  const [sistema] = await db
    .select({ id: sistemas.id })
    .from(sistemas)
    .where(eq(sistemas.codigo, "contabilidad"));

  if (!sistema) {
    process.stdout.write("  seedMenusContabilidad: sistema 'contabilidad' no existe, saltando\n");
    return;
  }

  const sistemaId = sistema.id;

  // Verificar si ya hay menus para no duplicar
  const existentes = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.idSistema, sistemaId));

  if (existentes.length > 0) {
    process.stdout.write(`  seedMenusContabilidad: ya existen ${existentes.length} menus, saltando\n`);
    return;
  }

  // Insertar menus raiz y capturar sus IDs
  const [menuPlanCuentas] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Plan de Cuentas",
      icono: "book-open",
      componente: "plan_de_cuentas",
      visible: true,
      nivel: 1,
      orden: 1,
    })
    .returning({ id: menus.id });

  const [menuPresupuesto] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Presupuesto",
      icono: "wallet",
      componente: null,
      visible: true,
      nivel: 1,
      orden: 2,
    })
    .returning({ id: menus.id });

  const [menuContabilidad] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Contabilidad",
      icono: "calculator",
      componente: null,
      visible: true,
      nivel: 1,
      orden: 3,
    })
    .returning({ id: menus.id });

  const [menuDecretoPago] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Decreto Pago",
      icono: "hand-coins",
      componente: null,
      visible: true,
      nivel: 1,
      orden: 4,
    })
    .returning({ id: menus.id });

  const [menuGarantia] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Doc. Garantia",
      icono: "file-lock",
      componente: "",
      visible: true,
      nivel: 1,
      orden: 5,
    })
    .returning({ id: menus.id });

  const [menuParametros] = await db
    .insert(menus)
    .values({
      idSistema: sistemaId,
      idPadre: null,
      nombre: "Parametros",
      icono: "settings",
      componente: null,
      visible: true,
      nivel: 1,
      orden: 6,
    })
    .returning({ id: menus.id });

  // Hijos de Presupuesto
  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuPresupuesto.id, nombre: "Inicial", icono: "user-check", componente: "presupuesto_inicial", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuPresupuesto.id, nombre: "Actualizaciones", icono: "user-check", componente: "presupuesto_actualizaciones", visible: true, nivel: 2, orden: 2 },
    { idSistema: sistemaId, idPadre: menuPresupuesto.id, nombre: "Informes", icono: "user-check", componente: "presupuesto_informes", visible: true, nivel: 2, orden: 3 },
    { idSistema: sistemaId, idPadre: menuPresupuesto.id, nombre: "Ejecucion Presupuestaria", icono: "user-check", componente: "presupuesto_ejecucion_presuestaria", visible: true, nivel: 2, orden: 4 },
  ]);

  // Hijos de Contabilidad
  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuContabilidad.id, nombre: "Ingreso Movimientos", icono: "user-check", componente: "contabilidad_ingreso_movimientos", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuContabilidad.id, nombre: "Analisis por Rut", icono: "user-check", componente: "contabilidad_analisis_por_rut", visible: true, nivel: 2, orden: 2 },
    { idSistema: sistemaId, idPadre: menuContabilidad.id, nombre: "Saldos Iniciales", icono: "user-check", componente: "contabilidad_saldos_iniciales", visible: true, nivel: 2, orden: 3 },
    { idSistema: sistemaId, idPadre: menuContabilidad.id, nombre: "Informes", icono: "user-check", componente: "contabilidad_informes", visible: true, nivel: 2, orden: 4 },
  ]);

  // Hijos de Decreto Pago
  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuDecretoPago.id, nombre: "Ingreso Decreto", icono: null, componente: "decreto_pago_ingreso_directo", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuDecretoPago.id, nombre: "Informes", icono: null, componente: "decreto_pago_informes", visible: true, nivel: 2, orden: 2 },
  ]);

  // Hijos de Garantia
  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuGarantia.id, nombre: "Ingreso Documentos", icono: null, componente: "documento_garantia_ingreso_documentos", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuGarantia.id, nombre: "Informes", icono: null, componente: "documento_garantia_informes", visible: true, nivel: 2, orden: 2 },
  ]);

  // Hijos de Parametros
  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuParametros.id, nombre: "Man. Tipos de Ejec. Presupuestaria", icono: null, componente: null, visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuParametros.id, nombre: "Mantenedor", icono: null, componente: "parametros_mantenedor", visible: true, nivel: 2, orden: 2 },
  ]);

  // Plan de Cuentas no tiene hijos por ahora — referenciado arriba para evitar unused
  void menuPlanCuentas;

  process.stdout.write("  seedMenusContabilidad: menus insertados correctamente\n");
}
