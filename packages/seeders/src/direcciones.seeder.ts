import { direcciones } from "@municipal/db-identidad";
import type { DbExecutor } from "./types/db";

export async function seedDirecciones(db: DbExecutor) {
    const datos = [
        { nombre: "Dirección General", responsable: "Juan Pérez" },
        { nombre: "Dirección Administrativa", responsable: "Laura Gómez" },
    ];

    try {
        console.log("🌱 Insertando direccion...");
        await db.insert(direcciones).values(datos);
        console.log("✅ seedDirecciones insertadas correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedDirecciones:", error);
        throw error;
    }
}
