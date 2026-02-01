import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { memo, type JSX, useCallback } from 'react';

import { AccountPanel } from '../../components/planCuentas/AccountPanel';
import { PlanDeCuentasTree } from '../../components/PlanDeCuentasTree';
import { useAccountPanel } from '../../hooks/planesCuentas/useAccountPanel';
import { usePlanDeCuentasTree } from '../../hooks/planesCuentas/usePlanDeCuentasTree';

/**
 * Página principal de Plan de Cuentas.
 *
 * Layout:
 * - Panel izquierdo: Árbol jerárquico con búsqueda
 * - Panel derecho: Formulario crear/editar (se ocultan mutuamente)
 *
 * Optimizaciones:
 * - Uso de React.memo en componentes hijos
 * - Callbacks memoizados para evitar re-renders
 * - Layout flex con scroll independiente por sección
 */
export const PlanDeCuentas = memo(function PlanDeCuentas() {
  // Hook del árbol (datos, búsqueda, expansión)
  const tree = usePlanDeCuentasTree();

  // Hook del panel (crear/editar)
  const panel = useAccountPanel();

  // Highlight de búsqueda memoizado
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
                key={`${part}-${i}`}
                component="span"
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.dark, 0.08),
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 500,
                  padding: '1px 2px',
                  borderRadius: '2px',
                  fontStyle: 'italic',
                }}
              >
                {part}
              </Box>
            ) : (
              <span key={`${part}-${i}`}>{part}</span>
            ),
          )}
        </span>
      );
    },
    [],
  );

  // Handler para eliminar (pendiente implementación completa)
  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Eliminar cuenta:', id);
    // TODO: Implementar confirmación y eliminación
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        minWidth: 0, // Crítico para que flexbox respete el contenedor padre
        gap: 2,
        overflow: 'hidden',
      }}
    >
      {/* Panel izquierdo: Árbol de cuentas */}
      <PlanDeCuentasTree
        year={new Date().getFullYear()}
        treeData={tree.filteredTreeData}
        expandedItems={tree.expandedItems}
        autoExpandedItems={tree.autoExpandedItems}
        searchTerm={tree.searchTerm}
        setExpandedItems={tree.setExpandedItems}
        setSearchTerm={tree.setSearchTerm}
        onCreate={panel.openCreatePanel}
        onEdit={panel.openEditPanel}
        onDelete={handleDelete}
        highlight={highlightSearchTerm}
        onExpandAll={tree.expandAll}
        onCollapseAll={tree.collapseAll}
      />

      {/* Panel derecho: Formulario crear/editar */}
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
  );
});

export default PlanDeCuentas;
