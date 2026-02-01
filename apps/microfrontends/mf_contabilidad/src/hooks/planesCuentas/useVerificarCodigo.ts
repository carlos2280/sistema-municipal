import { useLazyVerificarCodigoExisteQuery } from 'mf_store/store';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CodigoStatus = 'idle' | 'checking' | 'available' | 'exists' | 'error';

/** Datos de cuenta existente */
export interface CuentaExistenteData {
  id: number;
  codigo: string;
  nombre: string;
}

interface UseVerificarCodigoReturn {
  /** Estado actual de la verificación */
  status: CodigoStatus;
  /** Datos de la cuenta si existe */
  cuentaExistente: CuentaExistenteData | null;
  /** Verificar un código específico */
  verificar: (anoContable: number, codigoCompleto: string) => void;
  /** Limpiar el estado */
  reset: () => void;
  /** Indica si el código está disponible para usar */
  isAvailable: boolean;
  /** Indica si el código ya existe */
  isExisting: boolean;
  /** Indica si está verificando */
  isChecking: boolean;
}

/**
 * Hook para verificar si un código de cuenta ya existe.
 * Incluye debounce para evitar llamadas excesivas al API.
 */
export function useVerificarCodigo(debounceMs = 500): UseVerificarCodigoReturn {
  const [status, setStatus] = useState<CodigoStatus>('idle');
  const [cuentaExistente, setCuentaExistente] = useState<CuentaExistenteData | null>(null);

  const [triggerVerificar] = useLazyVerificarCodigoExisteQuery();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCodigoRef = useRef<string>('');
  const requestIdRef = useRef<number>(0);

  const verificar = useCallback(
    (anoContable: number, codigoCompleto: string) => {
      // Cancelar verificación pendiente
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Si el código está vacío o incompleto, resetear
      if (!codigoCompleto || codigoCompleto.length < 4) {
        setStatus('idle');
        setCuentaExistente(null);
        lastCodigoRef.current = '';
        return;
      }

      // Si es el mismo código, no verificar de nuevo
      if (lastCodigoRef.current === codigoCompleto) {
        return;
      }

      setStatus('checking');
      lastCodigoRef.current = codigoCompleto;

      // Incrementar requestId para detectar requests obsoletas
      const currentRequestId = ++requestIdRef.current;

      // Debounce la llamada al API
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await triggerVerificar({
            anoContable,
            codigo: codigoCompleto,
          }).unwrap();

          // Verificar que esta request siga siendo la más reciente
          if (requestIdRef.current !== currentRequestId) {
            return;
          }

          if (result.existe) {
            setStatus('exists');
            setCuentaExistente(result.cuenta || null);
          } else {
            setStatus('available');
            setCuentaExistente(null);
          }
        } catch (error) {
          // Verificar que esta request siga siendo la más reciente
          if (requestIdRef.current !== currentRequestId) {
            return;
          }

          console.error('Error verificando código:', error);
          // En caso de error de red, asumir disponible para no bloquear UX
          // La validación final se hará en el backend al crear
          setStatus('available');
          setCuentaExistente(null);
        }
      }, debounceMs);
    },
    [debounceMs, triggerVerificar],
  );

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    requestIdRef.current++;
    setStatus('idle');
    setCuentaExistente(null);
    lastCodigoRef.current = '';
  }, []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    status,
    cuentaExistente,
    verificar,
    reset,
    isAvailable: status === 'available',
    isExisting: status === 'exists',
    isChecking: status === 'checking',
  };
}
