import { usuarios } from "@municipal/db-identidad";
import * as bcrypt from "bcryptjs";
import * as crypto from "node:crypto";
import type { DbExecutor } from "./types/db";

const BCRYPT_ROUNDS = 12;

/**
 * Genera una contraseña aleatoria y la hashea en runtime.
 * Nunca se persiste la contraseña en texto plano ni en el código fuente.
 * passwordTemp: true fuerza al usuario a cambiarla en el primer login.
 */
async function generarPasswordHash(): Promise<string> {
  const passwordAleatoria = crypto.randomBytes(16).toString("hex");
  return bcrypt.hash(passwordAleatoria, BCRYPT_ROUNDS);
}

export async function seedUsuarios(db: DbExecutor) {
  // Cada usuario recibe un hash independiente generado en runtime
  const [
    hashCfuentes,
    hashJantonio,
    hashMgonzalez,
    hashRmendoza,
    hashArodriguez,
    hashFmartinez,
    hashLherrera,
    hashDvargas,
  ] = await Promise.all([
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
    generarPasswordHash(),
  ]);

  const datos = [
    {
      nombreCompleto: "Carlos Roberto Fuentes Fuentes",
      email: "cfuentes@municc.com",
      password: hashCfuentes,
      activo: true,
      idOficina: 1,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Juan Antonio Perez Perez",
      email: "jantonio@municc.com",
      password: hashJantonio,
      activo: true,
      idOficina: 1,
      passwordTemp: true,
    },
    {
      nombreCompleto: "María Elena González López",
      email: "mgonzalez@municc.com",
      password: hashMgonzalez,
      activo: true,
      idOficina: 1,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Roberto Carlos Mendoza Ruiz",
      email: "rmendoza@municc.com",
      password: hashRmendoza,
      activo: true,
      idOficina: 1,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Ana Patricia Rodríguez Sánchez",
      email: "arodriguez@municc.com",
      password: hashArodriguez,
      activo: true,
      idOficina: 1,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Fernando José Martínez Castro",
      email: "fmartinez@municc.com",
      password: hashFmartinez,
      activo: true,
      idOficina: 2,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Laura Isabel Herrera Mora",
      email: "lherrera@municc.com",
      password: hashLherrera,
      activo: true,
      idOficina: 2,
      passwordTemp: true,
    },
    {
      nombreCompleto: "Diego Alejandro Vargas Torres",
      email: "dvargas@municc.com",
      password: hashDvargas,
      activo: true,
      idOficina: 2,
      passwordTemp: true,
    },
  ];

  try {
    await db
      .insert(usuarios)
      .values(datos)
      .onConflictDoNothing({ target: usuarios.email });
  } catch (error) {
    throw error;
  }
}
