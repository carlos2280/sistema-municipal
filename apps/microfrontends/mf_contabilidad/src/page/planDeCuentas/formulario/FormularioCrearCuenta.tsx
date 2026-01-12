import ControllerTextField from '../../../components/form/ControllerTextField';
import ControllerTextFieldMask from '../../../components/form/ControllerTextFieldMask';
const FormularioCrearCuenta = () => {
  return (
    <>
      <ControllerTextFieldMask name="codigo" label="Código" />
      <ControllerTextField name={'nombre'} label="Nombre cuenta" />
      <ControllerTextField name={'contracuenta'} label="Contracuenta" />
    </>
  );
};

export default FormularioCrearCuenta;
