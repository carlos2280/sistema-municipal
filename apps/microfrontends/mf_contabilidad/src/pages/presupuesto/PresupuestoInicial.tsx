import DeleteConfirmToast from '@/components/presupuesto/molecules/DeleteConfirmToast';
import DeleteLineaDialog from '@/components/presupuesto/molecules/DeleteLineaDialog';
import PresupuestoHeader from '@/components/presupuesto/molecules/PresupuestoHeader';
import AgregarCuentaDrawer from '@/components/presupuesto/organisms/AgregarCuentaDrawer';
import PresupuestoGrid from '@/components/presupuesto/organisms/PresupuestoGrid';
import PresupuestoMatrixGrid from '@/components/presupuesto/organisms/PresupuestoMatrixGrid';
import PresupuestoResumen from '@/components/presupuesto/organisms/PresupuestoResumen';
import { usePresupuestoInicial } from '@/hooks/presupuesto/usePresupuestoInicial';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import ScaleIcon from '@mui/icons-material/Scale';
import SearchIcon from '@mui/icons-material/Search';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { type Theme, alpha } from '@mui/material/styles';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { FormProvider } from 'react-hook-form';

// ─── Tipos ────────────────────────────────────────────────────────
type TabValue = 'ingresos' | 'gastos' | 'resumen';

interface PresupuestoInicialProps {
  presupuestoId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────
const formatFecha = (iso: string | null, conHora = false): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  if (!conHora) return fecha;
  const hora = d.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fecha} ${hora}`;
};

const formatCLP = (n: number): string =>
  n.toLocaleString('es-CL', { style: 'decimal', maximumFractionDigits: 0 });

// ─── Stage padding overrides (full-bleed dentro del Stage) ────────
// El Stage usa padding 40px 48px 80px — debemos anularlo para esta vista
const STAGE_PT = 40;
const STAGE_PX = 48;
const STAGE_PB = 80;
const EYEBROW_H = 28;

// ─── Sx helpers (composables) ─────────────────────────────────────
const numericFontSx = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontFeatureSettings: "'tnum' 1, 'ss01' 1",
} as const;

// ═══════════════════════════════════════════════════════════════════
//  PRESUPUESTO INICIAL — Vista MERIDIAN
// ═══════════════════════════════════════════════════════════════════
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
    matrixGastos,
    subprogramas,
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
    handleCancelEliminarLinea,
    deleteLineaToast,
    fechaModificacion,
    agregarDrawer,
    handleAgregarConfirm,
  } = usePresupuestoInicial(presupuestoId);

  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [tabActivo]);

  // ── Derivados ──────────────────────────────────────────────────
  // Set de IDs marcados para eliminación (resaltados en rojo en el grid)
  const deleteTargetIds = useMemo(
    () => new Set(deleteLineaToast.targetIds),
    [deleteLineaToast.targetIds],
  );

  const discrepanciasEnIngresos = [
    ...(discrepanciasIngresosMap?.values() ?? []),
  ].filter((d) => d !== null && d !== 0).length;
  const discrepanciasEnGastos = [
    ...(discrepanciasGastosMap?.values() ?? []),
  ].filter((d) => d !== null && d !== 0).length;

  const searchActivo = tabActivo === 'ingresos' ? searchIngresos : searchGastos;
  const setSearchActivo =
    tabActivo === 'ingresos' ? setSearchIngresos : setSearchGastos;
  const loadingCuentasActivo =
    tabActivo === 'ingresos' ? loadingCuentasIngresos : loadingCuentasGastos;

  // Total dinámico para el footer según tab activo
  const footerTotal = tabActivo === 'ingresos' ? totalIngresos : totalGastos;
  const footerLabel =
    tabActivo === 'ingresos'
      ? 'Total Ingresos'
      : tabActivo === 'gastos'
        ? 'Total Gastos'
        : 'Equilibrado';
  const footerColor = (t: Theme) =>
    tabActivo === 'ingresos'
      ? t.palette.success.main
      : tabActivo === 'gastos'
        ? t.palette.error.main
        : t.palette.info.main;

  const numDisplay = numero !== null ? String(numero).padStart(3, '0') : '---';

  // ── Loading ────────────────────────────────────────────────────
  if (isLoadingPresupuesto) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...form}>
      {/* Full-bleed: anula el padding del Stage para que la vista ocupe 100% */}
      <Box
        sx={{
          mx: `${-STAGE_PX}px`,
          mt: `${-STAGE_PT}px`,
          mb: `${-STAGE_PB}px`,
          height: `calc(100vh - ${EYEBROW_H}px)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ═══ PAGE HEADER — compact single-line ═══════════════════ */}
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderLeft: `3px solid ${t.palette.primary.main}`,
            flexShrink: 0,
            gap: 1.5,
            transition: 'border-left-color 400ms',
          })}
        >
          {/* Left: breadcrumb + doc ID */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              minWidth: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 150ms',
                }}
              >
                Inicio
              </Typography>
              <Typography
                variant="caption"
                sx={(t) => ({ color: t.meridian.text.tx4, fontSize: '10px' })}
              >
                ›
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 150ms',
                }}
              >
                Contabilidad
              </Typography>
              <Typography
                variant="caption"
                sx={(t) => ({ color: t.meridian.text.tx4, fontSize: '10px' })}
              >
                ›
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 150ms',
                }}
              >
                Presupuesto
              </Typography>
              <Typography
                variant="caption"
                sx={(t) => ({ color: t.meridian.text.tx4, fontSize: '10px' })}
              >
                ›
              </Typography>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: 700,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '-0.01em',
                }}
              >
                Presupuesto Inicial
              </Typography>
            </Box>

            {/* Doc ID chip */}
            <Box
              sx={(t) => ({
                fontFamily: "'DM Mono', monospace",
                fontSize: '10px',
                fontWeight: 600,
                color: t.meridian.text.tx4,
                px: 0.75,
                py: 0.25,
                bgcolor: t.meridian.surfaces.s3,
                borderRadius: 1,
                flexShrink: 0,
              })}
            >
              #{numDisplay}
            </Box>
          </Box>

          {/* Right: discrepancy pill + actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              flexShrink: 0,
            }}
          >
            {/* Discrepancy pill */}
            {totalDiscrepancias > 0 && (
              <Tooltip
                title={`${totalDiscrepancias} discrepancia${totalDiscrepancias > 1 ? 's' : ''} — hijos no coinciden con padre`}
                arrow
              >
                <Box
                  onClick={handleRecalcularTodo}
                  sx={(t) => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.375,
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    bgcolor: alpha(t.palette.warning.main, 0.1),
                    color: 'warning.main',
                    border: `1px solid ${alpha(t.palette.warning.main, 0.22)}`,
                    cursor: 'pointer',
                    transition: 'background 150ms',
                    '&:hover': { bgcolor: alpha(t.palette.warning.main, 0.18) },
                  })}
                >
                  <WarningAmberIcon sx={{ fontSize: '12px' }} />
                  <span>{totalDiscrepancias}</span>
                </Box>
              </Tooltip>
            )}

            <Box
              sx={{
                width: '1px',
                height: 16,
                bgcolor: 'divider',
                flexShrink: 0,
              }}
            />

            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={
                headerCollapsed ? (
                  <ExpandMoreIcon sx={{ fontSize: '14px' }} />
                ) : (
                  <ExpandLessIcon sx={{ fontSize: '14px' }} />
                )
              }
              onClick={setHeaderCollapsed}
              sx={{
                color: 'text.disabled',
                fontWeight: 500,
                fontSize: '11px',
                minWidth: 0,
                px: 1,
              }}
            >
              {headerCollapsed ? 'Mostrar' : 'Ocultar'}
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<HistoryIcon sx={{ fontSize: '13px' }} />}
              sx={{
                color: 'text.disabled',
                fontWeight: 500,
                fontSize: '11px',
                minWidth: 0,
                px: 1,
              }}
            >
              Historial
            </Button>
            <IconButton size="small" sx={{ color: 'text.disabled', p: 0.5 }}>
              <HelpOutlineIcon sx={{ fontSize: '14px' }} />
            </IconButton>
          </Box>
        </Box>

        {/* ═══ ENCABEZADO COLAPSABLE ═══════════════════════════════ */}
        <PresupuestoHeader
          collapsed={headerCollapsed}
          onToggle={setHeaderCollapsed}
          numero={numero}
          anosDisponibles={anosDisponibles}
        />

        {/* ═══ TABS + TOOLBAR (merged for density) ═════════════════ */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            px: 2.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            gap: 1,
          }}
        >
          {/* Tabs */}
          <Tabs
            value={tabActivo}
            onChange={(_e, v: TabValue) => setTabActivo(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 38,
              '& .MuiTab-root': { minHeight: 38, py: 0, px: 1.75, minWidth: 0 },
            }}
          >
            <Tab
              value="ingresos"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SouthWestIcon sx={{ fontSize: '12px' }} />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '11.5px',
                      fontWeight: tabActivo === 'ingresos' ? 600 : 500,
                    }}
                  >
                    Ingresos
                  </Typography>
                  <Box
                    component="span"
                    sx={(t) => ({
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.5,
                      minWidth: 16,
                      height: 16,
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      bgcolor:
                        tabActivo === 'ingresos'
                          ? alpha(t.palette.primary.main, 0.12)
                          : t.meridian.surfaces.s3,
                      color:
                        tabActivo === 'ingresos'
                          ? 'primary.main'
                          : 'text.disabled',
                      transition: 'background 150ms, color 150ms',
                    })}
                  >
                    {filasIngresos.length}
                  </Box>
                  {discrepanciasEnIngresos > 0 && (
                    <Badge
                      badgeContent={discrepanciasEnIngresos}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '9px',
                          minWidth: 14,
                          height: 14,
                          borderRadius: 7,
                        },
                      }}
                    >
                      <Box sx={{ width: 2 }} />
                    </Badge>
                  )}
                </Box>
              }
            />
            <Tab
              value="gastos"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <NorthEastIcon sx={{ fontSize: '12px' }} />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '11.5px',
                      fontWeight: tabActivo === 'gastos' ? 600 : 500,
                    }}
                  >
                    Gastos
                  </Typography>
                  <Box
                    component="span"
                    sx={(t) => ({
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.5,
                      minWidth: 16,
                      height: 16,
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      bgcolor:
                        tabActivo === 'gastos'
                          ? alpha(t.palette.primary.main, 0.12)
                          : t.meridian.surfaces.s3,
                      color:
                        tabActivo === 'gastos'
                          ? 'primary.main'
                          : 'text.disabled',
                      transition: 'background 150ms, color 150ms',
                    })}
                  >
                    {filasGastos.length}
                  </Box>
                  {discrepanciasEnGastos > 0 && (
                    <Badge
                      badgeContent={discrepanciasEnGastos}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '9px',
                          minWidth: 14,
                          height: 14,
                          borderRadius: 7,
                        },
                      }}
                    >
                      <Box sx={{ width: 2 }} />
                    </Badge>
                  )}
                </Box>
              }
            />
            <Tab
              value="resumen"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScaleIcon sx={{ fontSize: '12px' }} />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '11.5px',
                      fontWeight: tabActivo === 'resumen' ? 600 : 500,
                    }}
                  >
                    Resumen
                  </Typography>
                </Box>
              }
            />
          </Tabs>

          {/* Toolbar actions (only for ingresos/gastos tabs) */}
          {tabActivo !== 'resumen' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              {/* Search compact */}
              <TextField
                value={searchActivo}
                onChange={(e) => setSearchActivo(e.target.value)}
                placeholder="Buscar..."
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ fontSize: '12px', color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { 'aria-label': 'Buscar en detalle' },
                }}
                sx={{
                  flex: '0 1 180px',
                  '& .MuiOutlinedInput-root': {
                    height: 28,
                    fontSize: '11.5px',
                    '&:focus-within': { flex: '0 1 240px' },
                  },
                  '& .MuiOutlinedInput-input': { py: 0.5, px: 0.5 },
                  transition: 'flex 200ms',
                }}
              />

              {/* Agregar — abre drawer de navegación del plan de cuentas */}
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '12px' }} />}
                onClick={agregarDrawer.open}
                disabled={isSaving}
                sx={{
                  height: 28,
                  fontSize: '11px',
                  px: 1,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Agregar
              </Button>

              {/* Importar */}
              <Tooltip
                title={
                  loadingCuentasActivo
                    ? 'Cargando cuentas...'
                    : 'Importar Excel (.xlsx)'
                }
                arrow
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={handleImportar}
                    disabled={isSaving || loadingCuentasActivo}
                    sx={{ width: 28, height: 28 }}
                  >
                    {loadingCuentasActivo ? (
                      <CircularProgress size={12} color="inherit" />
                    ) : (
                      <FileUploadIcon sx={{ fontSize: '12px' }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              {/* Exportar */}
              <Tooltip title="Exportar (próximamente)" arrow>
                <span>
                  <IconButton
                    size="small"
                    disabled
                    sx={{ width: 28, height: 28, opacity: 0.5 }}
                  >
                    <FileDownloadIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}

          {/* Toolbar para Resumen: botón recalcular si hay discrepancias */}
          {tabActivo === 'resumen' && totalDiscrepancias > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              <Button
                size="small"
                startIcon={<CalculateIcon sx={{ fontSize: '12px' }} />}
                onClick={handleRecalcularTodo}
                disabled={isSaving}
                sx={(t) => ({
                  height: 28,
                  fontSize: '11px',
                  fontWeight: 600,
                  bgcolor: alpha(t.palette.warning.main, 0.08),
                  color: 'warning.main',
                  border: `1px solid ${alpha(t.palette.warning.main, 0.2)}`,
                  '&:hover': { bgcolor: alpha(t.palette.warning.main, 0.14) },
                })}
              >
                Recalcular todo
              </Button>
            </Box>
          )}
        </Box>

        {/* ═══ CONTENIDO DEL TAB ACTIVO ════════════════════════════ */}
        <Box
          ref={contentRef}
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Ingresos — siempre montado, oculto con display:none.
              content-visibility:auto en cada fila hace que el browser no pinte nada oculto. */}
          <Box
            sx={{
              display: tabActivo === 'ingresos' ? 'flex' : 'none',
              flexDirection: 'column',
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <PresupuestoGrid
              filas={detalleIngresos.filasDisplay}
              cuentasDisponibles={cuentasIngresos}
              centrosCosto={centrosCosto}
              cuentasEnUso={detalleIngresos.cuentasEnUso}
              discrepanciasMap={discrepanciasIngresosMap}
              deleteTargetIds={deleteTargetIds}
              tipoTab="ingresos"
              searchFilter={searchIngresos}
              onCuentaChange={detalleIngresos.setCuenta}
              onCentroCostoChange={detalleIngresos.setCentroCosto}
              onMontoConfirm={detalleIngresos.setMonto}
              onRecalcular={handleRecalcular}
              onEliminar={handleEliminarLinea}
              onTab={handleTabNavigation}
              isSaving={isSaving}
            />
          </Box>

          {/* Gastos — Adaptive Financial Matrix con columnas por subprograma */}
          <Box
            sx={{
              display: tabActivo === 'gastos' ? 'flex' : 'none',
              flexDirection: 'column',
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <PresupuestoMatrixGrid
              filas={matrixGastos.filasMatrix}
              subprogramas={subprogramas}
              discrepanciasMap={discrepanciasGastosMap}
              deleteTargetIds={deleteTargetIds}
              searchFilter={searchGastos}
              onMontoConfirm={matrixGastos.setMonto}
              onMontoAreaConfirm={matrixGastos.setMontoArea}
              onRecalcular={handleRecalcular}
              onEliminar={handleEliminarLinea}
              onTab={handleTabNavigation}
              onTabArea={(clientId, areaIdx, shiftKey) => {
                const nextIdx = shiftKey ? areaIdx - 1 : areaIdx + 1;
                const visibleAreas = subprogramas.filter(
                  (s) => s.codigo !== 'SIN_ASIG',
                );
                if (nextIdx >= 0 && nextIdx < visibleAreas.length) {
                  return;
                }
                handleTabNavigation(clientId, shiftKey);
              }}
              onEnterArea={(clientId) => {
                handleTabNavigation(clientId, false);
              }}
              isSaving={isSaving}
            />
          </Box>

          {/* Resumen — contenedor scrollable propio */}
          {tabActivo === 'resumen' && (
            <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
              <PresupuestoResumen
                filasIngresos={filasIngresos}
                filasGastos={filasGastos}
                discrepanciasIngresosMap={discrepanciasIngresosMap}
                discrepanciasGastosMap={discrepanciasGastosMap}
                equilibrio={equilibrio}
                subprogramas={subprogramas}
                filasMatrixGastos={matrixGastos.filasMatrix}
              />
            </Box>
          )}
        </Box>

        {/* ═══ FOOTER BAR — Unified total + actions ════════════════ */}
        {tabActivo !== 'resumen' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 0.75,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              gap: 1.5,
            }}
          >
            {/* Left: Total dinámico + metadata */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}
            >
              {/* Total label + value */}
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: footerColor,
                  whiteSpace: 'nowrap',
                }}
              >
                {footerLabel}
              </Typography>
              <Typography
                sx={{
                  ...numericFontSx,
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: footerColor,
                  whiteSpace: 'nowrap',
                }}
              >
                $ {formatCLP(footerTotal)}
              </Typography>

              {/* Separator */}
              <Box
                sx={{
                  width: '1px',
                  height: 16,
                  bgcolor: 'divider',
                  flexShrink: 0,
                }}
              />

              {/* Line count */}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  color: 'text.disabled',
                  whiteSpace: 'nowrap',
                }}
              >
                {filasIngresos.length} + {filasGastos.length} líneas
              </Typography>

              {/* Last modified */}
              {fechaModificacion && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '10px',
                    color: 'text.disabled',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Últ: {formatFecha(fechaModificacion, false)}
                </Typography>
              )}
            </Box>

            {/* Right: action buttons + save */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              {/* Eliminar */}
              <Tooltip
                title={
                  !presupuestoId
                    ? 'Guarde primero el presupuesto'
                    : 'Eliminar presupuesto'
                }
                arrow
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setConfirmDelete(true)}
                    disabled={!presupuestoId || isSaving}
                    sx={{
                      color: 'error.main',
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Imprimir */}
              <Tooltip title="Imprimir (próximamente)" arrow>
                <span>
                  <IconButton
                    size="small"
                    disabled
                    sx={{
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <PrintIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Exportar */}
              <Tooltip title="Exportar (próximamente)" arrow>
                <span>
                  <IconButton
                    size="small"
                    disabled
                    sx={{
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <FileDownloadIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Separator */}
              <Box
                sx={{
                  width: '1px',
                  height: 18,
                  bgcolor: 'divider',
                  flexShrink: 0,
                  mx: 0.25,
                }}
              />

              {/* Guardar */}
              <Button
                variant="contained"
                size="small"
                startIcon={
                  isSaving ? (
                    <CircularProgress size={12} color="inherit" />
                  ) : (
                    <SaveIcon sx={{ fontSize: '12px' }} />
                  )
                }
                onClick={handleGuardar}
                disabled={isSaving}
                sx={{
                  height: 28,
                  fontWeight: 700,
                  fontSize: '12px',
                  minWidth: 85,
                  px: 1.75,
                }}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Box>
        )}

        {/* ═══ DRAWER — Agregar cuenta al presupuesto ════════════ */}
        <AgregarCuentaDrawer
          drawer={agregarDrawer}
          centrosCosto={centrosCosto}
          tipoTab={tabActivo === 'gastos' ? 'gastos' : 'ingresos'}
          onConfirm={handleAgregarConfirm}
        />

        {/* ═══ TOAST eliminación de línea (prototype-style) ════════ */}
        <DeleteConfirmToast
          open={deleteLineaToast.open}
          cuentaCodigo={deleteLineaToast.cuentaCodigo}
          cuentaNombre={deleteLineaToast.cuentaNombre}
          subcuentasCount={deleteLineaToast.subcuentasCount}
          onConfirm={handleConfirmEliminarLinea}
          onCancel={handleCancelEliminarLinea}
          loading={isSaving}
        />

        {/* ═══ DIÁLOGO eliminación del documento completo ════════ */}
        <DeleteLineaDialog
          open={confirmDelete}
          cuentaCodigo="Presupuesto Inicial"
          cuentaNombre={`Año ${form.watch('anoContable')}`}
          onConfirm={handleEliminarPresupuesto}
          onCancel={() => setConfirmDelete(false)}
          loading={isSaving}
        />
      </Box>
    </FormProvider>
  );
};

export default PresupuestoInicial;
