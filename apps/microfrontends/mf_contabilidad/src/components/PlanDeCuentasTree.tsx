import { Box, Typography } from '@mui/material';
import { memo, type JSX } from 'react';
import type { TreeItemData } from '../utils/planDeCuentasUtils';
import { CustomTreeItem } from './CustomTreeItem';

interface Props {
  treeData: TreeItemData[];
  expandedItems: string[];
  selectedId: string | null;
  contextId: string | null;
  searchTerm: string;
  isMobile?: boolean;
  onToggle: (id: string) => void;
  onSelect: (item: TreeItemData) => void;
  onCreate: (item: TreeItemData) => void;
  onEdit: (item: TreeItemData) => void;
  onDelete: (item: TreeItemData) => void;
  highlight: (text: string, term: string) => JSX.Element;
}

export const PlanDeCuentasTree = memo(function PlanDeCuentasTree({
  treeData,
  expandedItems,
  selectedId,
  contextId,
  searchTerm,
  isMobile = false,
  onToggle,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  highlight,
}: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Scrollable tree area */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: isMobile ? 0 : 1 }}>
        {treeData.length > 0 ? (
          treeData.map((item) => (
            <CustomTreeItem
              key={item.id}
              item={item}
              level={0}
              expandedItems={expandedItems}
              selectedId={selectedId}
              contextId={contextId}
              searchTerm={searchTerm}
              isMobile={isMobile}
              onToggle={onToggle}
              onSelect={onSelect}
              onCreate={onCreate}
              onEdit={onEdit}
              onDelete={onDelete}
              highlight={highlight}
            />
          ))
        ) : searchTerm ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No se encontraron cuentas
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
});
