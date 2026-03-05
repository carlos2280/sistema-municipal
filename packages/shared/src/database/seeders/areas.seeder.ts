import { areas } from "../";
import type { DbExecutor } from "../../types/db";

export async function seedAreas(db: DbExecutor) {
    const datos = [
        { nombre: "municipalidad" },
        { nombre: "salud" },
        { nombre: "educación" },
    ];

    try {
        console.log("🌱 Insertando areas...");
        await db.insert(areas).values(datos);
        console.log("✅ seedAreas insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedAreas:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}