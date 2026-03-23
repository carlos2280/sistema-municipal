/**
 * Seed de datos iniciales para la DB platform.
 *
 * Crea:
 * - Tenant "default" apuntando a la DB "muni_default"
 * - Módulos: contabilidad, chat y configuracion
 * - Suscripciones: default tiene todos los módulos activos
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  modulos,
  municipalidades,
  suscripcionHistorial,
  suscripciones,
} from '@municipal/db-platform'
import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const {
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = '5434',
  DB_SSL = 'false',
  PLATFORM_DB_NAME = 'platform',
} = process.env

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${PLATFORM_DB_NAME}${DB_SSL === 'true' ? '?sslmode=require' : ''}`

const pool = new Pool({ connectionString })
const db = drizzle(pool)

async function seed() {
  console.log('Seeding platform DB...\n')

  await db.transaction(async (tx) => {
    // 1. Tenant default — idempotente por slug único
    const [tenantExistente] = await tx
      .select()
      .from(municipalidades)
      .where(eq(municipalidades.slug, 'default'))
      .limit(1)

    const tenant =
      tenantExistente ??
      (await tx
        .insert(municipalidades)
        .values({
          nombre: 'Municipalidad Default',
          slug: 'default',
          dominioBase: 'default.localhost',
          dbName: 'muni_default',
          transversalDbName: 'transversal_muni_default',
          activo: true,
          maxUsuarios: 50,
        })
        .returning()
        .then((rows) => rows[0]))

    if (tenantExistente) {
      console.log(`  Tenant ya existe: ${tenant.nombre} (slug: ${tenant.slug})`)
    } else {
      console.log(
        `  Tenant creado: ${tenant.nombre} (slug: ${tenant.slug}, db: ${tenant.dbName})`,
      )
    }

    // 2. Módulos — idempotentes por código único
    const modulosData = [
      {
        codigo: 'contabilidad',
        nombre: 'Modulo de Contabilidad',
        descripcion:
          'Gestion contable municipal: plan de cuentas, presupuestos',
        icono: 'calculator',
        apiPrefix: '/api/v1/contabilidad',
        mfName: 'mf_contabilidad',
        mfManifestUrlTpl: '${BASE_URL}:5020/mf-manifest.json',
        orden: 1,
      },
      {
        codigo: 'chat',
        nombre: 'Modulo de Chat',
        descripcion: 'Mensajeria interna en tiempo real',
        icono: 'message-square',
        apiPrefix: '/api/v1/chat',
        mfName: 'mf_chat',
        mfManifestUrlTpl: '${BASE_URL}:5021/mf-manifest.json',
        orden: 2,
      },
      {
        codigo: 'configuracion',
        nombre: 'Módulo de Configuración',
        descripcion:
          'Configuración del sistema: seguridad, organización y usuarios',
        icono: 'settings',
        apiPrefix: '/api/v1/configuracion',
        mfName: 'mf_configuracion',
        mfManifestUrlTpl: '${BASE_URL}:5041/mf-manifest.json',
        orden: 3,
      },
      {
        codigo: 'mesa_ayuda',
        nombre: 'Mesa de Ayuda',
        descripcion: 'Sistema de tickets y soporte para atencion ciudadana',
        icono: 'headphones',
        apiPrefix: '/api/v1/mesa-ayuda',
        mfName: 'mf_mesa_ayuda',
        mfManifestUrlTpl: '${BASE_URL}:5050/mf-manifest.json',
        orden: 4,
      },
    ]

    const modulosInsertados: Array<typeof modulos.$inferSelect> = []
    for (const mod of modulosData) {
      const [existente] = await tx
        .select()
        .from(modulos)
        .where(eq(modulos.codigo, mod.codigo))
        .limit(1)

      if (existente) {
        console.log(
          `  Modulo ya existe: ${existente.nombre} (${existente.codigo})`,
        )
        modulosInsertados.push(existente)
      } else {
        const [nuevo] = await tx.insert(modulos).values(mod).returning()
        console.log(`  Modulo creado: ${nuevo.nombre} (${nuevo.codigo})`)
        modulosInsertados.push(nuevo)
      }
    }

    const [modContabilidad, modChat, modConfiguracion, modMesaAyuda] =
      modulosInsertados

    // 3. Suscripciones — idempotentes por constraint uq_muni_modulo
    const modulosParaSuscribir = [
      modContabilidad,
      modChat,
      modConfiguracion,
      modMesaAyuda,
    ]

    const suscsNuevas: Array<typeof suscripciones.$inferSelect> = []
    for (const mod of modulosParaSuscribir) {
      const [existente] = await tx
        .select()
        .from(suscripciones)
        .where(
          and(
            eq(suscripciones.municipalidadId, tenant.id),
            eq(suscripciones.moduloId, mod.id),
          ),
        )
        .limit(1)

      if (existente) {
        console.log(
          `  Suscripcion ya existe: tenant=${tenant.slug}, modulo=${mod.codigo}`,
        )
        continue
      }

      const [nueva] = await tx
        .insert(suscripciones)
        .values({
          municipalidadId: tenant.id,
          moduloId: mod.id,
          estado: 'activa',
          activadoPor: 'system',
        })
        .returning()
      suscsNuevas.push(nueva)
    }

    console.log(
      `  Suscripciones nuevas: ${suscsNuevas.length} para ${tenant.slug}`,
    )

    // 4. Historial — solo para suscripciones nuevas
    for (const susc of suscsNuevas) {
      await tx.insert(suscripcionHistorial).values({
        suscripcionId: susc.id,
        accion: 'creada',
        estadoAnterior: null,
        estadoNuevo: 'activa',
        motivo: 'Seed inicial - activacion por defecto',
        ejecutadoPor: 'system',
      })
    }

    console.log('  Historial de suscripciones registrado')

    // NOTA: Catalogos de mesa_ayuda (categorias, prioridades) se seedean
    // en transversal.seed.ts, ya que viven en la DB transversal.
  })

  console.log('\nSeed completado exitosamente.')
}

seed()
  .catch((err) => {
    console.error('Error al ejecutar seed:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
