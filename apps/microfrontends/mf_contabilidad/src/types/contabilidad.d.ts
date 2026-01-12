declare module 'contabilidad/Button' {
  import type { FC } from 'react';
  const Button: FC;
  export default Button;
}

// Tipo para importar dinámicamente módulos federados
declare module 'contabilidad/routes' {
  const routes: RouteObject | RouteObject[];
  export default routes;
}

// Repite para otros microfronts
declare module 'tesoreria/routes' {
  const routes: RouteObject | RouteObject[];
  export default routes;
}

declare module 'contabilidad/components' {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const components: { [key: string]: React.ComponentType<any> };
  export default components;
}

declare module 'mf_store/store';
declare module '@reduxjs/toolkit/query/react' {
  // Extensiones o sobrescrituras personalizadas aquí
}

declare module '@reduxjs/toolkit/query' {
  // Extensiones o sobrescrituras personalizadas aquí
}
