import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HistoryIcon from "@mui/icons-material/History";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import ScaleIcon from "@mui/icons-material/Scale";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useLayoutEffect, useRef } from "react";
import { FormProvider } from "react-hook-form";
import DiscrepanciaBanner from "../../components/presupuesto/molecules/DiscrepanciaBanner";
import DeleteLineaDialog from "../../components/presupuesto/molecules/DeleteLineaDialog";
import PresupuestoHeader from "../../components/presupuesto/molecules/PresupuestoHeader";
import PresupuestoToolbar from "../../components/presupuesto/molecules/PresupuestoToolbar";
import PresupuestoGrid from "../../components/presupuesto/organisms/PresupuestoGrid";
import PresupuestoResumen from "../../components/presupuesto/organisms/PresupuestoResumen";
import { usePresupuestoInicial } from "../../hooks/presupuesto/usePresupuestoInicial";

interface PresupuestoInicialProps {
  presupuestoId?: number;
}

const PresupuestoInicial = ({ presupuestoId }: PresupuestoInicialProps) => {
  const {
    tabActivo,
    setTabActivo,
    headerCollapsed,
    setHeaderCollapsed,
    searchIngresos,
    setSearchIngresos,
    searchGastos,
    setSearchGastos,
    confirmDelete,
    setConfirmDelete,
    isSaving,
    isLoadingPresupuesto,
    form,
    anosDisponibles,
    numero,
    centrosCosto,
    cuentasIngresos,
    cuentasGastos,
    loadingCuentasIngresos,
    loadingCuentasGastos,
    detalleIngresos,
    detalleGastos,
    detalleActivo,
    discrepanciasIngresosMap,
    discrepanciasGastosMap,
    filasIngresos,
    filasGastos,
    totalIngresos,
    totalGastos,
    totalDiscrepancias,
    equilibrio,
    handleTabNavigation,
    handleRecalcular,
    handleRecalcularTodo,
    handleImportar,
    handleGuardar,
    handleEliminarPresupuesto,
    handleEliminarLinea,
    handleConfirmEliminarLinea,
    fechaCreacion,
    fechaModificacion,
  } = usePresupuestoInicial(presupuestoId);

  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll antes del paint cuando cambia el tab — evita el salto visual
  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [tabActivo]);

  const formatFecha = (iso: string | null, conHora = false): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    const fecha = d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!conHora) return fecha;
    const hora = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    return `${fecha} ${hora}`;
  };

  if (isLoadingPresupuesto) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingDeleteFila = detalleActivo.filasDisplay.find(
    (f) => f._clientId === detalleActivo.pendingDelete,
  );

  // Conteo de discrepancias por tab (independiente del tab activo)
  const discrepanciasEnIngresos = [...(discrepanciasIngresosMap?.values() ?? [])].filter(
    (d) => d !== null && d !== 0,
  ).length;
  const discrepanciasEnGastos = [...(discrepanciasGastosMap?.values() ?? [])].filter(
    (d) => d !== null && d !== 0,
  ).length;

  return (
    <FormProvider {...form}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>

        {/* ── Page header ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            minHeight: 52,
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="caption" color="text.disabled">Inicio</Typography>
              <Typography variant="caption" color="text.disabled">/</Typography>
              <Typography variant="caption" color="text.disabled">Presupuesto</Typography>
              <Typography variant="caption" color="text.disabled">/</Typography>
              <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600 }}>
                Presupuesto Inicial
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              Presupuesto Inicial
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={headerCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              onClick={setHeaderCollapsed}
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {headerCollapsed ? "Mostrar" : "Ocultar"}
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<HistoryIcon />}
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Historial
            </Button>
            <IconButton size="small" sx={{ color: "text.disabled" }}>
              <HelpOutlineIcon sx={{ fontSize: "1.125rem" }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Encabezado colapsable ─────────────────────────────────── */}
        <PresupuestoHeader
          collapsed={headerCollapsed}
          onToggle={setHeaderCollapsed}
          numero={numero}
          anosDisponibles={anosDisponibles}
        />

        {/* ── Banner de discrepancias ──────────────────────────────── */}
        <DiscrepanciaBanner
          count={totalDiscrepancias}
          onRecalcularTodo={handleRecalcularTodo}
          loading={isSaving}
        />

        {/* ── Tabs: Ingresos / Gastos / Resumen ────────────────────── */}
        <Box
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 3,
            flexShrink: 0,
          }}
        >
          <Tabs
            value={tabActivo}
            onChange={(_e, v) => setTabActivo(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 44 }}
          >
            <Tab
              value="ingresos"
              sx={{ minHeight: 44, py: 0, px: 2.5 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <SouthWestIcon sx={{ fontSize: "0.875rem" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: tabActivo === "ingresos" ? 600 : 500, letterSpacing: 0.3 }}
                  >
                    Ingresos
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.75,
                      minWidth: 18,
                      height: 18,
                      borderRadius: "9px",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      bgcolor: tabActivo === "ingresos" ? "rgba(13, 107, 94, 0.12)" : "grey.100",
                      color: tabActivo === "ingresos" ? "primary.main" : "text.disabled",
                    }}
                  >
                    {filasIngresos.length}
                  </Box>
                  {discrepanciasEnIngresos > 0 && (
                    <Badge badgeContent={discrepanciasEnIngresos} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.5625rem", minWidth: 16, height: 16, borderRadius: 8 } }}>
                      <Box sx={{ width: 4 }} />
                    </Badge>
                  )}
                </Box>
              }
            />
            <Tab
              value="gastos"
              sx={{ minHeight: 44, py: 0, px: 2.5 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <NorthEastIcon sx={{ fontSize: "0.875rem" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: tabActivo === "gastos" ? 600 : 500, letterSpacing: 0.3 }}
                  >
                    Gastos
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.75,
                      minWidth: 18,
                      height: 18,
                      borderRadius: "9px",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      bgcolor: tabActivo === "gastos" ? "rgba(13, 107, 94, 0.12)" : "grey.100",
                      color: tabActivo === "gastos" ? "primary.main" : "text.disabled",
                    }}
                  >
                    {filasGastos.length}
                  </Box>
                  {discrepanciasEnGastos > 0 && (
                    <Badge badgeContent={discrepanciasEnGastos} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.5625rem", minWidth: 16, height: 16, borderRadius: 8 } }}>
                      <Box sx={{ width: 4 }} />
                    </Badge>
                  )}
                </Box>
              }
            />
            <Tab
              value="resumen"
              sx={{ minHeight: 44, py: 0, px: 2.5 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <ScaleIcon sx={{ fontSize: "0.875rem" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: tabActivo === "resumen" ? 600 : 500, letterSpacing: 0.3 }}
                  >
                    Resumen / Equilibrio
                  </Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* ── Contenido del tab activo ──────────────────────────────── */}
        <Box ref={contentRef} sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>

          {/* Ingresos — siempre montado, oculto cuando no activo */}
          <Box sx={{ display: tabActivo === "ingresos" ? "block" : "none" }}>
            <PresupuestoToolbar
              searchValue={searchIngresos}
              onSearchChange={setSearchIngresos}
              onAgregarLinea={() => detalleIngresos.agregarLinea()}
              onImportar={handleImportar}
              disabled={isSaving}
              loadingCuentas={loadingCuentasIngresos}
            />
            <PresupuestoGrid
              filas={detalleIngresos.filasDisplay}
              cuentasDisponibles={cuentasIngresos}
              centrosCosto={centrosCosto}
              cuentasEnUso={detalleIngresos.cuentasEnUso}
              discrepanciasMap={discrepanciasIngresosMap}
              equilibrio={equilibrio}
              totalTab={totalIngresos}
              tipoTab="ingresos"
              searchFilter={searchIngresos}
              onCuentaChange={detalleIngresos.setCuenta}
              onCentroCostoChange={detalleIngresos.setCentroCosto}
              onMontoConfirm={detalleIngresos.setMonto}
              onObservacionChange={detalleIngresos.setObservacion}
              onRecalcular={handleRecalcular}
              onEliminar={handleEliminarLinea}
              onTab={handleTabNavigation}
              isSaving={isSaving}
            />
          </Box>

          {/* Gastos — siempre montado, oculto cuando no activo */}
          <Box sx={{ display: tabActivo === "gastos" ? "block" : "none" }}>
            <PresupuestoToolbar
              searchValue={searchGastos}
              onSearchChange={setSearchGastos}
              onAgregarLinea={() => detalleGastos.agregarLinea()}
              onImportar={handleImportar}
              disabled={isSaving}
              loadingCuentas={loadingCuentasGastos}
            />
            <PresupuestoGrid
              filas={detalleGastos.filasDisplay}
              cuentasDisponibles={cuentasGastos}
              centrosCosto={centrosCosto}
              cuentasEnUso={detalleGastos.cuentasEnUso}
              discrepanciasMap={discrepanciasGastosMap}
              equilibrio={equilibrio}
              totalTab={totalGastos}
              tipoTab="gastos"
              searchFilter={searchGastos}
              onCuentaChange={detalleGastos.setCuenta}
              onCentroCostoChange={detalleGastos.setCentroCosto}
              onMontoConfirm={detalleGastos.setMonto}
              onObservacionChange={detalleGastos.setObservacion}
              onRecalcular={handleRecalcular}
              onEliminar={handleEliminarLinea}
              onTab={handleTabNavigation}
              isSaving={isSaving}
            />
          </Box>

          {/* Resumen */}
          {tabActivo === "resumen" && (
            <PresupuestoResumen
              filasIngresos={filasIngresos}
              filasGastos={filasGastos}
              equilibrio={equilibrio}
            />
          )}
        </Box>

        {/* ── Barra de información ──────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 0.875,
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {/* Conteo de líneas */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.625 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: "0.75rem", color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled">
              {filasIngresos.length} línea{filasIngresos.length !== 1 ? "s" : ""} ingresos
              {" · "}
              {filasGastos.length} línea{filasGastos.length !== 1 ? "s" : ""} gastos
            </Typography>
          </Box>

          {presupuestoId && (
            <>
              <Divider orientation="vertical" flexItem sx={{ my: 0.25 }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                #{numero}
              </Typography>
            </>
          )}

          {fechaModificacion && (
            <>
              <Divider orientation="vertical" flexItem sx={{ my: 0.25 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.625 }}>
                <PersonOutlineIcon sx={{ fontSize: "0.75rem", color: "text.disabled" }} />
                <Typography variant="caption" color="text.disabled">
                  Últ. cambio: {formatFecha(fechaModificacion, true)}
                </Typography>
              </Box>
            </>
          )}

          {fechaCreacion && (
            <>
              <Divider orientation="vertical" flexItem sx={{ my: 0.25 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.625 }}>
                <CalendarTodayIcon sx={{ fontSize: "0.625rem", color: "text.disabled" }} />
                <Typography variant="caption" color="text.disabled">
                  Creado: {formatFecha(fechaCreacion)}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* ── Footer: acciones ─────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            flexShrink: 0,
            boxShadow: "0 -2px 8px -2px rgba(0,0,0,0.06)",
            gap: 2,
          }}
        >
          {/* Eliminar */}
          <Tooltip
            title={!presupuestoId ? "Guarde primero el presupuesto" : "Eliminar presupuesto completo"}
            arrow
          >
            <span>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setConfirmDelete(true)}
                disabled={!presupuestoId || isSaving}
              >
                Eliminar
              </Button>
            </span>
          </Tooltip>

          {/* Acciones derecha */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Próximamente" arrow>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  startIcon={<PrintIcon />}
                  disabled
                  sx={{ color: "text.secondary", borderColor: "divider" }}
                >
                  Imprimir
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Próximamente" arrow>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  startIcon={<FileDownloadIcon />}
                  disabled
                  sx={{ color: "text.secondary", borderColor: "divider" }}
                >
                  Exportar
                </Button>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              size="small"
              startIcon={
                isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />
              }
              onClick={handleGuardar}
              disabled={isSaving}
              sx={{ minWidth: 100, fontWeight: 600 }}
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </Stack>
        </Box>

        {/* ── Diálogos ─────────────────────────────────────────────── */}
        <DeleteLineaDialog
          open={!!detalleActivo.pendingDelete}
          cuentaCodigo={pendingDeleteFila?.cuenta?.codigo}
          cuentaNombre={pendingDeleteFila?.cuenta?.nombre}
          onConfirm={handleConfirmEliminarLinea}
          onCancel={() => detalleActivo.setPendingDelete(null)}
          loading={isSaving}
        />

        <DeleteLineaDialog
          open={confirmDelete}
          cuentaCodigo="Presupuesto Inicial"
          cuentaNombre={`Año ${form.watch("anoContable")}`}
          onConfirm={handleEliminarPresupuesto}
          onCancel={() => setConfirmDelete(false)}
          loading={isSaving}
        />
      </Box>
    </FormProvider>
  );
};

export default PresupuestoInicial;
