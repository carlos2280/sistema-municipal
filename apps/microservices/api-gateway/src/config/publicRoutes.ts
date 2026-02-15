interface PublicRoute {
  method: string;
  pattern: RegExp;
}

const PUBLIC_ROUTES: PublicRoute[] = [
  // Health checks
  { method: "GET", pattern: /^\/health$/ },
  { method: "GET", pattern: /\/health$/ },

  // Auth service - flujo de login (3 pasos)
  { method: "POST", pattern: /^\/api\/v1\/autorizacion\/login$/ },
  { method: "POST", pattern: /^\/api\/v1\/autorizacion\/areas$/ },
  { method: "POST", pattern: /^\/api\/v1\/autorizacion\/sistemas$/ },
  { method: "POST", pattern: /^\/api\/v1\/autorizacion\/refresh-token$/ },

  // Rutas con token temporal (validadas por el servicio, no por JWT)
  {
    method: "POST",
    pattern: /^\/api\/v1\/autorizacion\/cambiar-contrasena-temporal$/,
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/autorizacion\/contrasena-temporal$/,
  },
];

export function isPublicRoute(method: string, path: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      route.method === method.toUpperCase() && route.pattern.test(path),
  );
}
