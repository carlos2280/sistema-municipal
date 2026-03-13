import { sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "./types/db";

export async function seedSistemas(db: DbExecutor) {
    const datos = [
        { nombre: "Sisitema Contabilidad", icono: 'TbReportMoney' },
        { nombre: "Sisitema Remuneraciones", icono: 'TbCreditCard' },
        { nombre: "Sisitema Tesoreria", icono: 'TbCoin' },
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
