import ControllerTextField from '../../../component/form/ControllerTextField';

const FormCredentialSteep = () => {
  return (
    <div>
      <ControllerTextField name={'correo'} label="Correo" />

      <ControllerTextField
        name={'contrasena'}
        label="Contaseña"
        // onKeyDown={(e) => {
        //     if (e.key === "Enter") {
        //         e.preventDefault();
        //         onEnter();
        //     }
        // }}
      />
    </div>
  );
};

export default FormCredentialSteep;
