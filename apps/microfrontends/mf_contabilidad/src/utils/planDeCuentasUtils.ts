// Funciones puras y tipos compartidos
import { alpha } from '@mui/material/styles';

export interface DataPlanCuenta {
  id: number;
  anoContable?: number;
  codigo: string;
  nombre: string;
  tipoCuentaId: number;
  subgrupoId?: number;
  parentId?: number;
  codigoIni?: string;
}

export interface ApiCuenta {
  id: number;
  codigo: string;
  nombre: string;
  hijos: ApiCuenta[];
  tipoCuentaId: number;
  codigoIni?: string;
  idPlanCuenta: number;
  data: DataPlanCuenta;
}
export interface ApiNodo {
  id: number;
  codigo: string;
  nombre: string;
  hijos: ApiNodo[];
  cuentas: ApiCuenta[];
  tipoCuentaId: number;
  codigoIni?: string;
}
export interface TreeItemData {
  id: string;
  label: string;
  children?: TreeItemData[];
  tipoCuentaId: number;
  codigoIni?: string;
  idPlanCuenta: number;
  data: DataPlanCuenta;
}

export const mapApiCuentas = (
  cuentas: ApiCuenta[],
  parentPrefix = '',
): TreeItemData[] =>
  cuentas.map((cuenta, index) => ({
    id: `cuenta-${parentPrefix}${cuenta.id}-${index}`,
    // label: `${cuenta.codigo} – ${cuenta.nombre}`,
    label: `${formatCodigo(cuenta.codigo, cuenta.tipoCuentaId)} – ${cuenta.nombre}`,
    tipoCuentaId: cuenta.tipoCuentaId,
    codigoIni: cuenta.codigoIni,
    idPlanCuenta: cuenta.id,
    data: {
      ...cuenta,
    },
    children: cuenta.hijos.length
      ? mapApiCuentas(
          cuenta.hijos,
          `cuenta-${parentPrefix}${cuenta.id}-${index}-`,
        )
      : undefined,
  }));

export const mapApiNodos = (
  nodos: ApiNodo[],
  parentPrefix = '',
): TreeItemData[] =>
  nodos.map((nodo, index) => {
    const nodeId = `nodo-${parentPrefix}${nodo.id}-${index}`;
    return {
      id: nodeId,
      //label: `${nodo.codigo} – ${nodo.nombre}`,
      label: `${formatCodigo(nodo.codigo, nodo.tipoCuentaId)} – ${nodo.nombre}`,
      tipoCuentaId: nodo.tipoCuentaId,
      codigoIni: nodo.codigoIni,
      idPlanCuenta: nodo.id,
      data: {
        ...nodo,
      },
      children: [
        ...mapApiNodos(nodo.hijos, `${nodeId}-`),
        ...mapApiCuentas(nodo.cuentas, `${nodeId}-`),
      ].filter(Boolean) as TreeItemData[],
    };
  });

export const filterTreeData = (
  items: TreeItemData[],
  term: string,
): TreeItemData[] => {
  if (!term.trim()) return items;
  const filtered: TreeItemData[] = [];
  for (const item of items) {
    const matches = item.label.toLowerCase().includes(term.toLowerCase());
    if (item.children) {
      const kids = filterTreeData(item.children, term);
      if (matches || kids.length > 0) {
        filtered.push({
          ...item,
          children: kids.length ? kids : item.children,
        });
      }
    } else if (matches) {
      filtered.push(item);
    }
  }
  return filtered;
};

export const highlightSearchTerm = (
  text: string,
  term: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  palette: any,
) => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, (match) => {
    return `<span style="background:${alpha(palette.primary.dark, 0.08)};color:${palette.primary.main};font-style:italic;font-weight:500;padding:1px 2px;border-radius:2px">${match}</span>`;
  });
};

/**
 * "111"       => "111"
 * "11101"     => "111-01"
 * "1110801"   => "111-08-01"
 */
// utils/formatCodigo.ts
export const formatCodigo = (codigo: string, tipoCuentaId: number): string => {
  // Nivel 1: siempre los primeros 3 dígitos
  const nivel1 = codigo.slice(0, 3);
  let resto = codigo.slice(3);

  // Definimos longitudes por nivel a partir de tipoCuentaId:
  // 4 → [2]
  // 5 → [2,2]
  // 6 → [2,2,3]
  // 7 → [2,2,3,3]
  // 8 → [2,2,3,3,3]
  const niveles: number[] = [];
  if (tipoCuentaId >= 4) niveles.push(2);
  if (tipoCuentaId >= 5) niveles.push(2);
  if (tipoCuentaId >= 6) niveles.push(3);
  if (tipoCuentaId >= 7) niveles.push(3);
  if (tipoCuentaId >= 8) niveles.push(3);

  const segmentos: string[] = [];

  for (let i = 0; i < niveles.length && resto.length > 0; i++) {
    const len = niveles[i];
    segmentos.push(resto.slice(0, len));
    resto = resto.slice(len);
  }

  return [nivel1, ...segmentos].join('-');
};
