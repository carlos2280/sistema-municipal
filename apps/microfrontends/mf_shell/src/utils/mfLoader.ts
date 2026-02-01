/**
 * Microfrontend Loader Utilities
 * Maneja la carga de módulos remotos con retry logic y health checks
 */

export interface MicrofrontModule {
  sistemaId: number;
  components: Record<string, React.ReactNode>;
  status: "loaded" | "failed" | "fallback";
  loadTime?: number;
  error?: string;
}

export interface MFHealth {
  name: string;
  url: string;
  status: "healthy" | "unhealthy" | "checking";
  lastCheck: number;
  responseTime?: number;
}

// Configuración de retry
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;
const HEALTH_CHECK_TIMEOUT = 5000;

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
        // Backoff exponencial: 1s, 2s, 4s...
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

/**
 * Verifica el health de un endpoint de microfrontend
 */
export async function checkMFHealth(
  name: string,
  url: string
): Promise<MFHealth> {
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = performance.now() - startTime;

    return {
      name,
      url,
      status: response.ok ? "healthy" : "unhealthy",
      lastCheck: Date.now(),
      responseTime,
    };
  } catch (error) {
    return {
      name,
      url,
      status: "unhealthy",
      lastCheck: Date.now(),
      responseTime: performance.now() - startTime,
    };
  }
}

/**
 * Verifica el health de todos los microfrontends configurados
 */
export async function checkAllMFHealth(): Promise<Record<string, MFHealth>> {
  const endpoints: Record<string, string> = {
    mf_store: import.meta.env.VITE_MF_STORE_URL || "http://localhost:5010/assets/remoteEntry.js",
    mf_ui: import.meta.env.VITE_MF_UI_URL || "http://localhost:5011/assets/remoteEntry.js",
    mf_contabilidad: import.meta.env.VITE_MF_CONTABILIDAD_URL || "http://localhost:5020/assets/remoteEntry.js",
  };

  const healthChecks = await Promise.all(
    Object.entries(endpoints).map(([name, url]) => checkMFHealth(name, url))
  );

  return Object.fromEntries(healthChecks.map((check) => [check.name, check]));
}

/**
 * Genera un componente de fallback para cuando un MF no está disponible
 */
export function createFallbackComponent(
  moduleName: string,
  errorMessage?: string
): React.ReactNode {
  // Este es un placeholder, el componente real se implementa con JSX
  return null;
}

/**
 * Cache simple para módulos cargados
 */
const moduleCache = new Map<number, MicrofrontModule>();

export function getCachedModule(sistemaId: number): MicrofrontModule | undefined {
  return moduleCache.get(sistemaId);
}

export function setCachedModule(sistemaId: number, module: MicrofrontModule): void {
  moduleCache.set(sistemaId, module);
}

export function clearModuleCache(): void {
  moduleCache.clear();
}
