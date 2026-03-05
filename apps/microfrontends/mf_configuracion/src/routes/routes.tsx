import DatosMunicipioPage from "../pages/organizacion/DatosMunicipioPage";
import EstructuraOrgPage from "../pages/organizacion/EstructuraOrgPage";
import UsuariosPerfilesPage from "../pages/organizacion/UsuariosPerfilesPage";
import MfaPolicyPage from "../pages/seguridad/MfaPolicyPage";
import PoliticaContrasenaPage from "../pages/seguridad/PoliticaContrasenaPage";
import SesionesActivasPage from "../pages/seguridad/SesionesActivasPage";
import type { MicrofrontModule } from "../types/mf";

/**
 * Mapa de componentes para el sistema Configuración.
 * Las claves deben coincidir exactamente con el campo `componente`
 * de la tabla `identidad.menu` en la base de datos.
 */
const configuracionRoutes: MicrofrontModule = {
	sistemaId: 0, // Resuelto dinámicamente desde la DB
	components: {
		// Seguridad
		seguridad_autenticacion_mfa: <MfaPolicyPage />,
		seguridad_politica_contrasenas: <PoliticaContrasenaPage />,
		seguridad_sesiones_activas: <SesionesActivasPage />,
		// Organización
		organizacion_datos_municipio: <DatosMunicipioPage />,
		organizacion_estructura_org: <EstructuraOrgPage />,
		organizacion_usuarios_perfiles: <UsuariosPerfilesPage />,
	},
};

export default configuracionRoutes;
