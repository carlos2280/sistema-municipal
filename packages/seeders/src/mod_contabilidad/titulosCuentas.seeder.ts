import { sql } from "drizzle-orm";
import { cuentasSubgrupos, planesCuentas, tiposCuentas } from "@municipal/db-contabilidad";
import type { DbExecutor } from "../types/db";

export async function seedTitulosCuentas(db: DbExecutor) {
        // 8 tipos con IDs fijos: Titulo(1), Grupo(2), Subgrupo(3), Nivel2(4)...Nivel6(8)
        const datos = [
                { id: 1, codigo: 'CT', nombre: "Cuenta titulo" },
                { id: 2, codigo: 'CG', nombre: "Cuenta grupo" },
                { id: 3, codigo: 'CN1', nombre: "Nivel 1 (Subgrupo)" },
                { id: 4, codigo: 'CN2', nombre: "Nivel 2" },
                { id: 5, codigo: 'CN3', nombre: "Nivel 3" },
                { id: 6, codigo: 'CN4', nombre: "Nivel 4" },
                { id: 7, codigo: 'CN5', nombre: "Nivel 5" },
                { id: 8, codigo: 'CN6', nombre: "Nivel 6" },
        ];

        try {
                console.log("🌱 Insertando tipos de cuentas...");
                // Limpiar FK-safe: planes → subgrupos → tipos
                await db.delete(planesCuentas);
                await db.delete(cuentasSubgrupos);
                await db.delete(tiposCuentas);
                await db.insert(tiposCuentas).values(datos);
                // Resetear secuencia para que el próximo ID sea 9
                await db.execute(sql`SELECT setval(pg_get_serial_sequence('contabilidad.tipos_cuentas', 'id'), 8)`);
                console.log("✅ seedTitulosCuentas insertados correctamente");
        } catch (error) {
                console.error("❌ Error insertando seedTitulosCuentas:", error);
                throw error;
        }
}
