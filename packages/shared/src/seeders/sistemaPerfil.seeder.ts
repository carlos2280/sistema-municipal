import { areas, perfilAreaUsuario, sistemaPerfil } from "../database";
import type { DbExecutor } from "../types/db";

export async function seedSistemaPerfil(db: DbExecutor) {
    const datos = [
        { sistemaId: 1, perfilId: 1 },
        { sistemaId: 2, perfilId: 1 },

    ];

    try {
        console.log("🌱 Insertando areas...");
        await db.insert(sistemaPerfil).values(datos);
        console.log("✅ seedSistemaPerfil insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedSistemaPerfil:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}