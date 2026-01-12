import ControllerTextField from '../../../component/form/ControllerTextField';

const FormContrasenaTemporal = () => {
  return (
    <div>
      <ControllerTextField name={'correo'} label="Correo" disabled />

      <ControllerTextField
        name={'contrasenaTemporal'}
        label="Contraseña temporal"
      />
      <ControllerTextField name={'contrasenaNueva'} label="Nueva Contraseña" />
    </div>
  );
};

export default FormContrasenaTemporal;
