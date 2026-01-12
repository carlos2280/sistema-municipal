import {
  Background,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type OnNodeDrag,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { Button } from '@mui/material';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 0 },
    data: { label: 'Dirección Municipal' },
    type: 'default',
  },
  {
    id: '2',
    position: { x: 100, y: 150 },
    data: { label: 'Depto. Salud' },
    type: 'default',
  },
  {
    id: '3',
    position: { x: 400, y: 150 },
    data: { label: 'Depto. Educación' },
    type: 'custom',
  },
  {
    id: '4',
    position: { x: 50, y: 300 },
    data: { label: 'Oficina Sanitaria' },
    type: 'default',
  },
  {
    id: '5',
    position: { x: 450, y: 300 },
    data: { label: 'Oficina Pedagógica' },
    type: 'default',
  },
  {
    id: '6',
    position: { x: 30, y: 450 },
    data: { label: 'Usuario: Juan Pérez' },
    type: 'default',
  },
  {
    id: '7',
    position: { x: 480, y: 450 },
    data: { label: 'Usuario: Ana Torres' },
    type: 'default',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-7', source: '5', target: '7' },
];

export default function Organigrama() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [savedState, setSavedState] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
  });
  const [_, setMerged] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const getChildNodes = (parentId: string): Node[] => {
    const childIds = edges
      .filter((e) => e.source === parentId)
      .map((e) => e.target);
    return nodes.filter((n) => childIds.includes(n.id));
  };

  const onNodeDragStop: OnNodeDrag<Node> = (_, draggedNode) => {
    const targetNode = nodes.find((node) => {
      if (node.id === draggedNode.id) return false;
      const dx = Math.abs(node.position.x - draggedNode.position.x);
      const dy = Math.abs(node.position.y - draggedNode.position.y);
      return dx < 80 && dy < 80;
    });

    if (targetNode && draggedNode.id === '2' && targetNode.id === '3') {
      // Guardar el estado actual completo
      setSavedState({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });

      // Obtener hijos del nodo arrastrado
      const childNodes = getChildNodes(draggedNode.id);

      // Crear nuevos nodos y edges
      const newNodes = nodes.filter((n) => n.id !== draggedNode.id);
      const newEdges = edges
        .filter((e) => e.source !== draggedNode.id)
        .concat(
          childNodes.map((child) => ({
            id: `e${targetNode.id}-${child.id}`,
            source: targetNode.id,
            target: child.id,
          })),
        );

      // Actualizar el nodo destino
      const updatedNodes = newNodes.map((n) =>
        n.id === targetNode.id
          ? { ...n, data: { ...n.data, mergedDeptoSalud: true } }
          : n,
      );

      setNodes(updatedNodes);
      setEdges(newEdges);
      setMerged(true);
    }
  };

  const handleRestore = () => {
    // Primero limpiamos completamente el estado
    setNodes([]);
    setEdges([]);

    // Luego restauramos el estado guardado después de un pequeño delay
    setTimeout(() => {
      setNodes(JSON.parse(JSON.stringify(savedState.nodes)));
      setEdges(JSON.parse(JSON.stringify(savedState.edges)));
      setMerged(false);

      // Forzamos una actualización adicional para asegurar el posicionamiento
      setTimeout(() => {
        setNodes((nodes) => nodes.map((node) => ({ ...node })));
      }, 50);
    }, 50);
  };
  interface CustomNodeData {
    label: string;
    mergedDeptoSalud?: boolean;
  }
  const nodeTypes = {
    custom: ({ data }: { data: CustomNodeData; id: string }) => (
      <div
        style={{
          padding: 10,
          background: '#f0f0f0',
          border: '1px solid #999',
          borderRadius: 4,
          minWidth: 120,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Handle type="target" position={Position.Top} />
        <div>{data.label}</div>
        {data.mergedDeptoSalud && (
          <Button
            onClick={handleRestore}
            variant="contained"
            size="small"
            disableElevation
            style={{ marginTop: 8 }}
          >
            Restaurar Depto. Salud
          </Button>
        )}
        <Handle type="source" position={Position.Bottom} />
      </div>
    ),
  };

  return (
    <div style={{ width: '100%', height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
