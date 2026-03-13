import { cuentasSubgrupos, planesCuentas } from "@municipal/db-contabilidad";
import type { DbExecutor } from "../types/db";

export async function seedCuentasSubgrupos(db: DbExecutor) {
    // Limpiar datos existentes (planes primero por FK, luego subgrupos)
    console.log("🧹 Limpiando planes de cuentas y subgrupos existentes...");
    await db.delete(planesCuentas);
    await db.delete(cuentasSubgrupos);

    // ========================================================================
    // Paso 1: Insertar Titulos (tipo_cuenta_id = 1) - sin padre
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
        console.log("🌱 Insertando titulos de cuentas...");
        const titulosInsertados = await db
            .insert(cuentasSubgrupos)
            .values(titulos)
            .returning({ id: cuentasSubgrupos.id, codigo: cuentasSubgrupos.codigo });

        // Mapear codigos a IDs
        const idPorCodigo = new Map(titulosInsertados.map((t) => [t.codigo, t.id]));

        // ====================================================================
        // Paso 2: Insertar Grupos (tipo_cuenta_id = 2) - hijos de titulos
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
            { codigo: "41", nombre: "Ingresos de Operacion", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            { codigo: "42", nombre: "Transferencias Corrientes", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            { codigo: "43", nombre: "Rentas de la Propiedad", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            { codigo: "44", nombre: "Otros Ingresos", parentId: idPorCodigo.get("4"), tipoCuentaId: 2 },
            // Grupos de 5-Gastos Patrimoniales
            { codigo: "51", nombre: "Gastos en Personal", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            { codigo: "52", nombre: "Bienes y Servicios de Consumo", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            { codigo: "53", nombre: "Prestaciones de Seguridad Social", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            { codigo: "54", nombre: "Transferencias Corrientes", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            { codigo: "55", nombre: "Otros Gastos", parentId: idPorCodigo.get("5"), tipoCuentaId: 2 },
            // Grupos de 6-Cuenta de orden acreedora
            { codigo: "61", nombre: "Cuentas de Orden Acreedoras", parentId: idPorCodigo.get("6"), tipoCuentaId: 2 },
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
            // ── Grupo 11: Recursos Disponibles ──
            { codigo: "111", nombre: "Disponibilidades en Moneda Nacional", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "112", nombre: "Disponibilidades en Moneda Extranjera", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "113", nombre: "Fondos Especiales", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "114", nombre: "Anticipos y Aplicacion de Fondos", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "115", nombre: "Deudores Presupuestarios", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            { codigo: "116", nombre: "Ajuste a Disponibilidades", parentId: idPorCodigo.get("11"), tipoCuentaId: 3 },
            // ── Grupo 12: Bienes Financieros ──
            { codigo: "121", nombre: "Inversiones Financieras de Corto Plazo", parentId: idPorCodigo.get("12"), tipoCuentaId: 3 },
            { codigo: "122", nombre: "Inversiones Financieras de Largo Plazo", parentId: idPorCodigo.get("12"), tipoCuentaId: 3 },
            { codigo: "123", nombre: "Cuentas por Cobrar de Corto Plazo", parentId: idPorCodigo.get("12"), tipoCuentaId: 3 },
            { codigo: "124", nombre: "Cuentas por Cobrar de Largo Plazo", parentId: idPorCodigo.get("12"), tipoCuentaId: 3 },
            // ── Grupo 13: Bienes de Consumo y Existencias ──
            { codigo: "131", nombre: "Existencias", parentId: idPorCodigo.get("13"), tipoCuentaId: 3 },
            // ── Grupo 14: Bienes de Uso ──
            { codigo: "141", nombre: "Terrenos", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "142", nombre: "Edificios", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "143", nombre: "Vehiculos", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "144", nombre: "Mobiliario y Otros", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "145", nombre: "Maquinaria y Equipo", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "146", nombre: "Equipos Informaticos", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "147", nombre: "Programas Informaticos", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            { codigo: "148", nombre: "Depreciacion Acumulada", parentId: idPorCodigo.get("14"), tipoCuentaId: 3 },
            // ── Grupo 15: Otros Bienes ──
            { codigo: "151", nombre: "Bienes Intangibles", parentId: idPorCodigo.get("15"), tipoCuentaId: 3 },
            // ── Grupo 16: Costos de Proyectos ──
            { codigo: "161", nombre: "Proyectos en Ejecucion", parentId: idPorCodigo.get("16"), tipoCuentaId: 3 },
            // ── Grupo 18: Otros Activos no Financieros ──
            { codigo: "181", nombre: "Otros Activos no Financieros", parentId: idPorCodigo.get("18"), tipoCuentaId: 3 },
            // ── Grupo 21: Deudas a Corto Plazo ──
            { codigo: "211", nombre: "Deudas Corrientes", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            { codigo: "212", nombre: "Documentos por Pagar", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            { codigo: "213", nombre: "Retenciones", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            { codigo: "214", nombre: "Depositos de Terceros", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            { codigo: "215", nombre: "Acreedores Presupuestarios", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            { codigo: "216", nombre: "Ajuste a Deudas", parentId: idPorCodigo.get("21"), tipoCuentaId: 3 },
            // ── Grupo 22: Deudas a Largo Plazo ──
            { codigo: "221", nombre: "Deudas a Largo Plazo", parentId: idPorCodigo.get("22"), tipoCuentaId: 3 },
            // ── Grupo 23: Provisiones ──
            { codigo: "231", nombre: "Provisiones", parentId: idPorCodigo.get("23"), tipoCuentaId: 3 },
            // ── Grupo 31: Patrimonio Inicial ──
            { codigo: "311", nombre: "Patrimonio Institucional", parentId: idPorCodigo.get("31"), tipoCuentaId: 3 },
            // ── Grupo 32: Reservas ──
            { codigo: "321", nombre: "Resultado Acumulado", parentId: idPorCodigo.get("32"), tipoCuentaId: 3 },
            { codigo: "322", nombre: "Resultado del Ejercicio", parentId: idPorCodigo.get("32"), tipoCuentaId: 3 },
            // ── Grupo 41: Ingresos de Operacion ──
            { codigo: "411", nombre: "Ingresos Tributarios", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            { codigo: "412", nombre: "Venta de Activos no Financieros", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            { codigo: "413", nombre: "Recuperacion de Prestamos", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            { codigo: "414", nombre: "Ingresos por Multas y Sanciones", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            { codigo: "415", nombre: "Participacion en Fondo Comun Municipal", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            { codigo: "416", nombre: "Ingresos de Operacion de Servicios", parentId: idPorCodigo.get("41"), tipoCuentaId: 3 },
            // ── Grupo 42: Transferencias Corrientes ──
            { codigo: "421", nombre: "Transferencias Corrientes del Sector Publico", parentId: idPorCodigo.get("42"), tipoCuentaId: 3 },
            { codigo: "422", nombre: "Transferencias Corrientes del Sector Privado", parentId: idPorCodigo.get("42"), tipoCuentaId: 3 },
            // ── Grupo 43: Rentas de la Propiedad ──
            { codigo: "431", nombre: "Rentas de la Propiedad", parentId: idPorCodigo.get("43"), tipoCuentaId: 3 },
            // ── Grupo 44: Otros Ingresos ──
            { codigo: "441", nombre: "Otros Ingresos Patrimoniales", parentId: idPorCodigo.get("44"), tipoCuentaId: 3 },
            // ── Grupo 51: Gastos en Personal ──
            { codigo: "511", nombre: "Remuneraciones", parentId: idPorCodigo.get("51"), tipoCuentaId: 3 },
            { codigo: "512", nombre: "Aportes del Empleador", parentId: idPorCodigo.get("51"), tipoCuentaId: 3 },
            // ── Grupo 52: Bienes y Servicios de Consumo ──
            { codigo: "521", nombre: "Alimentos y Bebidas", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "522", nombre: "Textiles, Vestuario y Calzado", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "523", nombre: "Combustibles y Lubricantes", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "524", nombre: "Materiales de Uso o Consumo", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "525", nombre: "Servicios Basicos", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "526", nombre: "Mantenimiento y Reparaciones", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "527", nombre: "Publicidad y Difusion", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "528", nombre: "Servicios Generales", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            { codigo: "529", nombre: "Arriendos", parentId: idPorCodigo.get("52"), tipoCuentaId: 3 },
            // ── Grupo 53: Prestaciones de Seguridad Social ──
            { codigo: "531", nombre: "Prestaciones Previsionales", parentId: idPorCodigo.get("53"), tipoCuentaId: 3 },
            // ── Grupo 54: Transferencias Corrientes ──
            { codigo: "541", nombre: "Transferencias al Sector Publico", parentId: idPorCodigo.get("54"), tipoCuentaId: 3 },
            { codigo: "542", nombre: "Transferencias al Sector Privado", parentId: idPorCodigo.get("54"), tipoCuentaId: 3 },
            // ── Grupo 55: Otros Gastos ──
            { codigo: "551", nombre: "Otros Gastos Patrimoniales", parentId: idPorCodigo.get("55"), tipoCuentaId: 3 },
            // ── Grupo 61: Cuentas de Orden Acreedoras ──
            { codigo: "611", nombre: "Cuentas de Orden por Garantias", parentId: idPorCodigo.get("61"), tipoCuentaId: 3 },
        ];

        console.log("🌱 Insertando subgrupos nivel 1...");
        await db.insert(cuentasSubgrupos).values(nivel1);

        console.log("✅ seedCuentasSubgrupos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedCuentasSubgrupos:", error);
        throw error;
    }
}
