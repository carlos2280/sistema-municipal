import type { TreeItemData } from '@/utils/planDeCuentasUtils';
import { Box, Typography } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { ChevronRight, Crosshair, Pencil, Plus, Trash2 } from 'lucide-react';
import { type JSX, memo, useCallback } from 'react';

export interface TreeNodeProps {
  item: TreeItemData;
  level: number;
  expandedItems: string[];
  selectedId: string | null;
  hasSelection: boolean;
  contextId?: string | null;
  actingId?: string | null;
  searchTerm: string;
  isMobile?: boolean;
  onToggle: (id: string) => void;
  onSelect: (item: TreeItemData) => void;
  onCreate: (item: TreeItemData) => void;
  onEdit: (item: TreeItemData) => void;
  onDelete: (item: TreeItemData) => void;
  highlight: (text: string, term: string) => JSX.Element;
}

const MAX_NIVEL_CUENTA = 8;

/* ── MERIDIAN Typography ── */
const FONT_MONO = '"DM Mono", monospace';
const FONT_SANS = '"DM Sans", sans-serif';

/* ── MERIDIAN Easing ── */
const EASING_SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Mobile border color by level — theme-aware */
function getMobileBorderColor(level: number, theme: Theme): string {
  if (level === 0) return theme.palette.primary.main;
  if (level === 1) return theme.palette.info.main;
  if (level === 2) return theme.palette.warning.main;
  return theme.palette.divider;
}

function getMobileBorderWidth(level: number): number {
  if (level === 0) return 4;
  if (level <= 2) return 3;
  return 2;
}

/** Mobile code typography by level — theme-aware */
function getMobileCodeStyle(level: number, theme: Theme) {
  if (level === 0)
    return {
      fontSize: '0.875rem',
      fontWeight: 800,
      color: theme.palette.primary.main,
    };
  if (level === 1)
    return {
      fontSize: '0.8125rem',
      fontWeight: 700,
      color: theme.palette.info.main,
    };
  if (level === 2)
    return {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: theme.palette.warning.main,
    };
  return {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.disabled,
  };
}

/** Mobile name typography by level */
function getMobileNameStyle(level: number, theme: Theme) {
  if (level === 0)
    return {
      fontSize: '0.9375rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.02em',
    };
  if (level === 1) return { fontSize: '0.875rem', fontWeight: 600 };
  if (level === 2) return { fontSize: '0.8125rem', fontWeight: 550 };
  return {
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
  };
}

/* ── Styled components ── */

const NodeRow = styled(Box, {
  shouldForwardProp: (p) => p !== 'isSelected' && p !== 'isContext',
})<{ isSelected?: boolean; isContext?: boolean }>(
  ({ theme, isSelected, isContext }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    margin: '1px 8px',
    borderRadius: 6,
    cursor: 'pointer',
    gap: 4,
    position: 'relative',
    minHeight: 32,
    transition: 'background-color 80ms', // MERIDIAN: instant hover

    // Acting state (context — creating/editing) — priority over selected
    ...(isContext && {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: theme.palette.primary.main,
        opacity: 0.5,
      },
    }),

    // Selected state — only when NOT acting
    ...(!isContext &&
      isSelected && {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: theme.palette.primary.main,
        },
      }),

    '&:hover': {
      backgroundColor: isContext
        ? alpha(theme.palette.primary.main, 0.08)
        : isSelected
          ? alpha(theme.palette.primary.main, 0.12)
          : theme.meridian.surfaces.s3,
      '& .tree-actions': {
        opacity: 1,
        pointerEvents: 'all' as const,
      },
    },
  }),
);

const IndentGuide = styled('span')(({ theme }) => ({
  width: 20,
  display: 'inline-flex',
  flexShrink: 0,
  position: 'relative',
  alignSelf: 'stretch',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 9,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: theme.meridian.borders.muted,
  },
}));

const ToggleBtn = styled('button', {
  shouldForwardProp: (p) => p !== 'isExpanded' && p !== 'isLeaf',
})<{ isExpanded?: boolean; isLeaf?: boolean }>(
  ({ theme, isExpanded, isLeaf }) => ({
    width: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.meridian.text.tx4,
    cursor: 'pointer',
    borderRadius: 3,
    padding: 0,
    flexShrink: 0,
    marginRight: 4,
    transition: `transform 200ms ${EASING_SPRING}, color 150ms`,

    ...(isExpanded && {
      transform: 'rotate(90deg)',
      color: theme.palette.primary.main,
    }),

    ...(isLeaf && {
      visibility: 'hidden' as const,
    }),

    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
    },
  }),
);

const LabelWrap = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  minWidth: 0,
});

/* ── MERIDIAN Action container — positioned with bg/border/shadow ── */
const ActionsWrap = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 4px',
  background: theme.meridian.surfaces.s3,
  border: `1px solid ${theme.meridian.borders.muted}`,
  borderRadius: 4,
  boxShadow: theme.meridian.shadows.sm,
  opacity: 0,
  pointerEvents: 'none' as const,
  transition: 'opacity 120ms',
  zIndex: 2,
}));

/* ── MERIDIAN 28×28px action buttons ── */
const ActionBtn = styled('button')<{ variant: 'add' | 'edit' | 'delete' }>(
  ({ theme, variant }) => {
    const colorMap = {
      add: { base: theme.palette.primary.main, hoverAlpha: 0.12 },
      edit: { base: theme.palette.info.main, hoverAlpha: 0.1 },
      delete: { base: theme.palette.error.main, hoverAlpha: 0.1 },
    };
    const c = colorMap[variant];
    return {
      width: 28,
      height: 28,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 5,
      backgroundColor: 'transparent',
      color: theme.palette.text.disabled,
      cursor: 'pointer',
      padding: 0,
      transition: 'background 100ms, color 100ms',
      '&:hover': {
        backgroundColor: alpha(c.base, c.hoverAlpha),
        color: c.base,
      },
    };
  },
);

/* ── Component ── */

export const CustomTreeItem = memo(function CustomTreeItem({
  item,
  level,
  expandedItems,
  selectedId,
  hasSelection,
  contextId,
  actingId,
  searchTerm,
  isMobile = false,
  onToggle,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  highlight,
}: TreeNodeProps) {
  const theme = useTheme();
  const hasChildren = !!(item.children && item.children.length > 0);
  const isExpanded = expandedItems.includes(item.id);
  const isSelected = selectedId === item.id;
  const isContext = !!contextId && contextId === String(item.idPlanCuenta);
  const isActing = !!actingId && actingId === item.id;
  const tipoCuentaId = item.tipoCuentaId ?? 0;
  // MERIDIAN: suppress hover-actions on non-selected nodes when selection is active
  const suppressActions = hasSelection && !isSelected;

  // Split label into code and name
  const [codigo, ...nombreParts] = item.label.split(' – ');
  const nombre = nombreParts.join(' – ');

  // Action visibility — Titulos(1), Grupos(2), Subgrupos(3) son fijos CGR/SUBDERE
  const canAdd = tipoCuentaId >= 3 && tipoCuentaId < MAX_NIVEL_CUENTA;
  const canEdit = tipoCuentaId >= 4;
  const canDelete = tipoCuentaId >= 5;

  // N1 (Título) gets a bottom border separator like the prototype
  const isN1 = tipoCuentaId === 1;

  // ── Desktop MERIDIAN typography ──
  const desktopCodeStyle = {
    fontFamily: FONT_MONO,
    fontSize:
      level === 0
        ? '13px'
        : level === 1
          ? '12px'
          : level >= 5
            ? level >= 7
              ? '10.5px'
              : '11px'
            : '11.5px',
    fontWeight: level === 0 ? 600 : 400,
    letterSpacing: '0.02em',
    fontFeatureSettings: "'tnum' 1, 'cv01' 1",
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap' as const,
  };

  const desktopNameStyle = {
    fontFamily: FONT_SANS,
    fontSize:
      level === 0
        ? '13.5px'
        : level >= 5
          ? level >= 7
            ? '12px'
            : '12.5px'
          : '13px',
    fontWeight: level === 0 ? 600 : level === 1 ? 500 : 400,
    color:
      level >= 5 ? theme.palette.text.secondary : theme.palette.text.primary,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  };

  // ── Mobile typography ──
  const mobileCodeStyle = getMobileCodeStyle(level, theme);
  const mobileNameStyle = getMobileNameStyle(level, theme);
  const mobileBorderColor = getMobileBorderColor(level, theme);
  const mobileBorderWidth = getMobileBorderWidth(level);

  // ── Handlers with useCallback ──
  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(item);
      if (hasChildren) {
        onToggle(item.id);
      }
    },
    [item, hasChildren, onSelect, onToggle],
  );

  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(item.id);
    },
    [item.id, onToggle],
  );

  return (
    <Box>
      <NodeRow
        isSelected={isSelected || isActing}
        isContext={isContext}
        onClick={handleRowClick}
        sx={{
          // N1 separator line (prototype: .pc-lv0 > .pc-node-row border-bottom)
          ...(isN1 &&
            !isMobile && {
              borderBottom: `1px solid ${theme.meridian.borders.muted}`,
            }),
          ...(isMobile && {
            margin: 0,
            borderRadius: 0,
            minHeight: level === 0 ? 52 : 48,
            padding:
              level === 0 ? '16px 12px 16px 16px' : '12px 12px 12px 16px',
            borderLeft: `${mobileBorderWidth}px solid ${
              isContext || isSelected
                ? theme.palette.primary.main
                : mobileBorderColor
            }`,
            borderTop: `1px solid ${theme.palette.divider}`,
            background: isContext
              ? alpha(theme.palette.primary.main, 0.05)
              : isSelected
                ? alpha(theme.palette.primary.main, 0.06)
                : level === 0
                  ? alpha(theme.palette.primary.main, 0.03)
                  : 'transparent',
            '&::before': { display: 'none' },
            '&:hover': {
              background: isContext
                ? alpha(theme.palette.primary.main, 0.08)
                : isSelected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.03),
              '& .tree-actions': { opacity: 1 },
            },
          }),
        }}
      >
        {/* Indent guides — hidden in mobile */}
        {!isMobile &&
          // biome-ignore lint/suspicious/noArrayIndexKey: indent guides son posiciones visuales sin ID estable
          Array.from({ length: level }, (_, i) => <IndentGuide key={i} />)}

        {/* Toggle chevron */}
        <ToggleBtn
          isExpanded={isExpanded}
          isLeaf={!hasChildren}
          onClick={handleToggleClick}
          tabIndex={-1}
          aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          sx={
            isMobile
              ? {
                  width: 28,
                  height: 28,
                  ...(!hasChildren && {
                    width: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                    margin: 0,
                    padding: 0,
                    visibility: 'visible',
                  }),
                }
              : undefined
          }
        >
          <ChevronRight size={14} />
        </ToggleBtn>

        {/* Label — MERIDIAN order: código → badge → nombre */}
        <LabelWrap
          sx={
            isMobile
              ? {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '1px',
                }
              : undefined
          }
        >
          {/* Código — DM Mono */}
          <Typography
            component="span"
            sx={
              isMobile
                ? {
                    fontFamily: FONT_MONO,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    ...mobileCodeStyle,
                  }
                : { ...desktopCodeStyle, marginRight: '4px' }
            }
          >
            {highlight(codigo, searchTerm)}
          </Typography>

          {/* Nombre — DM Sans */}
          <Typography
            component="span"
            sx={
              isMobile
                ? {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    ...mobileNameStyle,
                  }
                : desktopNameStyle
            }
          >
            {highlight(nombre, searchTerm)}
          </Typography>
        </LabelWrap>

        {/* Context indicator: "Creando aquí" */}
        {isContext && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              px: '7px',
              py: '2px',
              mr: 0.5,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              color: 'success.main',
              fontSize: '0.5625rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            <Crosshair size={9} style={{ flexShrink: 0 }} />
            {!isMobile && '\u00a0Creando aquí'}
          </Box>
        )}

        {/* Hover/touch actions — MERIDIAN positioned container */}
        <ActionsWrap
          className="tree-actions"
          sx={{
            // Selected node: always show actions
            ...(isSelected &&
              !isMobile && {
                opacity: 1,
                pointerEvents: 'all' as const,
              }),
            // Suppress actions on non-selected nodes when selection is active
            ...(suppressActions &&
              !isMobile && {
                opacity: '0 !important',
                pointerEvents: 'none !important' as const,
              }),
            ...(isMobile && {
              position: 'relative',
              right: 'auto',
              top: 'auto',
              transform: 'none',
              opacity: 1,
              pointerEvents: 'all',
              gap: '2px',
              marginLeft: '4px',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: 0,
              '& button': { width: 32, height: 32, borderRadius: '6px' },
            }),
          }}
        >
          {canAdd && (
            <ActionBtn
              variant="add"
              title="Crear subcuenta"
              onClick={(e) => {
                e.stopPropagation();
                onCreate(item);
              }}
            >
              <Plus size={isMobile ? 15 : 14} />
            </ActionBtn>
          )}
          {canEdit && (
            <ActionBtn
              variant="edit"
              title="Editar cuenta"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Pencil size={isMobile ? 15 : 14} />
            </ActionBtn>
          )}
          {canDelete && (
            <ActionBtn
              variant="delete"
              title="Eliminar cuenta"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Trash2 size={isMobile ? 15 : 14} />
            </ActionBtn>
          )}
        </ActionsWrap>
      </NodeRow>

      {/* Children (recursive) — only mount when expanded */}
      {hasChildren &&
        isExpanded &&
        (item.children ?? []).map((child) => (
          <CustomTreeItem
            key={child.id}
            item={child}
            level={level + 1}
            expandedItems={expandedItems}
            selectedId={selectedId}
            hasSelection={hasSelection}
            contextId={contextId}
            actingId={actingId}
            searchTerm={searchTerm}
            isMobile={isMobile}
            onToggle={onToggle}
            onSelect={onSelect}
            onCreate={onCreate}
            onEdit={onEdit}
            onDelete={onDelete}
            highlight={highlight}
          />
        ))}
    </Box>
  );
});
