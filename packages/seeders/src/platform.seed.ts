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
import { categorias, prioridades } from "@municipal/db-mesa-ayuda";

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
        icono: "calculator",
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
        icono: "message-square",
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
        icono: "settings",
        apiPrefix: "/api/v1/configuracion",
        mfName: "mf_configuracion",
        mfManifestUrlTpl: "${BASE_URL}:5041/mf-manifest.json",
        orden: 3,
      })
      .returning();

    const [modMesaAyuda] = await tx
      .insert(modulos)
      .values({
        codigo: "mesa_ayuda",
        nombre: "Mesa de Ayuda",
        descripcion: "Sistema de tickets y soporte para atencion ciudadana",
        icono: "headphones",
        apiPrefix: "/api/v1/mesa-ayuda",
        mfName: "mf_mesa_ayuda",
        mfManifestUrlTpl: "${BASE_URL}:5050/mf-manifest.json",
        orden: 4,
      })
      .returning();

    console.log(`  Modulo creado: ${modContabilidad.nombre} (${modContabilidad.codigo})`);
    console.log(`  Modulo creado: ${modChat.nombre} (${modChat.codigo})`);
    console.log(`  Modulo creado: ${modConfiguracion.nombre} (${modConfiguracion.codigo})`);
    console.log(`  Modulo creado: ${modMesaAyuda.nombre} (${modMesaAyuda.codigo})`);

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
        {
          municipalidadId: tenant.id,
          moduloId: modMesaAyuda.id,
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

    // 5. Catálogo global de categorías de mesa de ayuda
    const CATEGORIAS = [
      { codigo: "infraestructura", nombre: "Infraestructura y Obras", icono: "hard-hat", color: "warning", orden: 1 },
      { codigo: "tramites", nombre: "Tramites y Documentos", icono: "file-text", color: "info", orden: 2 },
      { codigo: "reclamos", nombre: "Reclamos Ciudadanos", icono: "alert-triangle", color: "error", orden: 3 },
      { codigo: "consultas", nombre: "Consultas Generales", icono: "help-circle", color: "primary", orden: 4 },
      { codigo: "servicios", nombre: "Servicios Municipales", icono: "building-2", color: "secondary", orden: 5 },
      { codigo: "medioambiente", nombre: "Medio Ambiente y Aseo", icono: "leaf", color: "success", orden: 6 },
      { codigo: "seguridad", nombre: "Seguridad Ciudadana", icono: "shield", color: "error", orden: 7 },
      { codigo: "social", nombre: "Asistencia Social", icono: "heart", color: "secondary", orden: 8 },
    ] as const;

    await tx.insert(categorias).values(
      CATEGORIAS.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        icono: c.icono,
        color: c.color,
        orden: c.orden,
        activo: true,
      })),
    );

    console.log(`  Categorias mesa_ayuda creadas: ${CATEGORIAS.length}`);

    // 6. Catálogo global de prioridades de mesa de ayuda
    const PRIORIDADES = [
      { codigo: "baja", nombre: "Baja", color: "success", nivel: 1, slaHoras: 72 },
      { codigo: "media", nombre: "Media", color: "info", nivel: 2, slaHoras: 48 },
      { codigo: "alta", nombre: "Alta", color: "warning", nivel: 3, slaHoras: 24 },
      { codigo: "critica", nombre: "Critica", color: "error", nivel: 4, slaHoras: 8 },
    ] as const;

    await tx.insert(prioridades).values(
      PRIORIDADES.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        color: p.color,
        nivel: p.nivel,
        slaHoras: p.slaHoras,
      })),
    );

    console.log(`  Prioridades mesa_ayuda creadas: ${PRIORIDADES.length}`);
  });

  console.log("\nSeed completado exitosamente.");
}

seed()
  .catch((err) => {
    console.error("Error al ejecutar seed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
