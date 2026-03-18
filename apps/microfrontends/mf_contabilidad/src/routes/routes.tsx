import ContabilidadAnalisisPorRut from '../pages/contabilidad/ContabilidadAnalisisPorRut';
import ContabilidadInformes from '../pages/contabilidad/ContabilidadInformes';
import ContabilidadIngresoMovimientos from '../pages/contabilidad/ContabilidadIngresoMovimientos';
import ContabilidadSaldosIniciales from '../pages/contabilidad/ContabilidadSaldosIniciales';
import DecretoPagoInformes from '../pages/decretoPago/DecretoPagoInformes';
import DecretoPagoIngresoDecreto from '../pages/decretoPago/DecretoPagoIngresoDecreto';
import DocumentoGarantiaInformes from '../pages/documentoGarantia/DocumentoGarantiaInformes';
import DocumentoGarantiaIngresoDocumentos from '../pages/documentoGarantia/DocumentoGarantiaIngresoDocumentos';
import ParametrosMantendor from '../pages/parametros/ParametrosMantendor';
import PlanDeCuentas from '../pages/planDeCuentas/PlanDeCuentas';
import PresupuestoActualizaciones from '../pages/presupuesto/PresupuestoActualizaciones';
import PresupuestoEjecucionPresupuestaria from '../pages/presupuesto/PresupuestoEjecucionPresupuestaria';
import PresupuestoInformes from '../pages/presupuesto/PresupuestoInformes';
import PresupuestoInicial from '../pages/presupuesto/PresupuestoInicial';

const contabilidadRoutes = {
  sistemaId: 1,
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
