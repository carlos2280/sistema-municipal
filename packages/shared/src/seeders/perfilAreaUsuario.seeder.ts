import { areas, perfilAreaUsuario } from "../database";
import type { DbExecutor } from "../types/db";

export async function seedPerfilAreaUsuario(db: DbExecutor) {
    const datos = [
        { perfilId: 1, areaId: 1, usuarioId: 1 },
        { perfilId: 2, areaId: 2, usuarioId: 1 },

    ];

    try {
        console.log("🌱 Insertando areas...");
        await db.insert(perfilAreaUsuario).values(datos);
        console.log("✅ seedPerfilAreaUsuario insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedPerfilAreaUsuario:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}