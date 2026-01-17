import { cuentasSubgrupos, planesCuentas } from "../../database";
import type { DbExecutor } from "../../types/db";

export async function seedPlanesCuentas(db: DbExecutor) {
    const datos = [
        { anoContable: 2025, codigo: '1.1', nombre: 'caja', subgrupoId: 1, parentId: null, codigo_ini: '01', tipoCuentaId: 3 },
    ];

    try {
        console.log("🌱 Insertando titulos cuentas...");
        await db.insert(planesCuentas).values(datos);
        console.log("✅ seedCuentasSubgrupos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedCuentasSubgrupos:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}