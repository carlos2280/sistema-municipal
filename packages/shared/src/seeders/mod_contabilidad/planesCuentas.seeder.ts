import { cuentasSubgrupos, planesCuentas } from "../../database";
import { eq } from "drizzle-orm";
import type { DbExecutor } from "../../types/db";

export async function seedPlanesCuentas(db: DbExecutor) {
    try {
        console.log("🌱 Insertando planes de cuentas...");

        // Obtener el subgrupo "111 - Disponibilidades en Moneda Nacional"
        const [subgrupo111] = await db
            .select({ id: cuentasSubgrupos.id })
            .from(cuentasSubgrupos)
            .where(eq(cuentasSubgrupos.codigo, "111"));

        if (!subgrupo111) {
            console.warn("⚠️ Subgrupo 111 no encontrado, saltando seed de planesCuentas");
            return;
        }

        // ====================================================================
        // Cuentas Nivel 1 (tipoCuentaId = 4) - XXX-00
        // ====================================================================
        const cuentasNivel1 = [
            {
                anoContable: 2025,
                codigo: "11101",
                nombre: "Caja",
                subgrupoId: subgrupo111.id,
                codigoIni: "01",
                tipoCuentaId: 4
            },
            {
                anoContable: 2025,
                codigo: "11102",
                nombre: "Banco Estado",
                subgrupoId: subgrupo111.id,
                codigoIni: "02",
                tipoCuentaId: 4
            },
            {
                anoContable: 2025,
                codigo: "11103",
                nombre: "Banco Sistema Financiero",
                subgrupoId: subgrupo111.id,
                codigoIni: "03",
                tipoCuentaId: 4
            },
            {
                anoContable: 2025,
                codigo: "11108",
                nombre: "Fondos por Enterar al Fondo Común Municipal",
                subgrupoId: subgrupo111.id,
                codigoIni: "08",
                tipoCuentaId: 4
            },
        ];

        // Insertar cuentas nivel 1
        const insertadas = await db
            .insert(planesCuentas)
            .values(cuentasNivel1)
            .returning({ id: planesCuentas.id, codigo: planesCuentas.codigo });

        // Mapear códigos a IDs
        const idPorCodigo = new Map(insertadas.map((c) => [c.codigo, c.id]));

        // ====================================================================
        // Cuentas Nivel 2 (tipoCuentaId = 5) - XXX-00-00
        // ====================================================================
        const cuentasNivel2 = [
            // Subcuentas de 111-01 Caja
            {
                anoContable: 2025,
                codigo: "1110101",
                nombre: "Caja Chica Municipal",
                subgrupoId: subgrupo111.id,
                parentId: idPorCodigo.get("11101"),
                codigoIni: "01",
                tipoCuentaId: 5
            },
            {
                anoContable: 2025,
                codigo: "1110102",
                nombre: "Caja Recaudadora",
                subgrupoId: subgrupo111.id,
                parentId: idPorCodigo.get("11101"),
                codigoIni: "02",
                tipoCuentaId: 5
            },
            // Subcuentas de 111-02 Banco Estado
            {
                anoContable: 2025,
                codigo: "1110201",
                nombre: "Cuenta Corriente Principal",
                subgrupoId: subgrupo111.id,
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
