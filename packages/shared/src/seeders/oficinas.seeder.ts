import { oficinas } from "../database";
import type { DbExecutor } from "../types/db";

export async function seedOficinas(db: DbExecutor) {
    const datos = [
        { nombreOficina: "Oficina Principal", responsable: "Sofía Ruiz", idDepartamento: 1 },
        { nombreOficina: "Oficina Contable", responsable: "Luis Castro", idDepartamento: 2 },
        { nombreOficina: "Oficina de Compras", responsable: "Gloria Fernández", idDepartamento: 3 },
    ];

    try {
        console.log("🌱 Insertando oficina...");
        await db.insert(oficinas).values(datos);
        console.log("✅ seedOficinas insertadas correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedOficinas:", error);
        throw error;
    }
}
