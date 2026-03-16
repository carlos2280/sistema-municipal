import { areas } from "@municipal/db-identidad";
import type { DbExecutor } from "./types/db";

export async function seedAreas(db: DbExecutor) {
    const datos = [
        { nombre: "municipalidad", descripcion: "Gestión municipal central" },
        { nombre: "salud", descripcion: "Servicios de salud" },
        { nombre: "educación", descripcion: "Establecimientos educativos" },
    ];

    try {
        console.log("🌱 Insertando areas...");
        await db.insert(areas).values(datos);
        console.log("✅ seedAreas insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedAreas:", error);
        throw error;
    }
}
