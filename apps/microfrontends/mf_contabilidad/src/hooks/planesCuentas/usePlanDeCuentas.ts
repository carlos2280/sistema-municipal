import { useObtenerArbolCompletoQuery } from 'mf_store/store';
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useMemo,
  useState,
} from 'react';
import {
  type TreeItemData,
  filterTreeData,
  mapApiNodos,
} from '../../utils/planDeCuentasUtils';

export type FormType = 'crear' | 'editar';
export interface FormData {
  name: string;
  code: string;
  description: string;
}

export const usePlanDeCuentas = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<FormType>('crear');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
  });

  const { data } = useObtenerArbolCompletoQuery();
  const treeData: TreeItemData[] = useMemo(
    () => (data ? mapApiNodos(data) : []),
    [data],
  );
  const filteredTreeData = useMemo(
    () => filterTreeData(treeData, searchTerm),
    [treeData, searchTerm],
  );

  const autoExpandedItems = useMemo(() => {
    if (!searchTerm.trim()) return expandedItems;
    const ids: string[] = [];
    const traverse = (nodes: TreeItemData[]) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      nodes.forEach((n) => {
        if (n.children?.length) {
          ids.push(n.id);
          traverse(n.children);
        }
      });
    };
    traverse(filteredTreeData);
    return ids;
  }, [filteredTreeData, searchTerm, expandedItems]);

  /* Handlers CRUD & UI */
  const handleCreate = (item: TreeItemData, e?: MouseEvent) => {
    e?.stopPropagation();

    console.log('onCreate', item);
    setSelectedItem(item.id);
    setFormType('crear');
    setFormData({ name: '', code: '', description: '' });
    setShowForm(true);
  };
  const handleEdit = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    setSelectedItem(id);
    setFormType('editar');
    // Simulación: deberías precargar los valores reales aquí
    setFormData({
      name: 'Cuenta existente',
      code: '001',
      description: 'Descripción existente',
    });
    setShowForm(true);
  };
  const handleDelete = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    console.log('Eliminar', id);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedItem(null);
    setFormData({ name: '', code: '', description: '' });
  };
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ formType, selectedItem, formData });
    handleCloseForm();
  };
  const handleInputChange =
    (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return {
    ui: {
      showForm,
      formType,
      searchTerm,
      expandedItems,
      filteredTreeData,
      autoExpandedItems,
      formData,
    },
    actions: {
      setSearchTerm,
      setExpandedItems,
      handleCreate,
      handleEdit,
      handleDelete,
      handleCloseForm,
      handleFormSubmit,
      handleInputChange,
    },
  };
};
