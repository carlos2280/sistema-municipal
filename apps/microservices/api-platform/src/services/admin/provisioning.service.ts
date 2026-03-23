import crypto from "node:crypto";
import { resolve } from "node:path";
import { getEnv } from "@/config/env";
import { createLogger } from "@municipal/core/logger";
import {
  departamentos,
  direcciones,
  oficinas,
  usuarios,
} from "@municipal/db-identidad";
import {
  runMigrations,
  seedBase,
  seedCategorias,
  seedPrioridades,
} from "@municipal/seeders";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const logger = createLogger("provisioning.service");

/**
 * Base path to the core drizzle migration folder.
 * packages/seeders/drizzle/ (identidad, contabilidad schemas)
 */
const CORE_MIGRATIONS_DIR = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../../../packages/seeders/drizzle",
);

/**
 * Base path to the transversal drizzle migration folder.
 * packages/seeders/drizzle/transversal/
 */
const TRANSVERSAL_MIGRATIONS_DIR = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../../../packages/seeders/drizzle/transversal",
);

// ─── Naming helpers ───────────────────────────────────────────────────────────

/**
 * Generates a safe core DB name from a tenant slug.
 * Convention: muni_<slug> with non-alphanumeric replaced by underscores.
 */
export function generateDbName(slug: string): string {
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `muni_${sanitized}`;
}

/**
 * Generates the transversal DB name for a tenant.
 * Convention: transversal_<slug> with non-alphanumeric replaced by underscores.
 */
export function generateTransversalDbName(slug: string): string {
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `transversal_${sanitized}`;
}

// ─── DB name validation ───────────────────────────────────────────────────────

function assertValidDbName(dbName: string): void {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(dbName)) {
    throw new Error(`Nombre de base de datos inválido: "${dbName}"`);
  }
}

// ─── Core tenant DB ───────────────────────────────────────────────────────────

/**
 * Creates a new PostgreSQL database for the tenant's core data (identidad, contabilidad).
 * Connects to the "postgres" maintenance DB to issue CREATE DATABASE.
 */
export async function createTenantDatabase(dbName: string): Promise<void> {
  assertValidDbName(dbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: "postgres",
    max: 1,
  });

  try {
    const exists = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (exists.rowCount && exists.rowCount > 0) {
      throw new Error(`La base de datos "${dbName}" ya existe`);
    }

    await pool.query(`CREATE DATABASE "${dbName}"`);
    logger.info({ dbName }, "Base de datos core creada");
  } finally {
    await pool.end();
  }
}

/**
 * Drops a PostgreSQL database if it exists.
 * Used exclusively for rollback on provisioning failure.
 */
async function dropDatabaseIfExists(
  dbName: string,
  host: string,
  port: number,
  user: string,
  password: string,
): Promise<void> {
  const pool = new Pool({
    host,
    port,
    user,
    password,
    database: "postgres",
    max: 1,
  });

  try {
    await pool.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1",
      [dbName],
    );
    await pool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    logger.info({ dbName }, "Base de datos eliminada en rollback");
  } catch (err) {
    logger.error(
      { err, dbName },
      "Error al eliminar DB en rollback (no crítico)",
    );
  } finally {
    await pool.end();
  }
}

/**
 * Runs all tenant core migrations using the shared runMigrations utility
 * from @municipal/seeders.
 */
export async function runTenantMigrations(dbName: string): Promise<void> {
  assertValidDbName(dbName);

  const env = getEnv();
  const sslSuffix = env.DB_SSL ? "?sslmode=require" : "";
  const connectionString = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${dbName}${sslSuffix}`;

  await runMigrations({
    connectionString,
    migrationsFolder: CORE_MIGRATIONS_DIR,
    schemas: ["identidad", "contabilidad"],
    label: dbName,
  });

  logger.info({ dbName }, "Migraciones core aplicadas");
}

// ─── Transversal tenant DB ────────────────────────────────────────────────────

/**
 * Creates the transversal PostgreSQL database for a tenant's mensajeria schema.
 */
export async function createTransversalDatabase(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.TRANSVERSAL_DB_HOST,
    port: env.TRANSVERSAL_DB_PORT,
    user: env.TRANSVERSAL_DB_USER,
    password: env.TRANSVERSAL_DB_PASSWORD,
    database: "postgres",
    max: 1,
  });

  try {
    const exists = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [transversalDbName],
    );

    if (exists.rowCount && exists.rowCount > 0) {
      throw new Error(
        `La base de datos transversal "${transversalDbName}" ya existe`,
      );
    }

    await pool.query(`CREATE DATABASE "${transversalDbName}"`);
    logger.info({ transversalDbName }, "Base de datos transversal creada");
  } finally {
    await pool.end();
  }
}

/**
 * Runs transversal migrations using the shared runMigrations utility
 * from @municipal/seeders.
 */
export async function runTransversalMigrations(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const sslSuffix = env.TRANSVERSAL_DB_SSL ? "?sslmode=require" : "";
  const connectionString = `postgresql://${env.TRANSVERSAL_DB_USER}:${env.TRANSVERSAL_DB_PASSWORD}@${env.TRANSVERSAL_DB_HOST}:${env.TRANSVERSAL_DB_PORT}/${transversalDbName}${sslSuffix}`;

  await runMigrations({
    connectionString,
    migrationsFolder: TRANSVERSAL_MIGRATIONS_DIR,
    schemas: ["mensajeria", "mesa_ayuda"],
    label: transversalDbName,
  });

  logger.info({ transversalDbName }, "Migraciones transversal aplicadas");
}

// ─── Catalogo seeders (usa seeders canónicos de @municipal/seeders) ──────────

/**
 * Seeds default transversal catalogs (categorias, prioridades) into the transversal DB.
 * Usa los seeders canónicos de @municipal/seeders — fuente única de verdad.
 * Idempotente: onConflictDoNothing en los seeders base.
 */
export async function seedTransversalCatalogs(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.TRANSVERSAL_DB_HOST,
    port: env.TRANSVERSAL_DB_PORT,
    user: env.TRANSVERSAL_DB_USER,
    password: env.TRANSVERSAL_DB_PASSWORD,
    database: transversalDbName,
    max: 1,
  });

  const db: NodePgDatabase<Record<string, never>> = drizzle(pool);

  try {
    await seedCategorias(db);
    await seedPrioridades(db);
    logger.info({ transversalDbName }, "Catálogos transversal sembrados");
  } finally {
    await pool.end();
  }
}

// ─── Seed base catalogs del tenant (sistemas, menus, contabilidad) ───────────

/**
 * Siembra los catálogos base del sistema en la DB core del tenant:
 * sistemas, menus de navegación, tipos de cuentas, subgrupos, planes de cuentas, etc.
 *
 * Sin esto, el tenant tendría tablas vacías y la aplicación no funcionaría.
 * Usa seedBase de @municipal/seeders — fuente única de verdad.
 */
export async function seedTenantBaseCatalogs(dbName: string): Promise<void> {
  assertValidDbName(dbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: dbName,
    max: 1,
  });

  const db = drizzle(pool);

  try {
    await seedBase(db);
    logger.info({ dbName }, "Catálogos base del tenant sembrados");
  } finally {
    await pool.end();
  }
}

// ─── Seed base del tenant (estructura organizacional) ────────────────────────

/**
 * Resultado del seed base: IDs de los registros creados para uso posterior.
 */
export interface TenantBaseSeeds {
  idDireccion: number;
  idDepartamento: number;
  idOficina: number;
}

/**
 * Siembra la estructura organizacional mínima en la DB core del tenant.
 * Crea la cadena jerárquica: dirección → departamento → oficina.
 * Prerequisito para poder insertar usuarios (idOficina NOT NULL).
 */
export async function seedTenantBase(
  dbName: string,
  nombreMunicipalidad: string,
): Promise<TenantBaseSeeds> {
  assertValidDbName(dbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: dbName,
    max: 1,
  });

  const db = drizzle(pool, {
    schema: { direcciones, departamentos, oficinas, usuarios },
  });

  try {
    const [direccion] = await db
      .insert(direcciones)
      .values({
        nombre: `Dirección General — ${nombreMunicipalidad}`,
        responsable: "Administrador del Sistema",
      })
      .returning({ id: direcciones.id });

    const [departamento] = await db
      .insert(departamentos)
      .values({
        nombreDepartamento: `Departamento General — ${nombreMunicipalidad}`,
        responsable: "Administrador del Sistema",
        idDireccion: direccion.id,
      })
      .returning({ id: departamentos.id });

    const [oficina] = await db
      .insert(oficinas)
      .values({
        nombreOficina: "Oficina de Administración",
        responsable: "Administrador del Sistema",
        idDepartamento: departamento.id,
      })
      .returning({ id: oficinas.id });

    logger.info(
      {
        dbName,
        idDireccion: direccion.id,
        idDepartamento: departamento.id,
        idOficina: oficina.id,
      },
      "Estructura organizacional base sembrada",
    );

    return {
      idDireccion: direccion.id,
      idDepartamento: departamento.id,
      idOficina: oficina.id,
    };
  } finally {
    await pool.end();
  }
}

// ─── Crear usuario administrador ─────────────────────────────────────────────

export interface CreateAdminUserParams {
  dbName: string;
  adminEmail: string;
  adminNombre: string;
  idOficina: number;
}

export interface AdminUserResult {
  id: number;
  email: string;
  nombreCompleto: string;
  /** Contraseña temporal en texto plano — usar solo para enviar por email, nunca loguear */
  passwordTemporal: string;
}

/**
 * Crea el usuario administrador inicial en la DB core del tenant.
 *
 * - Genera contraseña temporal con crypto.randomBytes (no Math.random)
 * - bcrypt con 12 rounds
 * - passwordTemp: true para forzar cambio en primer login
 * - NUNCA loguea la contraseña temporal
 */
export async function createAdminUser(
  params: CreateAdminUserParams,
): Promise<AdminUserResult> {
  const { dbName, adminEmail, adminNombre, idOficina } = params;
  assertValidDbName(dbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: dbName,
    max: 1,
  });

  const db = drizzle(pool, {
    schema: { usuarios },
  });

  // crypto.randomBytes — nunca Math.random
  const passwordTemporal = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(passwordTemporal, 12);

  try {
    const [admin] = await db
      .insert(usuarios)
      .values({
        nombreCompleto: adminNombre,
        email: adminEmail,
        password: hashedPassword,
        idOficina,
        activo: true,
        passwordTemp: true,
        mfaEnabled: false,
        mfaVerified: false,
      })
      .returning({
        id: usuarios.id,
        email: usuarios.email,
        nombreCompleto: usuarios.nombreCompleto,
      });

    logger.info(
      { dbName, adminEmail, adminId: admin.id },
      "Usuario administrador creado",
    );

    return {
      id: admin.id,
      email: admin.email,
      nombreCompleto: admin.nombreCompleto,
      passwordTemporal,
    };
  } finally {
    await pool.end();
  }
}

// ─── Orquestador: provisionar DB transversal completa ────────────────────────

/**
 * Full provisioning of a tenant's transversal database:
 * 1. Create the database
 * 2. Run migrations (creates mensajeria + mesa_ayuda schemas and tables)
 * 3. Seed default catalogs (categorias, prioridades)
 */
export async function provisionTransversalDb(
  transversalDbName: string,
): Promise<void> {
  await createTransversalDatabase(transversalDbName);
  await runTransversalMigrations(transversalDbName);
  await seedTransversalCatalogs(transversalDbName);
}

// ─── Rollback de provisioning ─────────────────────────────────────────────────

export interface RollbackParams {
  dbName: string;
  transversalDbName?: string;
}

/**
 * Elimina las DBs creadas durante un provisioning fallido.
 * Se ejecuta únicamente en el catch del flujo de createTenant.
 * Los errores de rollback se loguean pero no se propagan (best-effort).
 */
export async function rollbackTenantDatabases(
  params: RollbackParams,
): Promise<void> {
  const { dbName, transversalDbName } = params;
  const env = getEnv();

  logger.warn(
    { dbName, transversalDbName },
    "Iniciando rollback de DBs del tenant",
  );

  await dropDatabaseIfExists(
    dbName,
    env.DB_HOST,
    env.DB_PORT,
    env.DB_USER,
    env.DB_PASSWORD,
  );

  if (transversalDbName) {
    await dropDatabaseIfExists(
      transversalDbName,
      env.TRANSVERSAL_DB_HOST,
      env.TRANSVERSAL_DB_PORT,
      env.TRANSVERSAL_DB_USER,
      env.TRANSVERSAL_DB_PASSWORD,
    );
  }
}
