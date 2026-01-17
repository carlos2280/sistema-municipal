import { cuentasSubgrupos } from "../../database";
import type { DbExecutor } from "../../types/db";

export async function seedCuentasSubgrupos(db: DbExecutor) {
    const datos = [
        {
            codigo: "1",
            nombre: "Activo",
            idTituloCuenta: 1,
            parent_id: null,
            tipoCuentaId: 1,
        },
        { codigo: "2", nombre: "Pasivo", parent_id: null, tipoCuentaId: 1 },
        { codigo: "3", nombre: "Patrimonio", parent_id: null, tipoCuentaId: 1 },
        {
            codigo: "4",
            nombre: "Ingresos Patrimoniales",
            parent_id: null,
            tipoCuentaId: 1,
        },
        {
            codigo: "5",
            nombre: "Gastos Patrimoniales",
            parent_id: null,
            tipoCuentaId: 1,
        },
        {
            codigo: "6",
            nombre: "Cuenta de orden acreedora",
            parent_id: null,
            tipoCuentaId: 1,
        },
        {
            codigo: "11",
            nombre: "Recursos Disponibles",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "12",
            nombre: "Bienes Financieros",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "13",
            nombre: "Bienes de Consumo y Existencias",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "14",
            nombre: "Bienes de Uso",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "15",
            nombre: "Otros Bienes",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "16",
            nombre: "Costos de Proyectos",
            parent_id: 1,
            tipoCuentaId: 2,
        },
        {
            codigo: "18",
            nombre: "Otros Activos no Financieros",
            parent_id: 1,
            tipoCuentaId: 2,
        },
    ];

    try {
        console.log("🌱 Insertando titulos cuentas...");
        await db.insert(cuentasSubgrupos).values(datos);
        console.log("✅ seedCuentasSubgrupos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedCuentasSubgrupos:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}
