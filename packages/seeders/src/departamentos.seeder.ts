import { departamentos } from "@municipal/db-identidad";
import type { DbExecutor } from "./types/db";

export async function seedDepartamentos(db: DbExecutor) {
    const datos = [
        { nombreDepartamento: "Recursos Humanos", responsable: "Carlos Mendoza", idDireccion: 1 },
        { nombreDepartamento: "Finanzas", responsable: "Ana Martínez", idDireccion: 1 },
        { nombreDepartamento: "Compras", responsable: "Mario Sánchez", idDireccion: 2 },
    ];

    try {
        console.log("🌱 Insertando departamento...");
        await db.insert(departamentos).values(datos);
        console.log("✅ seedDepartamentos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedDepartamentos:", error);
        throw error;
    }
}
