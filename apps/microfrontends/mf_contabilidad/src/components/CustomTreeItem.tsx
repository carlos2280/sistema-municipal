import { Box, Chip, IconButton, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import {
  Edit2,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { memo, type JSX } from 'react';
import type { TreeItemData } from '../utils/planDeCuentasUtils';

interface Props {
  item: TreeItemData;
  searchTerm: string;
  onCreate: (item: TreeItemData) => void;
  onEdit: (item: TreeItemData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  highlight: (text: string, term: string) => JSX.Element;
  expanded?: boolean;
}

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.75, 1.5),
    margin: theme.spacing(0.25, 0),
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: 'transparent',
    border: '1px solid transparent',

    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      borderColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,

      '& .tree-item-actions': {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },

    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.2),

      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
  },

  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 20,
    paddingLeft: 20,
    borderLeft: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      left: -1,
      top: 0,
      bottom: 0,
      width: 2,
      background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },

    '&:hover::before': {
      opacity: 1,
    },
  },
}));

const TreeItemActions = styled(Box)(({ theme }) => ({
  opacity: 0,
  transform: 'translateX(8px)',
  transition: 'all 0.2s ease-in-out',
  display: 'flex',
  gap: theme.spacing(0.25),
  marginLeft: theme.spacing(1),

  '& .MuiIconButton-root': {
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.75),
    transition: 'all 0.2s ease-in-out',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
    },

    '&.create-btn': {
      color: theme.palette.success.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        borderColor: alpha(theme.palette.success.main, 0.3),
      },
    },

    '&.edit-btn': {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
    },

    '&.delete-btn': {
      color: theme.palette.error.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        borderColor: alpha(theme.palette.error.main, 0.3),
      },
    },
  },
}));

const AccountChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
  fontFamily: 'monospace',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,

  '& .MuiChip-label': {
    padding: theme.spacing(0, 1),
  },
}));

const AccountName = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1.5),
  flexGrow: 1,
  fontWeight: 500,
  color: theme.palette.text.primary,
  lineHeight: 1.2,
}));

// Función para obtener el icono apropiado según el código de cuenta
const getAccountIcon = (codigo: string, expanded: boolean) => {
  const iconProps = { size: 18, style: { marginRight: '8px' } };

  // Remover todos los guiones y contar solo los dígitos
  const soloDigitos = codigo.replace(/-/g, '');

  // Si el código tiene 5 dígitos o más (excluyendo guiones), usar icono de archivo
  if (soloDigitos.length >= 5) {
    return <FileText {...iconProps} />;
  }

  // Para códigos con 4 dígitos o menos, usar icono de carpeta
  return expanded ? <FolderOpen {...iconProps} /> : <Folder {...iconProps} />;
};

// Nivel máximo permitido para cuentas (no se pueden crear subcuentas de nivel 8)
const MAX_NIVEL_CUENTA = 8;

export const CustomTreeItem = memo(function CustomTreeItem({
  item,
  searchTerm,
  onCreate,
  onEdit,
  onDelete,
  highlight,
  expanded = false,
}: Props) {
  const tipoCuentaId = item.tipoCuentaId ?? 0;
  const showButtons = tipoCuentaId >= 3;
  const canCreateSubcuenta = tipoCuentaId < MAX_NIVEL_CUENTA;
  const [codigo, ...nombreParts] = item.label.split(' – ');
  const nombre = nombreParts.join(' – ');
  // const hasChildren = item.children && item.children.length > 0;

  const renderLabel = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: 40,
      }}
    >
      {getAccountIcon(codigo, expanded)}

      <AccountChip
        label={highlight(codigo, searchTerm)}
        size="small"
        variant="outlined"
      />

      <AccountName variant="body2">{highlight(nombre, searchTerm)}</AccountName>

      {showButtons && (
        <TreeItemActions className="tree-item-actions">
          {canCreateSubcuenta && (
            <IconButton
              className="create-btn"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCreate(item);
              }}
              title="Crear subcuenta"
            >
              <Plus size={14} />
            </IconButton>
          )}
          <IconButton
            className="edit-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            title="Editar cuenta"
          >
            <Edit2 size={14} />
          </IconButton>
          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => onDelete(item.id, e)}
            title="Eliminar cuenta"
          >
            <Trash2 size={14} />
          </IconButton>
        </TreeItemActions>
      )}
    </Box>
  );

  return (
    <StyledTreeItem itemId={item.id} label={renderLabel()}>
      {item.children?.map((child) => (
        <CustomTreeItem
          key={child.id}
          item={child}
          searchTerm={searchTerm}
          onCreate={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
          highlight={highlight}
          expanded={expanded}
        />
      ))}
    </StyledTreeItem>
  );
});
