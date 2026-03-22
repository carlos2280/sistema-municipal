import { db } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import { municipalidades } from "@municipal/db-platform";
import { desc, eq } from "drizzle-orm";
import {
  createTenantDatabase,
  generateDbName,
  generateTransversalDbName,
  provisionTransversalDb,
  runTenantMigrations,
} from "./provisioning.service";

export interface CreateTenantInput {
  nombre: string;
  slug: string;
  dominioBase: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  maxUsuarios?: number;
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

  // 1. Insert into platform DB (includes transversal_db_name)
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

  // 2. Create core PostgreSQL database (identidad, contabilidad)
  try {
    await createTenantDatabase(dbName);
  } catch (err) {
    await db.delete(municipalidades).where(eq(municipalidades.id, tenant.id));
    throw new AppError(
      `Error creando base de datos: ${(err as Error).message}`,
      500,
    );
  }

  // 3. Run core migrations on the new DB
  try {
    await runTenantMigrations(dbName);
  } catch (err) {
    await db
      .update(municipalidades)
      .set({ activo: false })
      .where(eq(municipalidades.id, tenant.id));
    throw new AppError(
      `Error ejecutando migraciones de DB core: ${(err as Error).message}`,
      500,
    );
  }

  // 4. Provision transversal DB: create + migrate (mensajeria schema) + seed catalogs
  try {
    await provisionTransversalDb(transversalDbName);
  } catch (err) {
    await db
      .update(municipalidades)
      .set({ activo: false })
      .where(eq(municipalidades.id, tenant.id));
    throw new AppError(
      `Error provisionando DB transversal: ${(err as Error).message}`,
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
