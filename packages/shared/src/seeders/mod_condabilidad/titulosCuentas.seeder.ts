import { tiposCuentas } from "../../database";
import type { DbExecutor } from "../../types/db";

export async function seedTitulosCuentas(db: DbExecutor) {
        const datos = [
                { codigo: 'CT', nombre: "Cuenta titulo" },
                { codigo: 'CG', nombre: "Cuenta grupo" },
                { codigo: 'CN1', nombre: "Nivel 1" },
                { codigo: 'CN2', nombre: "Nivel 2" },
                { codigo: 'CN3', nombre: "Nivel 3" },
                { codigo: 'CN4', nombre: "Nivel 4" },
                { codigo: 'CN5', nombre: "Nivel 5" },
        ];

        try {
                console.log("🌱 Insertando titulos cuentas...");
                await db.insert(tiposCuentas).values(datos);
                console.log("✅ seedTitulosCuentas insertados correctamente");
        } catch (error) {
                console.error("❌ Error insertando seedTitulosCuentas:", error);
                throw error; // Propaga el error para que lo capture el maestro
        }
}