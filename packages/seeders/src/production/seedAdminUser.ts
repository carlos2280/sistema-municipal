import { usuarios } from "@municipal/db-identidad";
import type { DbExecutor } from "../types/db";

interface AdminUserConfig {
  email: string;
  nombreCompleto: string;
  idOficina: number;
}

/**
 * Crea el usuario administrador inicial del tenant.
 * Idempotente: onConflictDoNothing sobre email.
 *
 * @param db - Instancia o transaccion de la DB del tenant
 * @param config - Datos del admin: email, nombre e idOficina base
 * @param passwordHash - Hash bcrypt ya generado por el caller
 */
export async function seedAdminUser(
  db: DbExecutor,
  config: AdminUserConfig,
  passwordHash: string,
): Promise<void> {
  process.stdout.write(`  seedAdminUser: creando usuario admin ${config.email}...\n`);

  await db
    .insert(usuarios)
    .values({
      nombreCompleto: config.nombreCompleto,
      email: config.email,
      password: passwordHash,
      idOficina: config.idOficina,
      activo: true,
      passwordTemp: true,
    })
    .onConflictDoNothing({ target: usuarios.email });

  process.stdout.write("  seedAdminUser: usuario admin creado\n");
}
