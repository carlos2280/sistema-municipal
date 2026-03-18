import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CuentaPresupuestaria } from "mf_store/store";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface CuentaTreeNode {
  cuenta: CuentaPresupuestaria;
  children: CuentaTreeNode[];
}

interface DrawerState {
  open: boolean;
  currentPath: number[]; // stack de cuentaIds (breadcrumb)
  selectedLeaf: CuentaPresupuestaria | null;
  searchQuery: string;
  searchMode: boolean;
  montoInput: string;
  centroCostoId: number | null;
  showForm: boolean;
}

const INITIAL_STATE: DrawerState = {
  open: false,
  currentPath: [],
  selectedLeaf: null,
  searchQuery: "",
  searchMode: false,
  montoInput: "",
  centroCostoId: null,
  showForm: false,
};

export interface SearchResult {
  cuenta: CuentaPresupuestaria;
  isLeaf: boolean;
  exists: boolean;
  ancestors: CuentaPresupuestaria[];
  childrenCount: number;
  priority: number;
}

// ─── Utilidades de árbol ─────────────────────────────────────────────────────

function buildCuentaTree(cuentas: CuentaPresupuestaria[]) {
  const nodeMap = new Map<number, CuentaTreeNode>();
  const roots: CuentaTreeNode[] = [];

  for (const c of cuentas) {
    nodeMap.set(c.id, { cuenta: c, children: [] });
  }

  for (const c of cuentas) {
    const node = nodeMap.get(c.id)!;
    if (c.parentId !== null) {
      const parent = nodeMap.get(c.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: CuentaTreeNode[]) => {
    nodes.sort((a, b) => a.cuenta.codigo.localeCompare(b.cuenta.codigo));
    for (const n of nodes) sortChildren(n.children);
  };
  sortChildren(roots);

  return { roots, nodeMap };
}

/** Sube por parentId hasta la raíz. Usa cuentaMap pre-computado para O(1) lookups. */
function getAncestorChain(
  cuentaId: number,
  cuentaMap: Map<number, CuentaPresupuestaria>,
): CuentaPresupuestaria[] {
  const ancestors: CuentaPresupuestaria[] = [];
  let currentId: number | null = cuentaMap.get(cuentaId)?.parentId ?? null;

  while (currentId !== null) {
    const cuenta = cuentaMap.get(currentId);
    if (!cuenta) break;
    ancestors.unshift(cuenta);
    currentId = cuenta.parentId;
  }

  return ancestors;
}

const SEARCH_DEBOUNCE_MS = 180;
const EMPTY_RESULTS: SearchResult[] = [];

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook para el drawer de "Agregar Cuenta" — replica fiel del prototipo MERIDIAN.
 *
 * Flujo: navegar jerarquía nivel por nivel → seleccionar hoja → ingresar monto → confirmar.
 * Soporta búsqueda global por código o nombre (debounced).
 */
export const useAgregarCuentaDrawer = (
  cuentas: CuentaPresupuestaria[],
  cuentasEnUso: number[],
) => {
  const [state, setState] = useState<DrawerState>(INITIAL_STATE);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Árbol computado ──────────────────────────────────────────────
  const { roots, nodeMap } = useMemo(() => buildCuentaTree(cuentas), [cuentas]);

  /** Mapa plano id → cuenta, pre-computado una sola vez (evita recrear en getAncestorChain) */
  const cuentaMap = useMemo(
    () => new Map(cuentas.map((c) => [c.id, c])),
    [cuentas],
  );

  const cuentasEnUsoSet = useMemo(() => new Set(cuentasEnUso), [cuentasEnUso]);

  // ── Debounce de búsqueda ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = state.searchQuery.trim();
    if (!q) {
      setDebouncedQuery("");
      return;
    }
    debounceRef.current = setTimeout(() => setDebouncedQuery(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [state.searchQuery]);

  // ── Hijos del nivel actual (useMemo, no función) ─────────────────
  const childrenOfCurrent = useMemo((): CuentaTreeNode[] => {
    if (state.currentPath.length === 0) return roots;
    const lastId = state.currentPath[state.currentPath.length - 1];
    return nodeMap.get(lastId)?.children ?? roots;
  }, [state.currentPath, nodeMap, roots]);

  // ── Búsqueda global (opera sobre debouncedQuery) ─────────────────
  const searchResults = useMemo((): SearchResult[] => {
    if (!state.searchMode || !debouncedQuery) return EMPTY_RESULTS;

    const q = debouncedQuery;
    const qLower = q.toLowerCase();
    const results: SearchResult[] = [];

    for (const [, node] of nodeMap) {
      const { cuenta } = node;
      const matchCode = cuenta.codigo.includes(q);
      const matchName = cuenta.nombre.toLowerCase().includes(qLower);
      if (!matchCode && !matchName) continue;

      const isLeaf = node.children.length === 0;
      const ancestors = getAncestorChain(cuenta.id, cuentaMap);

      results.push({
        cuenta,
        isLeaf,
        exists: cuentasEnUsoSet.has(cuenta.id),
        ancestors,
        childrenCount: node.children.length,
        priority: cuenta.codigo === q ? 0
          : cuenta.codigo.startsWith(q) ? 1
          : matchCode ? 2
          : 3,
      });
    }

    results.sort(
      (a, b) =>
        a.priority - b.priority ||
        a.cuenta.codigo.length - b.cuenta.codigo.length ||
        a.cuenta.codigo.localeCompare(b.cuenta.codigo),
    );

    return results.slice(0, 30);
  }, [state.searchMode, debouncedQuery, nodeMap, cuentaMap, cuentasEnUsoSet]);

  // ── Preview de inserción (padres faltantes + hoja) ───────────────
  const insertPreview = useMemo(() => {
    if (!state.selectedLeaf) return [];

    const ancestors = getAncestorChain(state.selectedLeaf.id, cuentaMap);
    const allCodes = [...ancestors, state.selectedLeaf];
    return allCodes.filter((c) => !cuentasEnUsoSet.has(c.id));
  }, [state.selectedLeaf, cuentaMap, cuentasEnUsoSet]);

  // ── Acciones ─────────────────────────────────────────────────────
  const open = useCallback(() => {
    setState({ ...INITIAL_STATE, open: true });
    setDebouncedQuery("");
  }, []);

  const close = useCallback(() => {
    setState(INITIAL_STATE);
    setDebouncedQuery("");
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
      searchMode: query.trim().length > 0,
    }));
  }, []);

  const drillDown = useCallback((cuentaId: number) => {
    setState((prev) => ({
      ...prev,
      currentPath: [...prev.currentPath, cuentaId],
      selectedLeaf: null,
      showForm: false,
      searchQuery: "",
      searchMode: false,
    }));
    setDebouncedQuery("");
  }, []);

  const drillTo = useCallback((cuentaId: number | null) => {
    if (cuentaId === null) {
      setState((prev) => ({
        ...prev,
        currentPath: [],
        selectedLeaf: null,
        showForm: false,
        searchQuery: "",
        searchMode: false,
      }));
    } else {
      setState((prev) => {
        const idx = prev.currentPath.indexOf(cuentaId);
        const newPath = idx >= 0 ? prev.currentPath.slice(0, idx + 1) : prev.currentPath;
        return {
          ...prev,
          currentPath: newPath,
          selectedLeaf: null,
          showForm: false,
          searchQuery: "",
          searchMode: false,
        };
      });
    }
    setDebouncedQuery("");
  }, []);

  const selectLeaf = useCallback(
    (cuenta: CuentaPresupuestaria) => {
      const ancestors = getAncestorChain(cuenta.id, cuentaMap);
      const fullPath = [...ancestors.map((a) => a.id), cuenta.id];

      setState((prev) => ({
        ...prev,
        currentPath: fullPath,
        selectedLeaf: cuenta,
        showForm: true,
        searchQuery: "",
        searchMode: false,
        montoInput: "",
        centroCostoId: null,
      }));
      setDebouncedQuery("");
    },
    [cuentaMap],
  );

  const drillFromSearch = useCallback(
    (cuenta: CuentaPresupuestaria) => {
      const ancestors = getAncestorChain(cuenta.id, cuentaMap);
      const fullPath = [...ancestors.map((a) => a.id), cuenta.id];

      setState((prev) => ({
        ...prev,
        currentPath: fullPath,
        selectedLeaf: null,
        showForm: false,
        searchQuery: "",
        searchMode: false,
      }));
      setDebouncedQuery("");
    },
    [cuentaMap],
  );

  const setMontoInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, montoInput: value }));
  }, []);

  const setCentroCostoId = useCallback((id: number | null) => {
    setState((prev) => ({ ...prev, centroCostoId: id }));
  }, []);

  const parsedMonto = useMemo(() => {
    const raw = state.montoInput.replace(/[^\d]/g, "");
    return raw ? parseInt(raw, 10) : 0;
  }, [state.montoInput]);

  // ── Breadcrumb legible ────────────────────────────────────────────
  const breadcrumb = useMemo((): CuentaPresupuestaria[] => {
    return state.currentPath
      .map((id) => nodeMap.get(id)?.cuenta)
      .filter((c): c is CuentaPresupuestaria => c !== undefined);
  }, [state.currentPath, nodeMap]);

  return {
    // Estado
    isOpen: state.open,
    showForm: state.showForm,
    selectedLeaf: state.selectedLeaf,
    searchQuery: state.searchQuery,
    searchMode: state.searchMode,
    montoInput: state.montoInput,
    centroCostoId: state.centroCostoId,
    parsedMonto,

    // Datos computados
    childrenOfCurrent,
    breadcrumb,
    searchResults,
    insertPreview,
    cuentasEnUsoSet,
    nodeMap,

    // Acciones
    open,
    close,
    setSearchQuery,
    drillDown,
    drillTo,
    selectLeaf,
    drillFromSearch,
    setMontoInput,
    setCentroCostoId,
  };
};

export type AgregarCuentaDrawerHook = ReturnType<typeof useAgregarCuentaDrawer>;
