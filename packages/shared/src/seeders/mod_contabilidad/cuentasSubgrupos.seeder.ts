import { cuentasSubgrupos } from "../../database";
import type { DbExecutor } from "../../types/db";

export async function seedCuentasSubgrupos(db: DbExecutor) {
    // ========================================================================
    // Paso 1: Insertar Títulos (tipo_cuenta_id = 1) - sin padre
    // ========================================================================
    const titulos = [
        { codigo: "1", nombre: "Activo", tipoCuentaId: 1 },
        { codigo: "2", nombre: "Pasivo", tipoCuentaId: 1 },
        { codigo: "3", nombre: "Patrimonio", tipoCuentaId: 1 },
        { codigo: "4", nombre: "Ingresos Patrimoniales", tipoCuentaId: 1 },
        { codigo: "5", nombre: "Gastos Patrimoniales", tipoCuentaId: 1 },
        { codigo: "6", nombre: "Cuenta de orden acreedora", tipoCuentaId: 1 },
    ];

    try {
        console.log("🌱 Insertando títulos de cuentas...");
        const titulosInsertados = await db
            .insert(cuentasSubgrupos)
            .values(titulos)
            .returning({ id: cuentasSubgrupos.id, codigo: cuentasSubgrupos.codigo });

        // Mapear códigos a IDs
        const idPorCodigo = new Map(titulosInsertados.map((t) => [t.codigo, t.id]));

        // ====================================================================
        // Paso 2: Insertar Grupos (tipo_cuenta_id = 2) - hijos de títulos
        // ====================================================================
        const grupos = [
            // Grupos de 1-Activo
            { codigo: "11", nombre: "Recursos Disponibles", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "12", nombre: "Bienes Financieros", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "13", nombre: "Bienes de Consumo y Existencias", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "14", nombre: "Bienes de Uso", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "15", nombre: "Otros Bienes", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "16", nombre: "Costos de Proyectos", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            { codigo: "18", nombre: "Otros Activos no Financieros", parentId: idPorCodigo.get("1"), tipoCuentaId: 2 },
            // Grupos de 2-Pasivo
            { codigo: "21", nombre: "Deudas a Corto Plazo", parentId: idPorCodigo.get("2"), tipoCuentaId: 2 },
            { codigo: "22", nombre: "Deudas a Largo Plazo", parentId: idPorCodigo.get("2"), tipoCuentaId: 2 },
            { codigo: "23", nombre: "Provisiones", parentId: idPorCodigo.get("2"), tipoCuentaId: 2 },
            // Grupos de 3-Patrimonio
            { codigo: "31", nombre: "Patrimonio Inicial", parentId: idPorCodigo.get("3"), tipoCuentaId: 2 },
            { codigo: "32", nombre: "Reservas", parentId: idPorCodigo.get("3"), tipoCuentaId: 2 },
            // Grupos de 4-Ingresos Patrimoniales
            { codigo: "41", nombre: "Ingresos de Operación", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            { codigo: "42", nombre: "Transferencias Corrientes", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            // Grupos de 5-Gastos Patrimoniales
            { codigo: "51", nombre: "Gastos en Personal", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            { codigo: "52", nombre: "Bienes y Servicios de Consumo", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
        ];

        console.log("🌱 Insertando grupos de cuentas...");
        const gruposInsertados = await db
            .insert(cuentasSubgrupos)
            .values(grupos)
            .returning({ id: cuentasSubgrupos.id, codigo: cuentasSubgrupos.codigo });

        // Agregar grupos insertados al mapa
        for (const g of gruposInsertados) {
            idPorCodigo.set(g.codigo, g.id);
        }

        // ====================================================================
        // Paso 3: Insertar Nivel 1 (tipo_cuenta_id = 3) - hijos de grupos
        // ====================================================================
        const nivel1 = [
            // Subgrupos de 11-Recursos Disponibles
            { codigo: "111", nombre: "Disponibilidades en Moneda Nacional", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "113", nombre: "Fondos Especiales", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "114", nombre: "Anticipos y Aplicación de Fondos", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "115", nombre: "Deudores Presupuestarios", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "116", nombre: "Ajuste a Disponibilidades", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
        ];

        console.log("🌱 Insertando subgrupos nivel 1...");
        await db.insert(cuentasSubgrupos).values(nivel1);

        console.log("✅ seedCuentasSubgrupos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedCuentasSubgrupos:", error);
        throw error;
    }
}
