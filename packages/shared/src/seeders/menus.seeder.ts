import { menus } from "../database";
import type { DbExecutor } from "../types/db";

export async function seedMenus(db: DbExecutor) {
    const datos = [
        //Los padres - inicio

        {
            idSistema: 1,
            idPadre: null,
            nombre: "Plan de Cuentas",
            icono: "book-open",
            componente: "plan_de_cuentas",
            visible: true,
            nivel: 1,
            orden: 1,
        },

        {
            // id--> 2
            idSistema: 1,
            idPadre: null,
            nombre: "Presupuesto",
            icono: "wallet",
            componente: null,
            visible: true,
            nivel: 1,
            orden: 2,
        },

        {
            // id--> 3
            idSistema: 1,
            idPadre: null,
            nombre: "Contabilidad",
            icono: "calculator",
            componente: null,
            visible: true,
            nivel: 1,
            orden: 3,
        },
        {
            // id--> 4
            idSistema: 1,
            idPadre: null,
            nombre: "Decreto Pago",
            icono: "hand-coins",
            componente: null,
            visible: true,
            nivel: 1,
            orden: 4,
        },
        {
            // id--> 5
            idSistema: 1,
            idPadre: null,
            nombre: "Doc. Garantia",
            icono: "file-lock",
            componente: "",
            visible: true,
            nivel: 1,
            orden: 5,
        },

        {
            // id--> 6
            idSistema: 1,
            idPadre: null,
            nombre: "Parametros",
            icono: "settings",
            componente: null,
            visible: true,
            nivel: 1,
            orden: 6,
        },
        //Los padres - fin

        //Los hijos de Presupuesto (id-->2) - inicio
        {
            idSistema: 1,
            idPadre: 2,
            nombre: "Inicial",
            icono: "user-check",
            componente: "presupuesto_inicial",
            visible: true,
            nivel: 2,
            orden: 1,
        },

        {
            idSistema: 1,
            idPadre: 2,
            nombre: "Actualizaciones",
            icono: "user-check",
            componente: "presupuesto_actualizaciones",
            visible: true,
            nivel: 2,
            orden: 2,
        },

        {
            idSistema: 1,
            idPadre: 2,
            nombre: "Informes",
            icono: "user-check",
            componente: "presupuesto_informes",
            visible: true,
            nivel: 2,
            orden: 3,
        },
        {
            idSistema: 1,
            idPadre: 2,
            nombre: "Ejecucion Presupuestaria",
            icono: "user-check",
            componente: "presupuesto_ejecucion_presuestaria",
            visible: true,
            nivel: 2,
            orden: 4,
        },

        //Los hijos de Presupuesto (id-->2) - fin

        //Los hijos de Contabilidad (id-->3) - inicio
        {
            idSistema: 1,
            idPadre: 3,
            nombre: "Ingreso Movimientos",
            icono: "user-check",
            componente: "contabilidad_ingreso_movimientos",
            visible: true,
            nivel: 2,
            orden: 1,
        },
        {
            idSistema: 1,
            idPadre: 3,
            nombre: "Analisis por Rut",
            icono: "user-check",
            componente: "contabilidad_analisis_por_rut",
            visible: true,
            nivel: 2,
            orden: 2,
        },
        {
            idSistema: 1,
            idPadre: 3,
            nombre: "Saldos Iniciales",
            icono: "user-check",
            componente: "contabilidad_saldos_iniciales",
            visible: true,
            nivel: 2,
            orden: 3,
        },
        {
            idSistema: 1,
            idPadre: 3,
            nombre: "Informes",
            icono: "user-check",
            componente: "contabilidad_informes",
            visible: true,
            nivel: 2,
            orden: 4,
        },

        //Los hijos de Contabilidad (id-->3) - fin

        //Los hijos de Decteto Pago (id-->4) - inicio
        {
            idSistema: 1,
            idPadre: 4,
            nombre: "Ingreso Decreto",
            icono: null,
            componente: "decreto_pago_ingreso_directo",
            visible: true,
            nivel: 2,
            orden: 1,
        },
        {
            idSistema: 1,
            idPadre: 4,
            nombre: "Informes",
            icono: null,
            componente: "decreto_pago_informes",
            visible: true,
            nivel: 2,
            orden: 2,
        },
        //Los hijos de  Decteto Pago (id-->4) - fin

        //Los hijos de Doc. de garantia (id-->5) - inicio
        {
            idSistema: 1,
            idPadre: 5,
            nombre: "Ingreso Documentos",
            icono: null,
            componente: "documento_garantia_ingreso_documentos",
            visible: true,
            nivel: 2,
            orden: 1,
        },
        {
            idSistema: 1,
            idPadre: 5,
            nombre: "Informes",
            icono: null,
            componente: "documento_garantia_informes",
            visible: true,
            nivel: 2,
            orden: 2,
        },
        //Los hijos de  Doc. de garantia (id-->5) - fin

        //Los hijos de Parametros (id-->6) - inicio
        {
            idSistema: 1,
            idPadre: 6,
            nombre: "Man. Tipos de Ejec. Presupuestaria",
            icono: null,
            componente: null,
            visible: true,
            nivel: 2,
            orden: 1,
        },
        {
            idSistema: 1,
            idPadre: 6,
            nombre: "Mantenedor",
            icono: null,
            componente: "parametros_mantenedor",
            visible: true,
            nivel: 2,
            orden: 2,
        },

        //Los hijos de  Parametros (id-->6) - fin
    ];

    try {
        console.log("🌱 Insertando menu...");
        await db.insert(menus).values(datos);
        console.log("✅ seedMenus insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedMenus:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}
