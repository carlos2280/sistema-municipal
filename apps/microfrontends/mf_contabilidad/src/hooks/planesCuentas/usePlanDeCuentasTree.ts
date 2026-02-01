import { useObtenerArbolCompletoQuery } from 'mf_store/store';
import { useMemo, useState, useCallback } from 'react';

import {
  type TreeItemData,
  filterTreeData,
  mapApiNodos,
} from '../../utils/planDeCuentasUtils';

/**
 * Hook para manejar el árbol de Plan de Cuentas.
 * Separa la lógica del árbol del formulario para mejor mantenibilidad.
 */
export function usePlanDeCuentasTree() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Query de datos
  const { data, isLoading, error } = useObtenerArbolCompletoQuery();

  // Transformar datos de API a estructura del árbol
  const treeData: TreeItemData[] = useMemo(
    () => (data ? mapApiNodos(data) : []),
    [data],
  );

  // Filtrar datos según búsqueda
  const filteredTreeData = useMemo(
    () => filterTreeData(treeData, searchTerm),
    [treeData, searchTerm],
  );

  // Auto-expandir nodos cuando hay búsqueda activa
  const autoExpandedItems = useMemo(() => {
    if (!searchTerm.trim()) return expandedItems;

    const ids: string[] = [];
    const traverse = (nodes: TreeItemData[]) => {
      for (const node of nodes) {
        if (node.children?.length) {
          ids.push(node.id);
          traverse(node.children);
        }
      }
    };
    traverse(filteredTreeData);
    return ids;
  }, [filteredTreeData, searchTerm, expandedItems]);

  // Handler para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Handler para expandir/colapsar todo
  const expandAll = useCallback(() => {
    const ids: string[] = [];
    const traverse = (nodes: TreeItemData[]) => {
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children?.length) {
          traverse(node.children);
        }
      }
    };
    traverse(treeData);
    setExpandedItems(ids);
  }, [treeData]);

  const collapseAll = useCallback(() => {
    setExpandedItems([]);
  }, []);

  // Buscar item por ID en el árbol
  const findItemById = useCallback(
    (id: string): TreeItemData | null => {
      const search = (nodes: TreeItemData[]): TreeItemData | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children) {
            const found = search(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return search(treeData);
    },
    [treeData],
  );

  return {
    // Estado
    searchTerm,
    expandedItems,
    autoExpandedItems,
    treeData,
    filteredTreeData,
    isLoading,
    error,

    // Setters
    setSearchTerm,
    setExpandedItems,

    // Acciones
    clearSearch,
    expandAll,
    collapseAll,
    findItemById,
  };
}
