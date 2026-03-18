Organiza apps/microfrontends/mf_shell/src/ siguiendo la estructura Atomic Design definida en CLAUDE.md y .claude/rules/microfrontend-react.md. Antes de mover nada, muéstrame el árbol actual de src/components/ y propón el plan de reorganización para que yo lo apruebe.
Bash List all files in mf_shell/src
IN
find /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src -type f | sort

OUT
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/App.css
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/App.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Black.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Bold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-ExtraBold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Light.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Medium.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Regular.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Regular.woff2
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-SemiBold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-ThicccAF.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/THICCCBOI-Thin.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/OFL.txt
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Black.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-BlackItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Bold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-BoldItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-ExtraBold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-ExtraBoldItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-ExtraLight.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-ExtraLightItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Italic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Light.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-LightItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Medium.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-MediumItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Regular.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-SemiBold.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-SemiBoldItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-Thin.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/fonts/poppins/Poppins-ThinItalic.ttf
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/assets/react.svg
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/bootstrap.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/ChatDrawerWrapper.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/errors/MicrofrontendErrorBoundary.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/errors/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/organigrama/OrgNode.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/organigrama/OrganigramaDialog.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/organigrama/OrganigramaFlow.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/organigrama/organigramaMock.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/context/PersistorContext.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/declarations.d.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/fonts.css
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/hooks/useHookFormSchema.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/hooks/useMenu.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/hooks/useModuleSync.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/hooks/useTenantResolver.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/index.css
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppLayout.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CommandPalette/CommandPalette.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CommandPalette/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CommandPalette/useCommandPalette.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Compass/Compass.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Compass/CompassItem.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Compass/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Compass/useCompass.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Eyebrow/Eyebrow.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Eyebrow/EyebrowActions.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Eyebrow/EyebrowBrand.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Eyebrow/EyebrowContext.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Eyebrow/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/NavPanel.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/NavPanelFooter.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/NavPanelHeader.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/NavPanelMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/useNavPanel.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Stage/Stage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/Stage/index.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/main.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/modules/dynamicModuleLoader.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/mui-theme.d.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/ChatPage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/DashboardPage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/ModuleUnavailablePage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/TenantNotFound.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/ContrasenaTemporal.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/LoginPage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/AreaSystemStep.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/AuthCard.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/AuthFooter.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/AuthHeader.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/AuthLayout.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/BrandingPanel.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/CredentialsStep.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/LoginActions.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/LoginStepper.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/MfaSetupPendingNotice.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/components/MfaStep.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/constants.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/hooks/useAreaSistemas.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/hooks/useContrasenaTemporal.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/hooks/useLoginFinish.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/hooks/useLoginFlow.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/login/types.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/MfaSetupPage.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/components/BackupCodesGrid.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/components/MfaErrorPhase.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/components/MfaLoadingPhase.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/components/MfaScanPhase.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/components/MfaSuccessPhase.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/hooks/useMfaSetup.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/mfa-setup/types.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/ConsultaDeIngreso.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/EjecucionPresupuestaria.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/InformeDos.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/InformeUno.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/Organigrama.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/PlanDeCuenta.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/PruebaComponente.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/routes/ProtectedRoute.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/routes/createAppRouter.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/routes/index.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/routes/microfrontRegistry.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/types/areas.zod.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/types/contabilidad.d.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/types/contrasenaTemporal.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/types/login.zod.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/types/menu.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/IconDynamicLucile.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/auth.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/componentsMap.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/generateRoutesFromMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/iconDynamic.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/mfLoader.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/skipToken.ts
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/vite-env.d.ts
Ahora déjame leer algunos archivos clave para entender el rol de cada uno antes de proponer el plan.

Read ChatDrawerWrapper.tsx
Read AppLayout.tsx
Bash Peek at sueltos in layout/ to understand their role
IN
head -5 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx 2>/dev/null | grep -E "^==>|^import|export default|^const [A-Z]" | head -60

OUT
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx <==
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx <==
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMenu } from '../hooks/useMenu';
import RecursiveMenu from './RecursiveMenu';
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx <==
==> /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx <==
Bash Check line counts of sueltos layout files
IN
wc -l /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx

OUT
  274 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx
  303 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx
  223 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx
  668 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx
   33 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx
  125 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx
   30 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx
  239 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx
  401 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx
   51 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx
   21 /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx
 2368 total
Bash Find imports of sueltos layout files
IN
# Find who imports these "sueltos" files
grep -r "AccountMenu\|AvatarMenu\|NotificationPanel\|RecursiveMenu\|MainMenu\|StatusBar\|StatusLine\|CustomizedMenus\|EconomicIndicators\|AppPageLayout" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx" -l

OUT
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicators.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/RecursiveMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppLayout.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NotificationPanel.tsx
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx
Bash Show actual import lines for sueltos layout files
IN
grep -r "AccountMenu\|AvatarMenu\|NotificationPanel\|RecursiveMenu\|MainMenu\|StatusBar\|StatusLine\|CustomizedMenus\|EconomicIndicators\|AppPageLayout" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx" -h | grep "^import" | sort -u

OUT
import AvatarMenu from "./AvatarMenu";
import EconomicIndicators from "./EconomicIndicators";
import NotificationPanel from "./NotificationPanel";
import RecursiveMenu from './RecursiveMenu';
import StatusLine from "./StatusLine";
Bash Show imports of organigrama and other components
IN
# Check who imports organigrama and errors/components outside their own folder
grep -r "organigrama\|ChatDrawerWrapper\|MicrofrontendError" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx" -h | grep "^import" | sort -u

OUT
import { ChatDrawerWrapper } from "../components/ChatDrawerWrapper";
import { MicrofrontendErrorBoundary } from "../components/errors";
import { OrganigramaDialog } from "../components/organigrama/OrganigramaDialog";
Bash Check usage of the less-obvious layout files
IN
# Who imports AppPageLayout, AccountMenu, MainMenu, StatusBar, CustomizedMenus, EconomicIndicatorsExamples
grep -rn "AppPageLayout\|AccountMenu\|MainMenu\|StatusBar\|CustomizedMenus\|EconomicIndicatorsExamples" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx"

OUT
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx:2: * StatusBar — Barra de estado inferior del shell CIVITAS v3
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusBar.tsx:76:export function StatusBar() {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx:15:export const EconomicIndicatorsExamples = () => {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx:8:const AppPageLayout = ({ children, title }: Props) => {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AppPageLayout.tsx:21:export default AppPageLayout;
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/StatusLine.tsx:2: * StatusLine — Línea de estado MERIDIAN (reemplaza StatusBar)
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx:9:const MainMenu = ({ collapsed = false }: Props) => {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx:33:export default MainMenu;
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx:2: * AccountMenu — Menú de Cuenta del Usuario
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx:35:interface AccountMenuProps {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AccountMenu.tsx:112:export default function AccountMenu({ onOpenCustomizer }: AccountMenuProps) {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx:2: * CustomizedMenus — Selector de Sistema
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx:122:interface CustomizedMenusProps {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/CustomizedMenus.tsx:126:export default function CustomizedMenus({ variant = "appbar" }: CustomizedMenusProps) {
Bash Trace all imports of sueltos files
IN
grep -rn "import.*AccountMenu\|import.*CustomizedMenus\|import.*MainMenu\|import.*RecursiveMenu\|import.*AppPageLayout\|import.*EconomicIndicators\|import.*StatusBar[^.]" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx"

OUT
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/EconomicIndicatorsExamples.tsx:4:import EconomicIndicators from "./EconomicIndicators";
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/MainMenu.tsx:4:import RecursiveMenu from './RecursiveMenu';
Bash Check AvatarMenu and NavPanel imports
IN
# Also check NavPanel and AvatarMenu contents
grep -n "import" /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/AvatarMenu.tsx | head -20
grep -n "import" /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/layout/NavPanel/NavPanelMenu.tsx | head -15

OUT
10:import { styled, alpha } from "@mui/material/styles";
11:import { Palette, Menu, LogOut } from "lucide-react";
12:import { useEffect, useRef, useCallback } from "react";
13:import { useNavigate } from "react-router-dom";
14:import {
20:import { usePersistor } from "../context/PersistorContext";
9:import { styled, alpha } from "@mui/material/styles";
10:import Collapse from "@mui/material/Collapse";
11:import { ChevronDown } from "lucide-react";
12:import * as icons from "lucide-react";
13:import type { LucideProps } from "lucide-react";
14:import { useState, useEffect, useMemo, useCallback } from "react";
15:import { useLocation, useNavigate } from "react-router-dom";
16:import slugify from "slugify";
17:import type { MenuItem } from "../../types/menu";
Bash Check MicrofrontendErrorBoundary usage
IN
grep -rn "MicrofrontendErrorBoundary" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx"

OUT
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/errors/MicrofrontendErrorBoundary.tsx:31:export class MicrofrontendErrorBoundary extends Component<Props, State> {
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/errors/MicrofrontendErrorBoundary.tsx:221:export default MicrofrontendErrorBoundary;
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/components/errors/index.ts:1:export { MicrofrontendErrorBoundary } from "./MicrofrontendErrorBoundary";
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/generateRoutesFromMenu.tsx:4:import { MicrofrontendErrorBoundary } from "../components/errors";
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/generateRoutesFromMenu.tsx:48:				<MicrofrontendErrorBoundary
/home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/utils/generateRoutesFromMenu.tsx:56:				</MicrofrontendErrorBoundary>
Bash Check Organigrama usage
IN
grep -n "import\|orgOpen\|OrganigramaDialog" /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src/pages/prueba/Organigrama.tsx 2>/dev/null | head -10
# also check if organigrama is used anywhere besides AppLayout
grep -rn "organigrama\|Organigrama" \
  /home/carlos/projects/sistema-municipal/apps/microfrontends/mf_shell/src \
  --include="*.ts" --include="*.tsx" | grep -v "^.*\/organigrama\/"

OUT
1:import {
16:import { useCallback, useState } from 'react';
17:import '@xyflow/react/dist/style.css';
18:import 