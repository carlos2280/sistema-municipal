import { cuentasSubgrupos, planesCuentas } from "../../";
import { eq } from "drizzle-orm";
import type { DbExecutor } from "../../../types/db";

export async function seedPlanesCuentas(db: DbExecutor) {
    try {
        console.log("🌱 Insertando planes de cuentas...");

        // Obtener todos los subgrupos necesarios
        const subgrupos = await db
            .select({ id: cuentasSubgrupos.id, codigo: cuentasSubgrupos.codigo })
            .from(cuentasSubgrupos);

        const subgrupoPorCodigo = new Map(subgrupos.map((s) => [s.codigo, s.id]));

        const getSubgrupoId = (codigo: string): number => {
            const id = subgrupoPorCodigo.get(codigo);
            if (!id) throw new Error(`Subgrupo ${codigo} no encontrado`);
            return id;
        };

        const ANO = 2025;

        // ====================================================================
        // Cuentas Nivel 1 (tipoCuentaId = 4) - XXX-00
        // ====================================================================
        const cuentasNivel1 = [
            // ── 111: Disponibilidades en Moneda Nacional ──
            { anoContable: ANO, codigo: "11101", nombre: "Caja", subgrupoId: getSubgrupoId("111"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11102", nombre: "Banco Estado", subgrupoId: getSubgrupoId("111"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11103", nombre: "Banco Sistema Financiero", subgrupoId: getSubgrupoId("111"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11108", nombre: "Fondos por Enterar al Fondo Comun Municipal", subgrupoId: getSubgrupoId("111"), codigoIni: "08", tipoCuentaId: 4 },

            // ── 114: Anticipos y Aplicacion de Fondos ──
            { anoContable: ANO, codigo: "11401", nombre: "Anticipo de Fondos a Rendir", subgrupoId: getSubgrupoId("114"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11402", nombre: "Anticipos a Contratistas", subgrupoId: getSubgrupoId("114"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11403", nombre: "Anticipos por Cambio de Residencia", subgrupoId: getSubgrupoId("114"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11404", nombre: "Anticipos de Remuneraciones", subgrupoId: getSubgrupoId("114"), codigoIni: "04", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "11405", nombre: "Anticipos a Proveedores", subgrupoId: getSubgrupoId("114"), codigoIni: "05", tipoCuentaId: 4 },

            // ── 115: Deudores Presupuestarios (con contraCuenta) ──
            { anoContable: ANO, codigo: "11501", nombre: "Deudores por Ingresos Tributarios", subgrupoId: getSubgrupoId("115"), codigoIni: "01", tipoCuentaId: 4, contraCuenta: "411" },
            { anoContable: ANO, codigo: "11502", nombre: "Deudores por Venta de Activos no Financieros", subgrupoId: getSubgrupoId("115"), codigoIni: "02", tipoCuentaId: 4, contraCuenta: "412" },
            { anoContable: ANO, codigo: "11503", nombre: "Deudores por Recuperacion de Prestamos", subgrupoId: getSubgrupoId("115"), codigoIni: "03", tipoCuentaId: 4, contraCuenta: "413" },
            { anoContable: ANO, codigo: "11504", nombre: "Deudores por Transferencias Corrientes", subgrupoId: getSubgrupoId("115"), codigoIni: "04", tipoCuentaId: 4, contraCuenta: "421" },
            { anoContable: ANO, codigo: "11505", nombre: "Deudores por Ingresos de Operacion", subgrupoId: getSubgrupoId("115"), codigoIni: "05", tipoCuentaId: 4, contraCuenta: "416" },
            { anoContable: ANO, codigo: "11506", nombre: "Deudores por Rentas de la Propiedad", subgrupoId: getSubgrupoId("115"), codigoIni: "06", tipoCuentaId: 4, contraCuenta: "431" },
            { anoContable: ANO, codigo: "11507", nombre: "Deudores por Participacion FCM", subgrupoId: getSubgrupoId("115"), codigoIni: "07", tipoCuentaId: 4, contraCuenta: "415" },
            { anoContable: ANO, codigo: "11508", nombre: "Deudores por Multas y Sanciones", subgrupoId: getSubgrupoId("115"), codigoIni: "08", tipoCuentaId: 4, contraCuenta: "414" },

            // ── 213: Retenciones ──
            { anoContable: ANO, codigo: "21301", nombre: "Impuesto Unico a los Trabajadores", subgrupoId: getSubgrupoId("213"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "21302", nombre: "Retencion AFP", subgrupoId: getSubgrupoId("213"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "21303", nombre: "Retencion Salud", subgrupoId: getSubgrupoId("213"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "21304", nombre: "Otras Retenciones", subgrupoId: getSubgrupoId("213"), codigoIni: "04", tipoCuentaId: 4 },

            // ── 215: Acreedores Presupuestarios (con contraCuenta) ──
            { anoContable: ANO, codigo: "21501", nombre: "Acreedores por Gastos en Personal", subgrupoId: getSubgrupoId("215"), codigoIni: "01", tipoCuentaId: 4, contraCuenta: "511" },
            { anoContable: ANO, codigo: "21502", nombre: "Acreedores por Bienes y Servicios de Consumo", subgrupoId: getSubgrupoId("215"), codigoIni: "02", tipoCuentaId: 4, contraCuenta: "521" },
            { anoContable: ANO, codigo: "21503", nombre: "Acreedores por Prestaciones de Seguridad Social", subgrupoId: getSubgrupoId("215"), codigoIni: "03", tipoCuentaId: 4, contraCuenta: "531" },
            { anoContable: ANO, codigo: "21504", nombre: "Acreedores por Transferencias Corrientes", subgrupoId: getSubgrupoId("215"), codigoIni: "04", tipoCuentaId: 4, contraCuenta: "541" },
            { anoContable: ANO, codigo: "21505", nombre: "Acreedores por Adquisicion de Activos no Financieros", subgrupoId: getSubgrupoId("215"), codigoIni: "05", tipoCuentaId: 4, contraCuenta: "551" },
            { anoContable: ANO, codigo: "21506", nombre: "Acreedores por Servicio de la Deuda", subgrupoId: getSubgrupoId("215"), codigoIni: "06", tipoCuentaId: 4, contraCuenta: "551" },
            { anoContable: ANO, codigo: "21507", nombre: "Acreedores por Otros Gastos", subgrupoId: getSubgrupoId("215"), codigoIni: "07", tipoCuentaId: 4, contraCuenta: "551" },

            // ── 311: Patrimonio Institucional ──
            { anoContable: ANO, codigo: "31101", nombre: "Patrimonio Institucional", subgrupoId: getSubgrupoId("311"), codigoIni: "01", tipoCuentaId: 4 },

            // ── 321: Resultado Acumulado ──
            { anoContable: ANO, codigo: "32101", nombre: "Resultado Acumulado de Ejercicios Anteriores", subgrupoId: getSubgrupoId("321"), codigoIni: "01", tipoCuentaId: 4 },

            // ── 322: Resultado del Ejercicio ──
            { anoContable: ANO, codigo: "32201", nombre: "Resultado del Ejercicio", subgrupoId: getSubgrupoId("322"), codigoIni: "01", tipoCuentaId: 4 },

            // ── 511: Remuneraciones ──
            { anoContable: ANO, codigo: "51101", nombre: "Sueldos y Sobresueldos", subgrupoId: getSubgrupoId("511"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "51102", nombre: "Asignaciones Especiales", subgrupoId: getSubgrupoId("511"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "51103", nombre: "Remuneraciones Variables", subgrupoId: getSubgrupoId("511"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "51104", nombre: "Aguinaldos y Bonificaciones", subgrupoId: getSubgrupoId("511"), codigoIni: "04", tipoCuentaId: 4 },

            // ── 512: Aportes del Empleador ──
            { anoContable: ANO, codigo: "51201", nombre: "Aporte Patronal", subgrupoId: getSubgrupoId("512"), codigoIni: "01", tipoCuentaId: 4 },

            // ── 411: Ingresos Tributarios ──
            { anoContable: ANO, codigo: "41101", nombre: "Impuesto Territorial", subgrupoId: getSubgrupoId("411"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "41102", nombre: "Permisos de Circulacion", subgrupoId: getSubgrupoId("411"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "41103", nombre: "Patentes Municipales", subgrupoId: getSubgrupoId("411"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "41104", nombre: "Derechos de Aseo", subgrupoId: getSubgrupoId("411"), codigoIni: "04", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "41105", nombre: "Otros Ingresos Tributarios", subgrupoId: getSubgrupoId("411"), codigoIni: "05", tipoCuentaId: 4 },

            // ── 415: Participacion en Fondo Comun Municipal ──
            { anoContable: ANO, codigo: "41501", nombre: "Participacion en Fondo Comun Municipal", subgrupoId: getSubgrupoId("415"), codigoIni: "01", tipoCuentaId: 4 },

            // ── 416: Ingresos de Operacion de Servicios ──
            { anoContable: ANO, codigo: "41601", nombre: "Derechos Municipales", subgrupoId: getSubgrupoId("416"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "41602", nombre: "Licencias y Permisos", subgrupoId: getSubgrupoId("416"), codigoIni: "02", tipoCuentaId: 4 },

            // ── 525: Servicios Basicos ──
            { anoContable: ANO, codigo: "52501", nombre: "Electricidad", subgrupoId: getSubgrupoId("525"), codigoIni: "01", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "52502", nombre: "Agua", subgrupoId: getSubgrupoId("525"), codigoIni: "02", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "52503", nombre: "Gas", subgrupoId: getSubgrupoId("525"), codigoIni: "03", tipoCuentaId: 4 },
            { anoContable: ANO, codigo: "52504", nombre: "Telefonia e Internet", subgrupoId: getSubgrupoId("525"), codigoIni: "04", tipoCuentaId: 4 },
        ];

        // Insertar cuentas nivel 1
        const insertadas = await db
            .insert(planesCuentas)
            .values(cuentasNivel1)
            .returning({ id: planesCuentas.id, codigo: planesCuentas.codigo });

        // Mapear codigos a IDs
        const idPorCodigo = new Map(insertadas.map((c) => [c.codigo, c.id]));

        // ====================================================================
        // Cuentas Nivel 2 (tipoCuentaId = 5) - XXX-00-00
        // ====================================================================
        const cuentasNivel2 = [
            // Subcuentas de 111-01 Caja
            {
                anoContable: ANO,
                codigo: "1110101",
                nombre: "Caja Chica Municipal",
                subgrupoId: getSubgrupoId("111"),
                parentId: idPorCodigo.get("11101"),
                codigoIni: "01",
                tipoCuentaId: 5
            },
            {
                anoContable: ANO,
                codigo: "1110102",
                nombre: "Caja Recaudadora",
                subgrupoId: getSubgrupoId("111"),
                parentId: idPorCodigo.get("11101"),
                codigoIni: "02",
                tipoCuentaId: 5
            },
            // Subcuentas de 111-02 Banco Estado
            {
                anoContable: ANO,
                codigo: "1110201",
                nombre: "Cuenta Corriente Principal",
                subgrupoId: getSubgrupoId("111"),
                parentId: idPorCodigo.get("11102"),
                codigoIni: "01",
                tipoCuentaId: 5
            },
        ];

        if (cuentasNivel2.length > 0) {
            await db.insert(planesCuentas).values(cuentasNivel2);
        }

        console.log("✅ seedPlanesCuentas insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedPlanesCuentas:", error);
        throw error;
    }
}
