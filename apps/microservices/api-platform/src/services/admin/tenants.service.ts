import { db } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import { createLogger } from "@municipal/core/logger";
import { municipalidades } from "@municipal/db-platform";
import { desc, eq } from "drizzle-orm";
import { sendTenantWelcomeEmail } from "./email.service";
import {
  createAdminUser,
  createTenantDatabase,
  generateDbName,
  generateTransversalDbName,
  provisionTransversalDb,
  rollbackTenantDatabases,
  runTenantMigrations,
  seedTenantBase,
  seedTenantBaseCatalogs,
} from "./provisioning.service";

const logger = createLogger("tenants.service");

export interface CreateTenantInput {
  nombre: string;
  slug: string;
  dominioBase: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  maxUsuarios?: number;
  adminEmail: string;
  adminNombre: string;
}

export interface UpdateTenantInput {
  nombre?: string;
  dominioBase?: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  logoUrl?: string;
  tema?: Record<string, unknown>;
  dominiosCustom?: string[];
  activo?: boolean;
  maxUsuarios?: number;
}

export const listTenants = async () => {
  return db
    .select()
    .from(municipalidades)
    .orderBy(desc(municipalidades.createdAt));
};

export const getTenantById = async (id: number) => {
  const [tenant] = await db
    .select()
    .from(municipalidades)
    .where(eq(municipalidades.id, id));

  if (!tenant) throw new AppError("Municipalidad no encontrada", 404);
  return tenant;
};

export const createTenant = async (input: CreateTenantInput) => {
  const dbName = generateDbName(input.slug);
  const transversalDbName = generateTransversalDbName(input.slug);

  // 1. Insertar en la DB de plataforma (incluye transversal_db_name)
  const [tenant] = await db
    .insert(municipalidades)
    .values({
      nombre: input.nombre,
      slug: input.slug,
      dominioBase: input.dominioBase,
      dbName,
      transversalDbName,
      rut: input.rut,
      direccion: input.direccion,
      telefono: input.telefono,
      emailContacto: input.emailContacto,
      maxUsuarios: input.maxUsuarios ?? 50,
      activo: true,
    })
    .returning();

  // 2–7: Todo el provisioning en un bloque con rollback robusto (O6)
  try {
    // 2. Crear DB core PostgreSQL (identidad, contabilidad)
    await createTenantDatabase(dbName);

    // 3. Ejecutar migraciones core en la nueva DB (O5: usa runMigrations canónico)
    await runTenantMigrations(dbName);

    // 4. Provisionar DB transversal: create + migrate + seed catálogos
    await provisionTransversalDb(transversalDbName);

    // 4.5. Sembrar catálogos base del sistema (sistemas, menús, tipos cuentas, etc.)
    //      Sin esto el tenant tendría tablas vacías y la app no funcionaría
    await seedTenantBaseCatalogs(dbName);

    // 5. Sembrar estructura organizacional base (dirección → departamento → oficina)
    //    Prerequisito para poder insertar el usuario admin (idOficina NOT NULL)
    const seeds = await seedTenantBase(dbName, input.nombre);

    // 6. Crear usuario administrador inicial
    const admin = await createAdminUser({
      dbName,
      adminEmail: input.adminEmail,
      adminNombre: input.adminNombre,
      idOficina: seeds.idOficina,
    });

    // 7. Enviar email de bienvenida con contraseña temporal
    //    Fallo de email no aborta el provisioning (manejado internamente)
    //    NUNCA loguear admin.passwordTemporal
    await sendTenantWelcomeEmail({
      adminEmail: admin.email,
      adminNombre: admin.nombreCompleto,
      nombreMunicipalidad: input.nombre,
      passwordTemporal: admin.passwordTemporal,
    });

    logger.info(
      { tenantId: tenant.id, slug: input.slug, adminEmail: input.adminEmail },
      "Tenant provisionado completamente",
    );
  } catch (err) {
    // O6: Rollback robusto — cerrar pools, DROP databases, eliminar registro
    logger.error(
      { err, dbName, transversalDbName, tenantId: tenant.id },
      "Provisioning fallido, iniciando rollback",
    );

    await rollbackTenantDatabases({ dbName, transversalDbName });

    await db.delete(municipalidades).where(eq(municipalidades.id, tenant.id));

    throw new AppError(
      `Error provisionando el tenant: ${(err as Error).message}`,
      500,
    );
  }

  return tenant;
};

export const updateTenant = async (id: number, input: UpdateTenantInput) => {
  await getTenantById(id);

  const [updated] = await db
    .update(municipalidades)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(municipalidades.id, id))
    .returning();

  return updated;
};

export const deactivateTenant = async (id: number) => {
  await getTenantById(id);

  await db
    .update(municipalidades)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(municipalidades.id, id));
};
