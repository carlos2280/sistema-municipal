import ControllerTextFieldSelect from '../../../component/form/ControllerTextFieldSelect';
import type { TSchemaAreas } from '../../../types/areas.zod';

type Props = {
  areas: TSchemaAreas[];
  sistemas: TSchemaAreas[];
  // onEnter: () => void;
};

const FormAreaWithModule = ({ areas, sistemas }: Props) => {
  return (
    <>
      <ControllerTextFieldSelect<TSchemaAreas>
        name="areaId"
        label="Area"
        data={areas ?? []}
        getOptionLabel={(option) => option.nombre}
        getOptionValue={(option) => option.id}
      />

      <ControllerTextFieldSelect<TSchemaAreas>
        name="sistemaId"
        label="Sistema"
        data={sistemas ?? []}
        getOptionLabel={(option) => option.nombre}
        getOptionValue={(option) => option.id}
      />
    </>
  );
};

export default FormAreaWithModule;
