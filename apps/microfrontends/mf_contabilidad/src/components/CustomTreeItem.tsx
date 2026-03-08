import { Box, Typography } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { memo, type JSX } from 'react';
import type { TreeItemData } from '../utils/planDeCuentasUtils';

export interface TreeNodeProps {
  item: TreeItemData;
  level: number;
  expandedItems: string[];
  selectedId: string | null;
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

/* ── Badge config by tipoCuentaId ── */
const badgeConfig: Record<number, { label: string; bgColor: string; color: string }> = {
  1: { label: 'TITULO', bgColor: 'rgba(13,107,94,0.12)', color: 'rgb(13,107,94)' },
  2: { label: 'GRUPO', bgColor: 'rgba(79,70,201,0.1)', color: '#4f46c9' },
  3: { label: 'SUBGRUPO', bgColor: 'rgba(217,119,6,0.1)', color: '#d97706' },
};

/** Color del borde izquierdo por nivel en mobile */
const MOBILE_LEVEL_COLORS = [
  '#0d6b5e', // 0 Titulo — jade primary
  '#6366f1', // 1 Grupo — indigo
  '#d97706', // 2 Subgrupo — amber
] as const;

function getMobileBorderColor(level: number, divider: string): string {
  if (level < MOBILE_LEVEL_COLORS.length) return MOBILE_LEVEL_COLORS[level];
  return divider;
}

function getMobileBorderWidth(level: number): number {
  if (level === 0) return 4;
  if (level <= 2) return 3;
  return 2;
}

/* ── Styled components ── */

const NodeRow = styled(Box, {
  shouldForwardProp: (p) => p !== 'isSelected',
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  margin: '1px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  gap: 4,
  position: 'relative',
  transition: 'background-color 150ms ease',

  ...(isSelected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 3,
      top: 4,
      bottom: 4,
      width: 3,
      borderRadius: 2,
      backgroundColor: theme.palette.primary.main,
    },
  }),

  '&:hover': {
    backgroundColor: isSelected
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.primary.main, 0.05),
    '& .tree-actions': {
      opacity: 1,
    },
  },
}));

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
    backgroundColor: theme.palette.divider,
  },
}));

const ToggleBtn = styled('button', {
  shouldForwardProp: (p) => p !== 'isExpanded' && p !== 'isLeaf',
})<{ isExpanded?: boolean; isLeaf?: boolean }>(({ theme, isExpanded, isLeaf }) => ({
  width: 20,
  height: 20,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  color: theme.palette.text.disabled,
  cursor: 'pointer',
  borderRadius: 4,
  padding: 0,
  flexShrink: 0,
  transition: 'transform 150ms ease, background-color 150ms ease, color 150ms ease',

  ...(isExpanded && {
    transform: 'rotate(90deg)',
  }),

  ...(isLeaf && {
    visibility: 'hidden' as const,
  }),

  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}));

const NodeIcon = styled('span', {
  shouldForwardProp: (p) => p !== 'isFolder',
})<{ isFolder?: boolean }>(({ theme, isFolder }) => ({
  width: 18,
  height: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: isFolder ? '#d97706' : theme.palette.text.disabled,
}));

const LabelWrap = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  minWidth: 0,
});

const ActionsWrap = styled(Box)({
  opacity: 0,
  display: 'flex',
  gap: 2,
  marginLeft: 8,
  flexShrink: 0,
  transition: 'opacity 150ms ease',
});

const ActionBtn = styled('button')<{ variant: 'add' | 'edit' | 'delete' }>(
  ({ variant }) => {
    const colors = {
      add: { color: '#059669', hoverBg: 'rgba(5,150,105,0.12)' },
      edit: { color: '#2563eb', hoverBg: 'rgba(37,99,235,0.12)' },
      delete: { color: '#ef4444', hoverBg: 'rgba(220,38,38,0.1)' },
    };
    const c = colors[variant];
    return {
      width: 24,
      height: 24,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 4,
      backgroundColor: 'transparent',
      color: c.color,
      cursor: 'pointer',
      padding: 0,
      '&:hover': {
        backgroundColor: c.hoverBg,
      },
    };
  },
);

const ChildrenWrap = styled(Box, {
  shouldForwardProp: (p) => p !== 'isExpanded',
})<{ isExpanded?: boolean }>(({ isExpanded }) => ({
  overflow: 'hidden',
  maxHeight: isExpanded ? 2000 : 0,
  opacity: isExpanded ? 1 : 0,
  transition: 'max-height 300ms ease, opacity 200ms ease',
}));

const TypeBadge = styled('span')<{ badgetype: 'titulo' | 'grupo' | 'subgrupo' }>(
  ({ badgetype }) => {
    const cfg = {
      titulo: badgeConfig[1],
      grupo: badgeConfig[2],
      subgrupo: badgeConfig[3],
    }[badgetype];
    return {
      fontSize: '0.5625rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      padding: '1px 6px',
      borderRadius: 3,
      backgroundColor: cfg.bgColor,
      color: cfg.color,
      whiteSpace: 'nowrap' as const,
      lineHeight: 1.4,
    };
  },
);

/* ── Mobile level-specific text styles ── */
const MOBILE_CODE_STYLES: Record<number, object> = {
  0: { fontSize: '0.875rem', fontWeight: 800, color: '#0d6b5e' },
  1: { fontSize: '0.8125rem', fontWeight: 700, color: '#6366f1' },
  2: { fontSize: '0.8125rem', fontWeight: 600, color: '#d97706' },
};

const MOBILE_NAME_STYLES: Record<number, object> = {
  0: { fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.02em' },
  1: { fontSize: '0.875rem', fontWeight: 600 },
  2: { fontSize: '0.8125rem', fontWeight: 550 },
};

/* ── Component ── */

export const CustomTreeItem = memo(function CustomTreeItem({
  item,
  level,
  expandedItems,
  selectedId,
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
  const tipoCuentaId = item.tipoCuentaId ?? 0;
  // Carpeta solo si realmente tiene hijos — así cuentas sin subcuentas muestran ícono de archivo
  const isFolder = hasChildren;

  // Split label into code and name
  const [codigo, ...nombreParts] = item.label.split(' – ');
  const nombre = nombreParts.join(' – ');

  // Badge: only for levels 0-2 (tipoCuentaId 1-3)
  const badgeType =
    tipoCuentaId === 1
      ? 'titulo'
      : tipoCuentaId === 2
        ? 'grupo'
        : tipoCuentaId === 3
          ? 'subgrupo'
          : null;

  // Desktop level-based text styling
  const codeFontSize = level === 0 ? '0.8125rem' : '0.75rem';
  const nameFontSize = level === 0 ? '0.875rem' : '0.8125rem';
  const nameFontWeight = level === 0 ? 700 : level === 1 ? 600 : 450;

  // Action visibility — Titulos(1), Grupos(2), Subgrupos(3) son fijos CGR/SUBDERE
  const canAdd = tipoCuentaId >= 3 && tipoCuentaId < MAX_NIVEL_CUENTA;
  const canEdit = tipoCuentaId >= 4;
  const canDelete = tipoCuentaId >= 5;

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);
    if (hasChildren) {
      onToggle(item.id);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(item.id);
  };

  // ── Mobile: border color and width by level ──────────────────────
  const mobileBorderColor = getMobileBorderColor(level, theme.palette.divider);
  const mobileBorderWidth = getMobileBorderWidth(level);

  // ── Mobile code/name styles ──────────────────────────────────────
  const mobileCodeStyle = MOBILE_CODE_STYLES[level] ?? {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.disabled,
  };
  const mobileNameStyle = MOBILE_NAME_STYLES[level] ?? {
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
  };

  return (
    <Box>
      <NodeRow
        isSelected={isSelected}
        onClick={handleRowClick}
        sx={
          isMobile
            ? {
                margin: 0,
                borderRadius: 0,
                minHeight: level === 0 ? 52 : 48,
                padding:
                  level === 0 ? '16px 12px 16px 16px' : '12px 12px 12px 16px',
                borderLeft: `${mobileBorderWidth}px solid ${isSelected ? theme.palette.primary.main : mobileBorderColor}`,
                borderTop: '1px solid rgba(226, 232, 240, 0.3)',
                background:
                  isSelected
                    ? `rgba(13, 107, 94, 0.06)`
                    : level === 0
                      ? 'rgba(13, 107, 94, 0.03)'
                      : 'transparent',
                '&::before': { display: 'none' },
                '&:hover': {
                  background: isSelected
                    ? 'rgba(13, 107, 94, 0.08)'
                    : 'rgba(13, 107, 94, 0.03)',
                  '& .tree-actions': { opacity: 1 },
                },
              }
            : undefined
        }
      >
        {/* Indent guides — ocultas en mobile (jerarquía por borde de color) */}
        {!isMobile &&
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

        {/* Node icon */}
        <NodeIcon
          isFolder={isFolder}
          sx={isMobile ? { width: 16, height: 16 } : undefined}
        >
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={isMobile ? 16 : 18} />
            ) : (
              <Folder size={isMobile ? 16 : 18} />
            )
          ) : (
            <FileText size={isMobile ? 16 : 18} />
          )}
        </NodeIcon>

        {/* Label */}
        <LabelWrap
          sx={
            isMobile
              ? { flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }
              : undefined
          }
        >
          {/* Código */}
          <Typography
            component="span"
            sx={
              isMobile
                ? {
                    fontFamily: 'monospace',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    ...mobileCodeStyle,
                  }
                : {
                    fontFamily: 'monospace',
                    fontSize: codeFontSize,
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    whiteSpace: 'nowrap',
                  }
            }
          >
            {highlight(codigo, searchTerm)}
          </Typography>

          {/* Separador — oculto en mobile */}
          {!isMobile && (
            <Typography
              component="span"
              sx={{
                color: theme.palette.text.disabled,
                fontSize: '0.8125rem',
                userSelect: 'none',
              }}
            >
              —
            </Typography>
          )}

          {/* Nombre */}
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
                : {
                    fontSize: nameFontSize,
                    fontWeight: nameFontWeight,
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }
            }
          >
            {highlight(nombre, searchTerm)}
          </Typography>

          {/* Type badge — solo en desktop */}
          {!isMobile && badgeType && (
            <TypeBadge badgetype={badgeType}>{badgeConfig[tipoCuentaId].label}</TypeBadge>
          )}
        </LabelWrap>

        {/* Hover/touch actions */}
        <ActionsWrap
          className="tree-actions"
          sx={
            isMobile
              ? {
                  opacity: 1,
                  gap: '2px',
                  marginLeft: '4px',
                  '& button': { width: 32, height: 32, borderRadius: '6px' },
                }
              : undefined
          }
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

      {/* Children (recursive) */}
      {hasChildren && (
        <ChildrenWrap isExpanded={isExpanded}>
          {item.children!.map((child) => (
            <CustomTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              selectedId={selectedId}
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
        </ChildrenWrap>
      )}
    </Box>
  );
});
