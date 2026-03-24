import {
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Plus as AddIcon,
  Search as SearchIcon,
  X as CloseIcon,
} from 'lucide-react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { memo, useCallback, useEffect, useRef } from 'react';
import type {
  AgregarCuentaDrawerHook,
  CuentaTreeNode,
  SearchResult,
} from '../../../hooks/presupuesto/useAgregarCuentaDrawer';
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
} from '../../../types/presupuesto.types';

// ─── Constantes ─────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 420;
const EYEBROW_H = 28;

// ─── Tipos de Props ─────────────────────────────────────────────────────────

interface AgregarCuentaDrawerProps {
  drawer: AgregarCuentaDrawerHook;
  centrosCosto: CentrosCostoItem[];
  tipoTab: 'ingresos' | 'gastos';
  onConfirm: (
    leaf: CuentaPresupuestaria,
    monto: number,
    ancestors: CuentaPresupuestaria[],
    centroCostoId: number | null,
  ) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Formatea número a formato CLP: 1.234.567 */
const formatMontoInput = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number.parseInt(digits, 10).toLocaleString('es-CL');
};

/** Highlight texto que coincide con la búsqueda */
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.substring(0, idx)}
      <Box
        component="span"
        sx={(t) => ({
          bgcolor: alpha(t.palette.primary.main, 0.2),
          color: 'primary.main',
          borderRadius: '2px',
          px: '1px',
        })}
      >
        {text.substring(idx, idx + query.length)}
      </Box>
      {text.substring(idx + query.length)}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  AGREGAR CUENTA DRAWER — Prototipo MERIDIAN
// ═══════════════════════════════════════════════════════════════════════════════

const AgregarCuentaDrawer = ({
  drawer,
  centrosCosto,
  tipoTab,
  onConfirm,
}: AgregarCuentaDrawerProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const montoRef = useRef<HTMLInputElement>(null);

  // Auto-focus search al abrir
  useEffect(() => {
    if (drawer.isOpen && !drawer.showForm) {
      setTimeout(() => searchRef.current?.focus(), 350);
    }
  }, [drawer.isOpen, drawer.showForm]);

  // Auto-focus monto al seleccionar hoja
  useEffect(() => {
    if (drawer.showForm) {
      setTimeout(() => montoRef.current?.focus(), 250);
    }
  }, [drawer.showForm]);

  // ── Destructure estable para callbacks ────────────────────────────
  const {
    setMontoInput,
    selectLeaf,
    drillDown,
    drillFromSearch,
    close,
    selectedLeaf,
    parsedMonto,
    insertPreview,
    centroCostoId,
    cuentasEnUsoSet,
    setCentroCostoId,
  } = drawer;

  // ── Handlers ────────────────────────────────────────────────────
  const handleMontoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMontoInput(formatMontoInput(e.target.value));
    },
    [setMontoInput],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedLeaf || parsedMonto <= 0) return;

    const ancestors = insertPreview.filter((c) => c.id !== selectedLeaf.id);

    onConfirm(selectedLeaf, parsedMonto, ancestors, centroCostoId);
    close();
  }, [
    selectedLeaf,
    parsedMonto,
    insertPreview,
    centroCostoId,
    onConfirm,
    close,
  ]);

  const handleItemClick = useCallback(
    (node: CuentaTreeNode) => {
      const isLeaf = node.children.length === 0;
      const isLeafExists = isLeaf && cuentasEnUsoSet.has(node.cuenta.id);

      if (isLeafExists) return;

      if (isLeaf) {
        selectLeaf(node.cuenta);
      } else {
        drillDown(node.cuenta.id);
      }
    },
    [cuentasEnUsoSet, selectLeaf, drillDown],
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={drawer.isOpen}
      onClose={drawer.close}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          maxWidth: '90vw',
          top: `${EYEBROW_H}px`,
          height: `calc(100vh - ${EYEBROW_H}px)`,
          bgcolor: 'background.default',
          borderLeft: '1px solid',
          borderColor: 'divider',
          boxShadow: (t) => `-8px 0 40px ${alpha(t.palette.common.black, 0.5)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ═══ HEADER ═══════════════════════════════════════════════ */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* Icon */}
            <Box
              sx={(t) => ({
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
                flexShrink: 0,
              })}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Agregar Cuenta
              </Typography>
              <Typography
                sx={{ fontSize: '11px', color: 'text.disabled', mt: 0.25 }}
              >
                Navega el plan de cuentas nivel por nivel
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={drawer.close}
            sx={(t) => ({
              width: 28,
              height: 28,
              border: `1px solid ${t.palette.divider}`,
              borderRadius: 0.5,
              color: 'text.disabled',
              '&:hover': {
                bgcolor: t.meridian.surfaces.s3,
                color: 'text.primary',
                borderColor: t.meridian.borders.strong,
              },
            })}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* ═══ BREADCRUMB PATH ═════════════════════════════════════ */}
        {!drawer.searchMode && (
          <Box
            sx={(t) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 2.5,
              py: 1.25,
              bgcolor: t.meridian.surfaces.s2,
              borderBottom: `1px solid ${t.meridian.borders.muted}`,
              flexShrink: 0,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            })}
          >
            {/* Root chip */}
            <Box
              onClick={() => drawer.drillTo(null)}
              sx={(t) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.375,
                px: 1,
                py: 0.375,
                borderRadius: 0.5,
                fontSize: '10px',
                fontWeight: drawer.breadcrumb.length === 0 ? 600 : 500,
                color:
                  drawer.breadcrumb.length === 0
                    ? 'primary.main'
                    : 'text.disabled',
                bgcolor:
                  drawer.breadcrumb.length === 0
                    ? alpha(t.palette.primary.main, 0.08)
                    : 'transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: t.meridian.surfaces.s3,
                  color: 'text.secondary',
                },
              })}
            >
              <HomeIcon sx={{ fontSize: 10 }} />
              {tipoTab === 'gastos' ? 'Gastos' : 'Ingresos'}
            </Box>

            {/* Path chips */}
            {drawer.breadcrumb.map((cuenta, i) => {
              const isLast = i === drawer.breadcrumb.length - 1;
              return (
                <Box
                  key={cuenta.id}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={(t) => ({
                      color: t.meridian.text.tx4,
                      fontSize: '10px',
                      mx: 0.125,
                      flexShrink: 0,
                    })}
                  >
                    ›
                  </Typography>
                  <Box
                    onClick={() => drawer.drillTo(cuenta.id)}
                    sx={(t) => ({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.375,
                      borderRadius: 0.5,
                      fontSize: '10px',
                      fontWeight: isLast ? 600 : 500,
                      color: isLast ? 'primary.main' : 'text.disabled',
                      bgcolor: isLast
                        ? alpha(t.palette.primary.main, 0.08)
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      '&:hover': {
                        bgcolor: t.meridian.surfaces.s3,
                        color: 'text.secondary',
                      },
                    })}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '9.5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {cuenta.codigo}
                    </Box>
                    {isLast && (
                      <Box
                        component="span"
                        sx={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cuenta.nombre.length > 18
                          ? `${cuenta.nombre.substring(0, 18)}…`
                          : cuenta.nombre}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* ═══ SEARCH BAR ══════════════════════════════════════════ */}
        {!drawer.showForm && (
          <Box sx={{ px: 2.5, pt: 1.25, pb: 1, flexShrink: 0 }}>
            <TextField
              inputRef={searchRef}
              value={drawer.searchQuery}
              onChange={(e) => drawer.setSearchQuery(e.target.value)}
              placeholder="Escribe el código: 1150301…"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ fontSize: 12, color: 'text.disabled' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  fontSize: '12px',
                },
                '& .MuiOutlinedInput-input': { py: 0.5, px: 0.5 },
              }}
            />
          </Box>
        )}

        {/* ═══ ACCOUNT LIST (drill-down / search results) ═════════ */}
        {!drawer.showForm && (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              py: 0.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': (t) => ({
                bgcolor: t.meridian.borders.strong,
                borderRadius: 1,
              }),
            }}
          >
            {drawer.searchMode ? (
              // ── Resultados de búsqueda ──
              <>
                {drawer.searchResults.length === 0 ? (
                  <DrawerEmpty
                    message={`No se encontraron cuentas para "${drawer.searchQuery}"`}
                    icon={<SearchIcon sx={{ fontSize: 20, opacity: 0.4 }} />}
                  />
                ) : (
                  <>
                    {/* Results header */}
                    <Box
                      sx={(t) => ({
                        px: 2.5,
                        py: 0.75,
                        fontSize: '9.5px',
                        fontWeight: 600,
                        color: t.meridian.text.tx4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: `1px solid ${t.meridian.borders.muted}`,
                        bgcolor: t.meridian.surfaces.s2,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      })}
                    >
                      {drawer.searchResults.length} resultado
                      {drawer.searchResults.length > 1 ? 's' : ''}
                    </Box>
                    {drawer.searchResults.map((result) => (
                      <SearchResultItem
                        key={result.cuenta.id}
                        result={result}
                        query={drawer.searchQuery}
                        onDrill={drillFromSearch}
                        onSelect={selectLeaf}
                      />
                    ))}
                  </>
                )}
              </>
            ) : (
              // ── Drill-down del nivel actual ──
              <>
                {drawer.childrenOfCurrent.length === 0 ? (
                  <DrawerEmpty message="No hay subcuentas en este nivel" />
                ) : (
                  drawer.childrenOfCurrent.map((node) => (
                    <DrillDownItem
                      key={node.cuenta.id}
                      node={node}
                      exists={cuentasEnUsoSet.has(node.cuenta.id)}
                      onItemClick={handleItemClick}
                    />
                  ))
                )}
              </>
            )}
          </Box>
        )}

        {/* ═══ LEAF FORM (cuando se selecciona una hoja) ══════════ */}
        {drawer.showForm && selectedLeaf && (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2.5,
              pt: 2,
              pb: 1.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': (t) => ({
                bgcolor: t.meridian.borders.strong,
                borderRadius: 1,
              }),
            }}
          >
            {/* Account card */}
            <Box
              sx={(t) => ({
                p: 1.75,
                bgcolor: t.meridian.surfaces.s2,
                border: `1px solid ${t.palette.divider}`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                borderRadius: 1,
                mb: 2,
              })}
            >
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '0.04em',
                  mb: 0.5,
                }}
              >
                {selectedLeaf.codigo}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  mb: 0.75,
                }}
              >
                {selectedLeaf.nombre}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: 'text.disabled',
                  lineHeight: 1.4,
                  wordBreak: 'break-all',
                }}
              >
                {drawer.breadcrumb.map((c) => c.nombre).join(' › ')}
              </Typography>
            </Box>

            {/* Fields */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}
            >
              {/* Área de Gestión / Centro de Costo */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 0.625,
                  }}
                >
                  Área de Gestión
                </Typography>
                <Select
                  value={centroCostoId ?? ''}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    setCentroCostoId(val === '' ? null : Number(val));
                  }}
                  displayEmpty
                  size="small"
                  fullWidth
                  sx={{
                    height: 36,
                    fontSize: '12.5px',
                    fontWeight: 500,
                  }}
                >
                  <MenuItem value="">
                    <Typography
                      sx={{ fontSize: '12.5px', color: 'text.disabled' }}
                    >
                      Sin asignar
                    </Typography>
                  </MenuItem>
                  {centrosCosto.map((cc) => (
                    <MenuItem key={cc.id} value={cc.id}>
                      <Typography sx={{ fontSize: '12.5px' }}>
                        {cc.nombre}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Monto Anual */}
              <Box>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 0.625,
                  }}
                >
                  Monto Anual ($){' '}
                  <Box component="span" sx={{ color: 'error.main' }}>
                    *
                  </Box>
                </Typography>
                <TextField
                  inputRef={montoRef}
                  value={drawer.montoInput}
                  onChange={handleMontoChange}
                  placeholder="0"
                  size="small"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm();
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      fontSize: '14px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontFeatureSettings: "'tnum' 1",
                      letterSpacing: '-0.01em',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Insert Preview (padres faltantes + hoja) */}
            {insertPreview.length > 1 && (
              <Box
                sx={(t) => ({
                  bgcolor: t.meridian.surfaces.s2,
                  border: `1px solid ${t.palette.divider}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 1.5,
                })}
              >
                <Box
                  sx={(t) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 1,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'primary.main',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    bgcolor: alpha(t.palette.primary.main, 0.04),
                    borderBottom: `1px solid ${t.meridian.borders.muted}`,
                  })}
                >
                  <AddIcon sx={{ fontSize: 10 }} />
                  Se insertarán {insertPreview.length} filas (padres + cuenta)
                </Box>
                <Box sx={{ px: 1.5, py: 1 }}>
                  {insertPreview.map((cuenta, i) => {
                    const isLeaf = cuenta.id === selectedLeaf?.id;
                    return (
                      <Box
                        key={cuenta.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          py: 0.375,
                          pl: `${i * 12}px`,
                          fontSize: '11px',
                        }}
                      >
                        <Typography
                          component="span"
                          sx={(t) => ({
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '10px',
                            color: t.meridian.text.tx4,
                            width: 10,
                            flexShrink: 0,
                          })}
                        >
                          {isLeaf ? '└' : '├'}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'text.secondary',
                            letterSpacing: '0.02em',
                            flexShrink: 0,
                          }}
                        >
                          {cuenta.codigo}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '10.5px',
                            color: 'text.disabled',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {cuenta.nombre}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '8px',
                            fontWeight: 700,
                            color: isLeaf ? 'primary.main' : 'text.disabled',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            flexShrink: 0,
                          }}
                        >
                          {isLeaf ? '← nueva' : 'padre'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ═══ FOOTER ══════════════════════════════════════════════ */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            px: 2.5,
            py: 1.25,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={drawer.close}
            sx={{ fontSize: '11px', color: 'text.disabled' }}
          >
            Cancelar
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 12 }} />}
            onClick={handleConfirm}
            disabled={!selectedLeaf || parsedMonto <= 0}
            sx={{ height: 32, fontSize: '11px', fontWeight: 600, px: 1.5 }}
          >
            Agregar al Presupuesto
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Drill-down item ─────────────────────────────────────────────────────────

interface DrillDownItemProps {
  node: CuentaTreeNode;
  exists: boolean;
  onItemClick: (node: CuentaTreeNode) => void;
}

const DrillDownItem = memo(
  ({ node, exists, onItemClick }: DrillDownItemProps) => {
    const isLeaf = node.children.length === 0;
    const isLeafExists = isLeaf && exists;

    const handleClick = useCallback(() => {
      if (!isLeafExists) onItemClick(node);
    }, [node, isLeafExists, onItemClick]);

    return (
      <Box
        onClick={handleClick}
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.125,
          cursor: isLeafExists ? 'default' : 'pointer',
          transition: 'background 80ms',
          gap: 1.25,
          borderBottom: `1px solid ${t.meridian.borders.muted}`,
          opacity: isLeafExists ? 0.4 : 1,
          '&:hover': isLeafExists
            ? {}
            : {
                bgcolor: isLeaf
                  ? alpha(t.palette.primary.main, 0.06)
                  : t.meridian.surfaces.s3,
              },
        })}
      >
        {/* Main: code + name */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.02em',
              flexShrink: 0,
              minWidth: 50,
            }}
          >
            {node.cuenta.codigo}
          </Typography>
          <Typography
            sx={{
              fontSize: isLeaf ? '11.5px' : '12px',
              color: isLeaf ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.cuenta.nombre}
          </Typography>
        </Box>

        {/* Meta */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          {isLeafExists ? (
            <ExistsBadge />
          ) : isLeaf ? (
            <LeafBadge />
          ) : (
            <>
              {exists && <InPresupBadge />}
              <ChildCountBadge count={node.children.length} />
              <ChevronRightIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
            </>
          )}
        </Box>
      </Box>
    );
  },
);

// ── Search result item ──────────────────────────────────────────────────────

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onDrill: (cuenta: CuentaPresupuestaria) => void;
  onSelect: (cuenta: CuentaPresupuestaria) => void;
}

const SearchResultItem = memo(
  ({ result, query, onDrill, onSelect }: SearchResultItemProps) => {
    const { cuenta, isLeaf, exists, ancestors } = result;
    const isLeafExists = isLeaf && exists;
    const clickable = !isLeafExists;

    const handleClick = useCallback(() => {
      if (!clickable) return;
      if (isLeaf) onSelect(cuenta);
      else onDrill(cuenta);
    }, [clickable, isLeaf, cuenta, onSelect, onDrill]);

    return (
      <Box
        onClick={handleClick}
        sx={(t) => ({
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.125,
          cursor: clickable ? 'pointer' : 'default',
          transition: 'background 80ms',
          gap: 1.25,
          borderBottom: `1px solid ${t.meridian.borders.muted}`,
          opacity: isLeafExists ? 0.4 : 1,
          '&:hover': !clickable
            ? {}
            : {
                bgcolor: isLeaf
                  ? alpha(t.palette.primary.main, 0.06)
                  : t.meridian.surfaces.s3,
              },
        })}
      >
        {/* Ancestor path */}
        {ancestors.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.375,
              flexBasis: '100%',
              pb: 0.375,
            }}
          >
            {ancestors.map((anc, i) => (
              <Box
                key={anc.id}
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {i > 0 && (
                  <Typography
                    component="span"
                    sx={(t) => ({
                      color: t.meridian.text.tx4,
                      fontSize: '8px',
                      opacity: 0.5,
                      mx: 0.125,
                    })}
                  >
                    ›
                  </Typography>
                )}
                <Typography
                  component="span"
                  sx={(t) => ({
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '8.5px',
                    fontWeight: 500,
                    color: t.meridian.text.tx4,
                    letterSpacing: '0.02em',
                  })}
                >
                  {anc.codigo}
                </Typography>
              </Box>
            ))}
            <Typography
              component="span"
              sx={(t) => ({
                color: t.meridian.text.tx4,
                fontSize: '8px',
                opacity: 0.5,
                mx: 0.125,
              })}
            >
              ›
            </Typography>
          </Box>
        )}

        {/* Main */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.02em',
              flexShrink: 0,
              minWidth: 50,
            }}
          >
            {highlightMatch(cuenta.codigo, query)}
          </Typography>
          <Typography
            sx={{
              fontSize: isLeaf ? '11.5px' : '12px',
              color: isLeaf ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {highlightMatch(cuenta.nombre, query)}
          </Typography>
        </Box>

        {/* Meta */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          {isLeafExists ? (
            <ExistsBadge />
          ) : isLeaf ? (
            <LeafBadge visible />
          ) : (
            <>
              <ChildCountBadge count={result.childrenCount} />
              <ChevronRightIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
            </>
          )}
        </Box>
      </Box>
    );
  },
);

// ── Badge atoms ─────────────────────────────────────────────────────────────

const ExistsBadge = memo(() => (
  <Typography
    sx={{
      fontSize: '9px',
      fontWeight: 600,
      color: 'text.disabled',
      px: 0.75,
      py: 0.25,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 0.375,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}
  >
    Ya existe
  </Typography>
));

interface LeafBadgeProps {
  visible?: boolean;
}

const LeafBadge = memo(({ visible }: LeafBadgeProps) => (
  <Typography
    sx={(t) => ({
      fontSize: '9px',
      fontWeight: 600,
      color: 'primary.main',
      bgcolor: alpha(t.palette.primary.main, 0.08),
      px: 1,
      py: 0.25,
      borderRadius: 0.375,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      opacity: visible ? 1 : 0,
      transition: 'opacity 150ms',
      '.MuiBox-root:hover &': { opacity: 1 },
    })}
  >
    Seleccionar
  </Typography>
));

const InPresupBadge = memo(() => (
  <Typography
    sx={(t) => ({
      fontSize: '8px',
      fontWeight: 600,
      color: t.meridian.text.tx4,
      px: 0.625,
      py: 0.125,
      border: `1px solid ${t.meridian.borders.muted}`,
      borderRadius: 0.375,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    })}
  >
    En presup.
  </Typography>
));

interface ChildCountBadgeProps {
  count: number;
}

const ChildCountBadge = memo(({ count }: ChildCountBadgeProps) => (
  <Typography
    sx={(t) => ({
      fontFamily: "'DM Mono', monospace",
      fontSize: '9px',
      fontWeight: 600,
      color: t.meridian.text.tx4,
      bgcolor: t.meridian.surfaces.s3,
      px: 0.625,
      py: 0.125,
      borderRadius: 0.375,
    })}
  >
    {count}
  </Typography>
));

// ── Empty state ─────────────────────────────────────────────────────────────

interface DrawerEmptyProps {
  message: string;
  icon?: React.ReactNode;
}

const DrawerEmpty = ({ message, icon }: DrawerEmptyProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 5,
      px: 2.5,
      gap: 1,
      color: 'text.disabled',
    }}
  >
    {icon}
    <Typography
      sx={{ fontSize: '12px', color: 'text.disabled', textAlign: 'center' }}
    >
      {message}
    </Typography>
  </Box>
);

export default AgregarCuentaDrawer;
