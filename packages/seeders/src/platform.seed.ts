/**
 * Seed de datos iniciales para la DB platform.
 *
 * Crea:
 * - Tenant "default" apuntando a la DB "muni_default"
 * - Módulos: contabilidad, chat y configuracion
 * - Suscripciones: default tiene todos los módulos activos
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { municipalidades, modulos, suscripciones, suscripcionHistorial } from "@municipal/db-platform";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const {
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_HOST = "localhost",
  DB_PORT = "5434",
  DB_SSL = "false",
  PLATFORM_DB_NAME = "platform",
} = process.env;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${PLATFORM_DB_NAME}${DB_SSL === "true" ? "?sslmode=require" : ""}`;

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function seed() {
  console.log("Seeding platform DB...\n");

  await db.transaction(async (tx) => {
    // 1. Tenant default
    const [tenant] = await tx
      .insert(municipalidades)
      .values({
        nombre: "Municipalidad Default",
        slug: "default",
        dominioBase: "default.localhost",
        dbName: "muni_default",
        activo: true,
        maxUsuarios: 50,
      })
      .returning();

    console.log(`  Tenant creado: ${tenant.nombre} (slug: ${tenant.slug}, db: ${tenant.dbName})`);

    // 2. Módulos
    const [modContabilidad] = await tx
      .insert(modulos)
      .values({
        codigo: "contabilidad",
        nombre: "Modulo de Contabilidad",
        descripcion: "Gestion contable municipal: plan de cuentas, presupuestos",
        icono: "AccountBalance",
        apiPrefix: "/api/v1/contabilidad",
        mfName: "mf_contabilidad",
        mfManifestUrlTpl: "${BASE_URL}:5020/mf-manifest.json",
        orden: 1,
      })
      .returning();

    const [modChat] = await tx
      .insert(modulos)
      .values({
        codigo: "chat",
        nombre: "Modulo de Chat",
        descripcion: "Mensajeria interna en tiempo real",
        icono: "Chat",
        apiPrefix: "/api/v1/chat",
        mfName: "mf_chat",
        mfManifestUrlTpl: "${BASE_URL}:5021/mf-manifest.json",
        orden: 2,
      })
      .returning();

    const [modConfiguracion] = await tx
      .insert(modulos)
      .values({
        codigo: "configuracion",
        nombre: "Módulo de Configuración",
        descripcion: "Configuración del sistema: seguridad, organización y usuarios",
        icono: "Settings",
        apiPrefix: "/api/v1/configuracion",
        mfName: "mf_configuracion",
        mfManifestUrlTpl: "${BASE_URL}:5041/mf-manifest.json",
        orden: 3,
      })
      .returning();

    console.log(`  Modulo creado: ${modContabilidad.nombre} (${modContabilidad.codigo})`);
    console.log(`  Modulo creado: ${modChat.nombre} (${modChat.codigo})`);
    console.log(`  Modulo creado: ${modConfiguracion.nombre} (${modConfiguracion.codigo})`);

    // 3. Suscripciones: default tiene todos los módulos activos
    const suscs = await tx
      .insert(suscripciones)
      .values([
        {
          municipalidadId: tenant.id,
          moduloId: modContabilidad.id,
          estado: "activa",
          activadoPor: "system",
        },
        {
          municipalidadId: tenant.id,
          moduloId: modChat.id,
          estado: "activa",
          activadoPor: "system",
        },
        {
          municipalidadId: tenant.id,
          moduloId: modConfiguracion.id,
          estado: "activa",
          activadoPor: "system",
        },
      ])
      .returning();

    console.log(`  Suscripciones creadas: ${suscs.length} modulos activos para ${tenant.slug}`);

    // 4. Historial
    for (const susc of suscs) {
      await tx.insert(suscripcionHistorial).values({
        suscripcionId: susc.id,
        accion: "creada",
        estadoAnterior: null,
        estadoNuevo: "activa",
        motivo: "Seed inicial - activacion por defecto",
        ejecutadoPor: "system",
      });
    }

    console.log("  Historial de suscripciones registrado");
  });

  console.log("\nSeed completado exitosamente.");
}

seed()
  .catch((err) => {
    console.error("Error al ejecutar seed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
