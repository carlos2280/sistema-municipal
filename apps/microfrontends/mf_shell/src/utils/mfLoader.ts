/**
 * Microfrontend Loader Utilities
 * Tipos y retry logic para carga de módulos remotos
 */

/**
 * Contrato que cada MF expone desde `./routes` via Module Federation.
 * Las claves de `components` deben coincidir con el campo `componente`
 * de la tabla `identidad.menu` en BD.
 */
export interface RouteManifest {
  sistemaId: number;
  components: Record<string, React.ReactNode>;
}

/**
 * RouteManifest enriquecido con metadata de carga (uso interno del shell).
 */
export interface LoadedManifest extends RouteManifest {
  status: "loaded" | "failed" | "fallback";
  loadTime?: number;
  error?: string;
}

// Configuración de retry
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Carga un módulo con retry automático y backoff exponencial
 */
export async function loadWithRetry<T>(
  importFn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    moduleName?: string;
  } = {}
): Promise<T> {
  const {
    attempts = DEFAULT_RETRY_ATTEMPTS,
    delay = DEFAULT_RETRY_DELAY,
    moduleName = "unknown",
  } = options;

  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      const startTime = performance.now();
      const result = await importFn();
      const loadTime = performance.now() - startTime;

      console.info(
        `[MF Loader] ✅ ${moduleName} cargado en ${loadTime.toFixed(0)}ms`
      );

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isLastAttempt = i === attempts - 1;

      console.warn(
        `[MF Loader] ⚠️ ${moduleName} - Intento ${i + 1}/${attempts} falló:`,
        lastError.message
      );

      if (!isLastAttempt) {
        const backoffDelay = delay * Math.pow(2, i);
        console.info(
          `[MF Loader] 🔄 Reintentando ${moduleName} en ${backoffDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError || new Error(`Failed to load ${moduleName} after ${attempts} attempts`);
}
