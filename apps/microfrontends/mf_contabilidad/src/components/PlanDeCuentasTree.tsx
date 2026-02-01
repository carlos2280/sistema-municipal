import { Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  Calendar,
  ChevronsDownUp,
  ChevronsUpDown,
  type LucideProps,
  MinusSquare,
  PlusSquare,
  SlashSquare,
} from 'lucide-react';
import { memo, type JSX } from 'react';
import type { TreeItemData } from '../utils/planDeCuentasUtils';
import { CustomTreeItem } from './CustomTreeItem';
import { TreeSearchBar } from './TreeSearchBar';

interface Props {
  year: number;
  treeData: TreeItemData[];
  expandedItems: string[];
  autoExpandedItems: string[];
  searchTerm: string;
  setExpandedItems: (ids: string[]) => void;
  onCreate: (item: TreeItemData) => void;
  onEdit: (item: TreeItemData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  setSearchTerm: (term: string) => void;
  highlight: (text: string, term: string) => JSX.Element;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const ExpandIcon = (props: LucideProps) => (
  <PlusSquare {...props} style={{ opacity: 0.8 }} />
);
const CollapseIcon = (props: LucideProps) => (
  <MinusSquare {...props} style={{ opacity: 0.8 }} />
);
const EndIcon = (props: LucideProps) => (
  <SlashSquare {...props} style={{ opacity: 0.3 }} />
);

/**
 * Árbol jerárquico del Plan de Cuentas.
 * Incluye búsqueda, expansión automática y scroll independiente.
 */
export const PlanDeCuentasTree = memo(function PlanDeCuentasTree({
  year,
  treeData,
  expandedItems,
  autoExpandedItems,
  searchTerm,
  setExpandedItems,
  setSearchTerm,
  onCreate,
  onEdit,
  onDelete,
  highlight,
  onExpandAll,
  onCollapseAll,
}: Props) {
  // Determinar si hay items expandidos para mostrar el icono correcto
  const hasExpandedItems = expandedItems.length > 0;
  // Contar total de cuentas
  const countItems = (items: TreeItemData[]): number =>
    items.reduce(
      (acc, item) => acc + 1 + (item.children ? countItems(item.children) : 0),
      0,
    );
  const totalCuentas = countItems(treeData);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Header mejorado */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<Calendar size={14} />}
              label={`Año ${year}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              {totalCuentas} cuentas
            </Typography>
            {/* Botón toggle expandir/colapsar */}
            <Tooltip
              title={hasExpandedItems ? 'Colapsar todo' : 'Expandir todo'}
              arrow
            >
              <IconButton
                size="small"
                onClick={hasExpandedItems ? onCollapseAll : onExpandAll}
                sx={{
                  ml: 0.5,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {hasExpandedItems ? (
                  <ChevronsDownUp size={18} />
                ) : (
                  <ChevronsUpDown size={18} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <TreeSearchBar value={searchTerm} onChange={setSearchTerm} />
        </Box>

      {/* Contenedor scrollable */}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
        <SimpleTreeView
          aria-label="plan de cuentas"
          slots={{
            expandIcon: ExpandIcon,
            collapseIcon: CollapseIcon,
            endIcon: EndIcon,
          }}
          expandedItems={searchTerm.trim() ? autoExpandedItems : expandedItems}
          onExpandedItemsChange={(_, ids) => setExpandedItems(ids)}
        >
          {treeData.length ? (
            treeData.map((item) => (
              <CustomTreeItem
                key={item.id}
                item={item}
                searchTerm={searchTerm}
                onCreate={onCreate}
                onEdit={onEdit}
                onDelete={onDelete}
                highlight={highlight}
              />
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                No se encontraron cuentas que coincidan con "{searchTerm}"
              </Typography>
            </Box>
          )}
        </SimpleTreeView>
      </Box>
    </Paper>
  </Box>
  );
});
