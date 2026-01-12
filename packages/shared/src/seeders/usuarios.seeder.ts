
import { usuarios } from "../database";
import type { DbExecutor } from "../types/db";


export async function seedUsuarios(db: DbExecutor) {
    const datos = [
        {
            nombreCompleto: "Carlos Roberto Fuentes Fuentes",
            email: "cfuentes@municc.com",
            password: '$2b$10$74nQJaLyxEMHc43irhqsRuX4HVP7z2LdBTTONI6657FbGr6hSLI0C', // Hasheamos la contraseña
            activo: true,
            idOficina: 1
        },
        {
            nombreCompleto: "Juan Antonio Perez Perez",
            email: "jantonio@municc.com",
            password: 'jantonio',
            activo: true,
            idOficina: 1
        }
    ];

    try {
        // Insertar usuarios en la base de datos
        await db.insert(usuarios).values(datos);

        console.log("✅ seedUsuarios ejecutado correctamente");
    } catch (error) {
        console.error("❌ Error al ejecutar el seedUsuarios:", error);
        throw error;
    }
}


