import { sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "./types/db";

export async function seedSistemas(db: DbExecutor) {
    const datos = [
        { codigo: "contabilidad", nombre: "Sistema Contabilidad", icono: "calculator" },
        { codigo: "rrhh", nombre: "Sistema Remuneraciones", icono: "credit-card" },
        { codigo: "tesoreria", nombre: "Sistema Tesoreria", icono: "coins" },
        { codigo: "config", nombre: "Sistema Configuración", icono: "settings" },
    ];

    try {
        console.log("🌱 Insertando sistemas...");
        await db.insert(sistemas).values(datos);
        console.log("✅ seedSistemas insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedSistemas:", error);
        throw error;
    }
}
