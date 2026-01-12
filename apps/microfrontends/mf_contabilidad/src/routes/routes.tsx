import ContabilidadAnalisisPorRut from "../page/contabilidad/ContabilidadAnalisisPorRut";
import ContabilidadInformes from "../page/contabilidad/ContabilidadInformes";
import ContabilidadIngresoMovimientos from "../page/contabilidad/ContabilidadIngresoMovimientos";
import ContabilidadSaldosIniciales from "../page/contabilidad/ContabilidadSaldosIniciales";
import DecretoPagoInformes from "../page/decretoPago/DecretoPagoInformes";
import DecretoPagoIngresoDecreto from "../page/decretoPago/DecretoPagoIngresoDecreto";
import DocumentoGarantiaInformes from "../page/documentoGarantia/DocumentoGarantiaInformes";
import DocumentoGarantiaIngresoDocumentos from "../page/documentoGarantia/DocumentoGarantiaIngresoDocumentos";
import ParametrosMantendor from "../page/parametros/ParametrosMantendor";
import PlanDeCuentas from "../page/planDeCuentas/PlanDeCuentas";
import PresupuestoActualizaciones from "../page/presupuesto/PresupuestoActualizaciones";
import PresupuestoEjecucionPresupuestaria from "../page/presupuesto/PresupuestoEjecucionPresupuestaria";
import PresupuestoInformes from "../page/presupuesto/PresupuestoInformes";
import PresupuestoInicial from "../page/presupuesto/PresupuestoInicial";

const contabilidadRoutes = {
	sistemaId: 2,
	components: {
		plan_de_cuentas: <PlanDeCuentas />,
		presupuesto_inicial: <PresupuestoInicial />,
		presupuesto_actualizaciones: <PresupuestoActualizaciones />,
		presupuesto_informes: <PresupuestoInformes />,
		presupuesto_ejecucion_presuestaria: <PresupuestoEjecucionPresupuestaria />,
		contabilidad_ingreso_movimientos: <ContabilidadIngresoMovimientos />,
		contabilidad_analisis_por_rut: <ContabilidadAnalisisPorRut />,
		contabilidad_saldos_iniciales: <ContabilidadSaldosIniciales />,
		contabilidad_informes: <ContabilidadInformes />,
		decreto_pago_ingreso_directo: <DecretoPagoIngresoDecreto />,
		decreto_pago_informes: <DecretoPagoInformes />,
		documento_garantia_ingreso_documentos: (
			<DocumentoGarantiaIngresoDocumentos />
		),
		documento_garantia_informes: <DocumentoGarantiaInformes />,
		parametros_mantenedor: <ParametrosMantendor />,
	},
};

export default contabilidadRoutes;
