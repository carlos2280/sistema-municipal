import { Box, Paper, Typography } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  type LucideProps,
  MinusSquare,
  PlusSquare,
  SlashSquare,
} from 'lucide-react';
import type { FC, JSX } from 'react';
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
  onCreate: (
    item: TreeItemData,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  setSearchTerm: (term: string) => void;
  highlight: (text: string, term: string) => JSX.Element;
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
 * El contenedor añade overflowY:auto para mostrar una barra de desplazamiento vertical
 * cuando el árbol sobrepasa la altura disponible.
 */
export const PlanDeCuentasTree: FC<Props> = ({
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
}) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
    <Paper
      elevation={1}
      sx={{
        p: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        // border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden', // evita doble scroll
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Typography>año contable: {year}</Typography>
        <TreeSearchBar value={searchTerm} onChange={setSearchTerm} />
      </Box>

      {/* Contenedor scrollable */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
