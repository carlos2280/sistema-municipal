
import { usuarios } from "../database";
import type { DbExecutor } from "../types/db";

// Contraseña hasheada: "password123" (bcrypt 10 rounds)
const PASSWORD_HASH = '$2b$10$WBPfeIvXU1NLN4h9b14H0urJMBG306IR3iHNqVc0Din3gT5yv7GYW';

export async function seedUsuarios(db: DbExecutor) {
    const datos = [
        {
            nombreCompleto: "Carlos Roberto Fuentes Fuentes",
            email: "cfuentes@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "Juan Antonio Perez Perez",
            email: "jantonio@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "María Elena González López",
            email: "mgonzalez@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "Roberto Carlos Mendoza Ruiz",
            email: "rmendoza@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "Ana Patricia Rodríguez Sánchez",
            email: "arodriguez@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "Fernando José Martínez Castro",
            email: "fmartinez@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 2
        },
        {
            nombreCompleto: "Laura Isabel Herrera Mora",
            email: "lherrera@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 2
        },
        {
            nombreCompleto: "Diego Alejandro Vargas Torres",
            email: "dvargas@municc.com",
            password: PASSWORD_HASH,
            activo: true,
            idOficina: 2
        }
    ];

    try {
        // Insertar usuarios (ignorar si ya existen por email)
        await db.insert(usuarios).values(datos).onConflictDoNothing({ target: usuarios.email });

        console.log("✅ seedUsuarios ejecutado correctamente");
    } catch (error) {
        console.error("❌ Error al ejecutar el seedUsuarios:", error);
        throw error;
    }
}


