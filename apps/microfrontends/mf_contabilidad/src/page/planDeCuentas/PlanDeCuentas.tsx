import { Box, Button, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  Calendar,
  ChevronRight,
  Download,
  FoldVertical,
  GitBranch,
  Layers,
  Printer,
  Search,
  UnfoldVertical,
  X,
} from 'lucide-react';
import { memo, type JSX, useCallback, useMemo, useState } from 'react';

import { PlanDeCuentasTree } from '../../components/PlanDeCuentasTree';
import { AccountPanel } from '../../components/planCuentas/AccountPanel';
import { DeleteConfirmDialog } from '../../components/planCuentas/DeleteConfirmDialog';
import { useAccountPanel } from '../../hooks/planesCuentas/useAccountPanel';
import { usePlanDeCuentasTree } from '../../hooks/planesCuentas/usePlanDeCuentasTree';
import type { TreeItemData } from '../../utils/planDeCuentasUtils';

// ─── Styled Components ──────────────────────────────────────────────

const PageHeaderRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: 16,
  minHeight: 56,
  [theme.breakpoints.down(640)]: {
    padding: '8px 16px',
    minHeight: 44,
    gap: 8,
  },
}));

const Breadcrumb = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  marginBottom: 4,
  '& a': {
    color: theme.palette.text.disabled,
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  '& .separator': {
    color: theme.palette.text.disabled,
    display: 'flex',
    alignItems: 'center',
  },
  '& .current': {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  [theme.breakpoints.down(640)]: {
    display: 'none',
  },
}));

const YearSelector = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 8px 3px 6px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  transition: 'border-color 150ms ease, background-color 150ms ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
  },
  '&:hover .year-icon': {
    color: theme.palette.primary.main,
  },
  '& .year-icon': {
    color: theme.palette.text.disabled,
    display: 'flex',
    transition: 'color 150ms ease',
  },
  '& select': {
    appearance: 'none' as const,
    border: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    outline: 'none',
    paddingRight: 2,
  },
  [theme.breakpoints.down(640)]: {
    padding: '2px 6px 2px 4px',
    '& .year-icon': { display: 'none' },
    '& select': { fontSize: '0.75rem' },
  },
}));

const ToolbarRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 24px',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down(640)]: {
    padding: '8px 16px',
    gap: 8,
  },
}));

const SearchContainer = styled(Box)(() => ({
  position: 'relative',
  flex: 1,
  maxWidth: 360,
}));

const SearchInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '8px 12px 8px 36px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  backgroundColor: theme.palette.background.default,
  fontSize: '0.8125rem',
  fontFamily: 'inherit',
  color: theme.palette.text.primary,
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
  '&:focus': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  color: theme.palette.text.disabled,
  pointerEvents: 'none',
}));

const ClearButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  '&:hover': {
    backgroundColor: theme.palette.action.active,
    color: theme.palette.text.primary,
  },
}));

const StatsContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginLeft: 'auto',
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  '& .stat-value': {
    fontFamily: 'var(--font-mono, monospace)',
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.8125rem',
  },
}));

const ActionsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 8,
  paddingLeft: 12,
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

/** Overlay de búsqueda móvil — se muestra fixed en la parte superior */
const MobileSearchOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 110,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// ─── Helpers ────────────────────────────────────────────────────────

function countNodes(nodes: TreeItemData[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1;
    if (node.children?.length) {
      count += countNodes(node.children);
    }
  }
  return count;
}

function buildYearOptions(): number[] {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2, current - 3];
}

// ─── Component ──────────────────────────────────────────────────────

export const PlanDeCuentas = memo(function PlanDeCuentas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(640));
  const isSmallPhone = useMediaQuery(theme.breakpoints.down(380));

  const tree = usePlanDeCuentasTree();
  const panel = useAccountPanel();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteTarget, setDeleteTarget] = useState<{ item: TreeItemData } | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const yearOptions = useMemo(() => buildYearOptions(), []);
  const totalCuentas = useMemo(() => countNodes(tree.treeData), [tree.treeData]);

  // ── Handlers ────────────────────────────────────────────────────

  const handleToggleNode = useCallback(
    (id: string) => {
      const current = tree.searchTerm.trim()
        ? tree.autoExpandedItems
        : tree.expandedItems;
      tree.setExpandedItems(
        current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id],
      );
    },
    [tree],
  );

  const handleSelectNode = useCallback(
    (item: TreeItemData) => {
      // Solo abrir panel de edicion para cuentas editables (tipoCuentaId >= 4)
      if (item.tipoCuentaId >= 4) {
        panel.openEditPanel(item);
      }
    },
    [panel],
  );

  const handleDelete = useCallback((item: TreeItemData) => {
    setDeleteTarget({ item });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    // TODO: implementar eliminacion real via API
    console.log('Confirmar eliminacion:', deleteTarget.item.id);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleMobileSearchClose = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  // ── Highlight ────────────────────────────────────────────────────

  const highlightSearchTerm = useCallback(
    (text: string, term: string): JSX.Element => {
      if (!term.trim()) return <span>{text}</span>;

      const regex = new RegExp(`(${term})`, 'gi');
      const parts = text.split(regex);

      return (
        <span>
          {parts.map((part, i) =>
            part.toLowerCase() === term.toLowerCase() ? (
              <Box
                key={i}
                component="span"
                sx={{
                  backgroundColor: (t) => alpha(t.palette.primary.dark, 0.08),
                  color: 'primary.main',
                  fontWeight: 500,
                  padding: '1px 2px',
                  borderRadius: '2px',
                  fontStyle: 'italic',
                }}
              >
                {part}
              </Box>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </span>
      );
    },
    [],
  );

  // ── Render ────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* ── PageHeader ──────────────────────────────────────────── */}
      <PageHeaderRoot>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Breadcrumb>
            <a>Inicio</a>
            <span className="separator">
              <ChevronRight size={12} />
            </span>
            <a>Contabilidad</a>
            <span className="separator">
              <ChevronRight size={12} />
            </span>
            <span className="current">Plan de Cuentas</span>
          </Breadcrumb>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Plan de Cuentas
            </Typography>

            <YearSelector>
              <span className="year-icon">
                <Calendar size={14} />
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </YearSelector>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<UnfoldVertical size={14} />}
            onClick={tree.expandAll}
            sx={isSmallPhone ? { minWidth: 36, px: 0, '& .MuiButton-startIcon': { mr: 0 }, '& span:last-child': { display: 'none' } } : undefined}
          >
            {!isSmallPhone && 'Expandir'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<FoldVertical size={14} />}
            onClick={tree.collapseAll}
            sx={isSmallPhone ? { minWidth: 36, px: 0, '& .MuiButton-startIcon': { mr: 0 }, '& span:last-child': { display: 'none' } } : undefined}
          >
            {!isSmallPhone && 'Colapsar'}
          </Button>
        </Box>
      </PageHeaderRoot>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <ToolbarRoot>
        {/* Desktop/Tablet: search input inline */}
        {!isMobile && (
          <SearchContainer>
            <SearchIconWrapper>
              <Search size={14} />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Buscar por codigo o nombre..."
              value={tree.searchTerm}
              onChange={(e) => tree.setSearchTerm(e.target.value)}
            />
            {tree.searchTerm && (
              <ClearButton onClick={tree.clearSearch} type="button">
                <X size={12} />
              </ClearButton>
            )}
          </SearchContainer>
        )}

        {/* Mobile: botón icono para abrir search overlay */}
        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setMobileSearchOpen(true)}
            sx={{
              width: 36,
              height: 36,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              color: 'text.secondary',
              bgcolor: 'background.default',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                color: 'primary.main',
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <Search size={16} />
          </IconButton>
        )}

        {/* Stats — ocultas en mobile */}
        {!isMobile && (
          <StatsContainer>
            <StatItem>
              <Layers size={12} />
              Cuentas
              <span className="stat-value">{totalCuentas}</span>
            </StatItem>
            <StatItem>
              <GitBranch size={12} />
              Niveles
              <span className="stat-value">8</span>
            </StatItem>
          </StatsContainer>
        )}

        <ActionsGroup
          sx={
            isMobile
              ? { marginLeft: 'auto', paddingLeft: 0, borderLeft: 'none' }
              : undefined
          }
        >
          <Tooltip title="Exportar plan">
            <IconButton size="small">
              <Download size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton size="small">
              <Printer size={16} />
            </IconButton>
          </Tooltip>
        </ActionsGroup>
      </ToolbarRoot>

      {/* ── Mobile search overlay ─────────────────────────────────── */}
      {isMobile && mobileSearchOpen && (
        <MobileSearchOverlay>
          <SearchContainer sx={{ flex: 1, maxWidth: 'none' }}>
            <SearchIconWrapper>
              <Search size={14} />
            </SearchIconWrapper>
            <SearchInput
              autoFocus
              placeholder="Buscar cuenta..."
              value={tree.searchTerm}
              onChange={(e) => tree.setSearchTerm(e.target.value)}
            />
            {tree.searchTerm && (
              <ClearButton
                onClick={() => {
                  tree.clearSearch();
                }}
                type="button"
              >
                <X size={12} />
              </ClearButton>
            )}
          </SearchContainer>
          <IconButton
            size="small"
            onClick={handleMobileSearchClose}
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: 'error.main',
              },
            }}
          >
            <X size={18} />
          </IconButton>
        </MobileSearchOverlay>
      )}

      {/* ── Split container ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <PlanDeCuentasTree
          treeData={
            tree.searchTerm.trim() ? tree.filteredTreeData : tree.treeData
          }
          expandedItems={
            tree.searchTerm.trim() ? tree.autoExpandedItems : tree.expandedItems
          }
          selectedId={panel.selectedItem?.id || null}
          searchTerm={tree.searchTerm}
          isMobile={isMobile}
          onToggle={handleToggleNode}
          onSelect={handleSelectNode}
          onCreate={panel.openCreatePanel}
          onEdit={panel.openEditPanel}
          onDelete={handleDelete}
          highlight={highlightSearchTerm}
        />

        <AccountPanel
          open={panel.isOpen}
          mode={panel.mode}
          selectedItem={panel.selectedItem}
          methods={panel.methods}
          onClose={panel.closePanel}
          onSubmit={panel.handleSubmit}
          isLoading={panel.isLoading}
          codigoStatus={panel.codigoStatus}
          codigoExistente={panel.codigoExistente}
        />
      </Box>

      {/* ── Delete dialog ────────────────────────────────────────── */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        accountCode={deleteTarget?.item.label.split(' – ')[0] || ''}
        accountName={deleteTarget?.item.label.split(' – ')[1] || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
});

export default PlanDeCuentas;
