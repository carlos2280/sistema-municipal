import { useCrearPlanesCuentaMutation } from 'mf_store/store';
import { useState } from 'react';
import {
  type TSchemaPlanesCuentasCreate,
  schemaPlanesCuentasCreate,
} from '../../types/zod/planesCuentas.zod';

import { toast } from 'sonner';
import type { TreeItemData } from '../../utils/planDeCuentasUtils';
import useHookFormSchema from '../useHookFormSchema';
const useCreatePlanCuenta = () => {
  const [showForm, setShowForm] = useState(false);

  const [dataItem, setDataItem] = useState<TreeItemData>();
  const { methods } = useHookFormSchema<TSchemaPlanesCuentasCreate>({
    schema: schemaPlanesCuentasCreate,
    defaultValues: {},
    mode: 'onChange',
  });

  const [crearPlanesCuenta] = useCrearPlanesCuentaMutation();
  useCrearPlanesCuentaMutation;

  const handleCrearCuenta = (
    item: TreeItemData,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    setDataItem(item);
    methods.reset({
      id: item.data.id,
      anoContable: item.data.anoContable ?? 2025,
      parentId: item.data.parentId ?? null,
      subgrupoId: item.data.subgrupoId,
      tipoCuentaId: item.data.tipoCuentaId,
      valorPadre: item.data.codigo,
      nombre: '',
      codigo: '', // ⚠️ ¡esto es crucial!
      contraCuenta: '',
    });
    methods.trigger();
    setShowForm(true);

    // methods.setValue('anoContable', item.data.anoContable ?? 2025);
    // methods.setValue('parentId', item.data.parentId ?? null);
    // methods.setValue('id', item.data.id);
    // methods.setValue('subgrupoId', item.data.subgrupoId);
    // methods.setValue('tipoCuentaId', item.data.tipoCuentaId);
    // methods.setValue('valorPadre', item.data.codigo);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    methods.reset();
  };

  const onCrearPlanesCuenta = async (data: TSchemaPlanesCuentasCreate) => {
    try {
      const nuevoCuenta = {
        anoContable: 2025,
        codigo: `${data.valorPadre}${data.codigo}`,
        Contracuenta: data.contraCuenta,
        nombre: data.nombre,
        tipoCuentaId: data.tipoCuentaId + 1,
        subgrupoId: data.subgrupoId ? data.subgrupoId : data.id,
        parentId: data.subgrupoId ? data.id : null,
      };

      await crearPlanesCuenta(nuevoCuenta).unwrap();
      toast.success(`Cuenta creada correctamente ${nuevoCuenta.codigo}`);
      methods.reset({
        valorPadre: data.valorPadre,
        tipoCuentaId: data.tipoCuentaId,
        anoContable: data.anoContable,
        subgrupoId: nuevoCuenta.subgrupoId,
        parentId: nuevoCuenta.parentId,
        codigo: '',
        nombre: '',
      });
      methods.trigger();
    } catch (error) {
      toast.error('Ocurrio un error, favor contactar al administador.');
    }
  };

  return {
    methods,
    dataItem,
    actions: {
      showForm,
      handleCrearCuenta,
      handleCloseForm,
    },
    onCrearPlanesCuenta,
  };
};

export default useCreatePlanCuenta;
