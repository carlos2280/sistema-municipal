import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ScanSearch } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  useAppSelector,
  selectUsuarioId,
  useGetOrganigramaQuery,
  type OrgDireccion,
} from 'mf_store/store';
import { OrgNode, type OrgNodeType } from './OrgNode';

// ============================================================================
// Tipos internos del layout
// ============================================================================

interface BuildNode {
  id: string;
  label: string;
  nodeType: OrgNodeType;
  highlighted?: boolean;
  subtitle?: string;
  children?: BuildNode[];
}

// ============================================================================
// Layout algorithm — árbol jerárquico top-to-bottom centrado
// ============================================================================

const NODE_W = 180;
const NODE_H = 60;
const H_GAP = 20;
const V_GAP = 68;

function getLeafCount(node: BuildNode): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((s, c) => s + getLeafCount(c), 0);
}

function buildLayout(
  node: BuildNode,
  xLeft: number,
  y: number,
  nodes: Node[],
  edges: Edge[],
  parentHighlighted: boolean,
  parentId?: string,
): void {
  const leaves = getLeafCount(node);
  const subtreeW = leaves * (NODE_W + H_GAP) - H_GAP;
  const x = xLeft + (subtreeW - NODE_W) / 2;

  nodes.push({
    id: node.id,
    position: { x, y },
    data: {
      label: node.label,
      nodeType: node.nodeType,
      highlighted: node.highlighted ?? false,
      subtitle: node.subtitle,
    },
    type: 'orgNode',
  });

  if (parentId) {
    const edgeIsOnPath = parentHighlighted && (node.highlighted ?? false);
    edges.push({
      id: `${parentId}=>${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      style: edgeIsOnPath
        ? { stroke: '#1976d2', strokeWidth: 2.5 }
        : { stroke: '#94a3b8', strokeWidth: 1.5 },
      animated: edgeIsOnPath,
    });
  }

  let curX = xLeft;
  for (const child of node.children ?? []) {
    const childLeaves = getLeafCount(child);
    const childW = childLeaves * (NODE_W + H_GAP) - H_GAP;
    buildLayout(
      child,
      curX,
      y + NODE_H + V_GAP,
      nodes,
      edges,
      node.highlighted ?? false,
      node.id,
    );
    curX += childW + H_GAP;
  }
}

// ============================================================================
// Transformación: datos API → árbol con path del usuario logueado resaltado
// ============================================================================

function buildTreeFromApi(
  data: OrgDireccion[],
  currentUserId: number | null,
): BuildNode {
  const highlightedIds = new Set<string>();

  if (currentUserId !== null) {
    outer: for (const dir of data) {
      for (const dep of dir.departamentos) {
        for (const of_ of dep.oficinas) {
          if (of_.usuarios.some((u) => u.id === currentUserId)) {
            highlightedIds.add('root');
            highlightedIds.add(`dir-${dir.id}`);
            highlightedIds.add(`dep-${dep.id}`);
            highlightedIds.add(`of-${of_.id}`);
            highlightedIds.add(`usr-${currentUserId}`);
            break outer;
          }
        }
      }
    }
  }

  return {
    id: 'root',
    label: 'MUNICIPALIDAD',
    nodeType: 'root',
    highlighted: highlightedIds.has('root'),
    children: data.map((dir) => ({
      id: `dir-${dir.id}`,
      label: dir.nombre,
      nodeType: 'direccion' as OrgNodeType,
      highlighted: highlightedIds.has(`dir-${dir.id}`),
      children: dir.departamentos.map((dep) => ({
        id: `dep-${dep.id}`,
        label: dep.nombre,
        nodeType: 'departamento' as OrgNodeType,
        highlighted: highlightedIds.has(`dep-${dep.id}`),
        children: dep.oficinas.map((of_) => ({
          id: `of-${of_.id}`,
          label: of_.nombre,
          nodeType: 'oficina' as OrgNodeType,
          highlighted: highlightedIds.has(`of-${of_.id}`),
          children: of_.usuarios.map((usr) => ({
            id: `usr-${usr.id}`,
            label: usr.nombre,
            nodeType: (
              usr.id === currentUserId ? 'currentUser' : 'usuario'
            ) as OrgNodeType,
            highlighted: usr.id === currentUserId,
            subtitle: usr.email,
          })),
        })),
      })),
    })),
  };
}

// ============================================================================
// Panel "Ver todo"
// ============================================================================

function FitViewPanel() {
  const { fitView } = useReactFlow();
  return (
    <Panel position="top-center">
      <Button
        variant="outlined"
        size="small"
        startIcon={<ScanSearch size={15} />}
        onClick={() => fitView({ padding: 0.1, duration: 600 })}
        sx={{
          bgcolor: 'background.paper',
          fontSize: '0.72rem',
          px: 1.5,
          py: 0.5,
          boxShadow: 1,
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        Ver todo
      </Button>
    </Panel>
  );
}

// ============================================================================
// Componente principal
// ============================================================================

const nodeTypes = { orgNode: OrgNode };

export function OrganigramaFlow() {
  const theme = useTheme();
  const currentUserId = useAppSelector(selectUsuarioId);
  const { data, isLoading, isError } = useGetOrganigramaQuery();

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    const tree = buildTreeFromApi(data, currentUserId);
    const ns: Node[] = [];
    const es: Edge[] = [];
    buildLayout(tree, 0, 0, ns, es, false);
    return { nodes: ns, edges: es };
  }, [data, currentUserId]);

  const rootNode = useMemo(() => nodes.find((n) => n.id === 'root'), [nodes]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (!rootNode) return;
      instance.setCenter(
        rootNode.position.x + NODE_W / 2,
        rootNode.position.y + NODE_H / 2 + 80,
        { duration: 0, zoom: 0.7 },
      );
    },
    [rootNode],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary">
          Cargando organigrama…
        </Typography>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error">
          No se pudo cargar el organigrama. Intente nuevamente.
        </Typography>
      </Box>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onInit={handleInit}
      panOnScroll
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.05}
      maxZoom={2}
      colorMode="system"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color={alpha(theme.palette.text.primary, 0.1)}
      />
      <Controls />
      <FitViewPanel />
      <MiniMap
        nodeColor={(node) => {
          const d = node.data as { nodeType: OrgNodeType; highlighted?: boolean };
          if (d.nodeType === 'currentUser') return theme.palette.success.main;
          if (d.highlighted) return theme.palette.primary.main;
          if (d.nodeType === 'root') return theme.palette.primary.dark;
          if (d.nodeType === 'direccion') return theme.palette.secondary.main;
          if (d.nodeType === 'departamento') return theme.palette.info.main;
          if (d.nodeType === 'oficina') return theme.palette.grey[400];
          return theme.palette.grey[300];
        }}
        zoomable
        pannable
      />
    </ReactFlow>
  );
}
