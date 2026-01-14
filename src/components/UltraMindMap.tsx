'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  getNodesBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Types for Ultra Map data
interface UltraMapNode {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority?: string;
  keywords?: string[];
  children?: UltraMapNode[];
}

interface UltraMapConnection {
  from: string;
  to: string;
  label?: string;
}

interface UltraMapData {
  nodes: UltraMapNode[];
  connections?: UltraMapConnection[];
  stats?: {
    total_nodes: number;
    total_connections: number;
    sections_processed: number;
    max_depth: number;
  };
}

// Color scheme by node type
const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  concept: { bg: '#1e40af', border: '#3b82f6', text: '#ffffff' },
  definition: { bg: '#7c3aed', border: '#a78bfa', text: '#ffffff' },
  formula: { bg: '#0d9488', border: '#2dd4bf', text: '#ffffff' },
  example: { bg: '#d97706', border: '#fbbf24', text: '#ffffff' },
  process: { bg: '#059669', border: '#34d399', text: '#ffffff' },
  theory: { bg: '#1e40af', border: '#3b82f6', text: '#ffffff' },
  law: { bg: '#be185d', border: '#f472b6', text: '#ffffff' },
  default: { bg: '#475569', border: '#94a3b8', text: '#ffffff' },
};

// Custom Node Component - with inline text expansion and high z-index
const MindMapNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const colors = typeColors[data.type] || typeColors.default;
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.description) {
      setExpanded(!expanded);
    }
  }, [data.description, expanded]);

  const isRoot = data.level === 0;
  const isCategory = data.level === 1;

  return (
    <div style={{ zIndex: expanded ? 1000 : 1 }} className="relative">
      {/* Connection handles - left/right for horizontal tree */}
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !border-slate-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-slate-500 !border-slate-400 !w-2 !h-2" />

      <div
        className={`cursor-pointer transition-all duration-200 ${selected ? 'ring-2 ring-white' : ''} ${data.description ? 'hover:brightness-110' : ''}`}
        style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: '8px',
          padding: isRoot ? '10px 16px' : '6px 12px',
          minWidth: isRoot ? '140px' : isCategory ? '110px' : '90px',
          maxWidth: expanded ? '300px' : (isRoot ? '180px' : isCategory ? '150px' : '130px'),
          boxShadow: expanded
            ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 2px ${colors.border}`
            : '0 2px 6px rgba(0,0,0,0.25)',
        }}
        onClick={handleClick}
      >
        {/* Title */}
        <div
          style={{ color: colors.text }}
          className={`text-center leading-tight font-medium ${isRoot ? 'text-sm' : 'text-xs'}`}
        >
          {data.label}
        </div>

        {/* Expandable description */}
        {data.description && (
          <>
            {!expanded && (
              <div className="text-center text-[8px] text-white/50 mt-1">
                ▼ info
              </div>
            )}
            {expanded && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/90 leading-relaxed text-left">
                  {data.description}
                </p>
                <div className="text-center text-[8px] text-white/50 mt-2 hover:text-white/80">
                  ▲ chiudi
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  mindmap: MindMapNode,
};

// ============================================
// HORIZONTAL TREE LAYOUT - Ordered left to right
// ============================================
function calculateTreeLayout(
  rootNodes: UltraMapNode[],
  connections: UltraMapConnection[] = [],
  isMobile: boolean = false
): { nodes: Node[]; edges: Edge[] } {
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];
  const addedNodeIds = new Set<string>();

  const root = rootNodes[0];
  if (!root) return { nodes: [], edges: [] };

  // Layout configuration - generous spacing
  const config = {
    levelGap: isMobile ? 220 : 300,      // Horizontal gap between levels
    nodeGapY: isMobile ? 80 : 100,       // Vertical gap between sibling nodes
  };

  // Helper to add a node
  const addNode = (
    node: UltraMapNode,
    level: number,
    x: number,
    y: number,
    parentId?: string
  ) => {
    const nodeId = node.id || `node_${flowNodes.length}`;
    if (addedNodeIds.has(nodeId)) return;

    addedNodeIds.add(nodeId);

    flowNodes.push({
      id: nodeId,
      type: 'mindmap',
      position: { x, y },
      data: {
        label: node.title,
        type: node.type || 'concept',
        description: node.description,
        level,
      },
    });

    // Add edge from parent
    if (parentId) {
      flowEdges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        style: {
          stroke: typeColors[node.type]?.border || '#94a3b8',
          strokeWidth: level === 1 ? 2.5 : level === 2 ? 2 : 1.5,
        },
      });
    }
  };

  // Calculate total height needed for a subtree
  const calculateSubtreeHeight = (node: UltraMapNode, level: number): number => {
    const children = node.children || [];
    if (children.length === 0 || level >= 3) {
      return config.nodeGapY;
    }

    let totalHeight = 0;
    const limitedChildren = children.slice(0, level === 2 ? 4 : 6);
    limitedChildren.forEach(child => {
      totalHeight += calculateSubtreeHeight(child, level + 1);
    });

    return Math.max(totalHeight, config.nodeGapY);
  };

  // Recursive layout function
  const layoutNode = (
    node: UltraMapNode,
    level: number,
    x: number,
    startY: number,
    parentId?: string
  ): number => {
    const nodeId = node.id || `node_${flowNodes.length}`;
    const maxChildren = level === 0 ? 8 : level === 1 ? 6 : level === 2 ? 4 : 3;
    const children = (node.children || []).slice(0, maxChildren);

    if (children.length === 0 || level >= 3) {
      // Leaf node - place it and return its height
      addNode(node, level, x, startY, parentId);
      return startY + config.nodeGapY;
    }

    // Position children first, then center parent
    const childX = x + config.levelGap;
    let childY = startY;
    const childPositions: number[] = [];

    children.forEach((child) => {
      const subtreeHeight = calculateSubtreeHeight(child, level + 1);

      // Layout child subtree
      const nextY = layoutNode(child, level + 1, childX, childY, nodeId);

      // Record where this child was placed (center of its subtree)
      childPositions.push(childY + (nextY - childY - config.nodeGapY) / 2);

      childY = nextY;
    });

    // Center parent vertically among its children
    const parentY = childPositions.length > 0
      ? (childPositions[0] + childPositions[childPositions.length - 1]) / 2
      : startY;

    addNode(node, level, x, parentY, parentId);

    return childY;
  };

  // Start layout from root
  layoutNode(root, 0, 0, 0);

  // *** CENTRA LA MAPPA ***
  // Calcola il bounding box di tutti i nodi
  if (flowNodes.length > 0) {
    const nodeWidth = 150;
    const nodeHeight = 50;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    flowNodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // Calcola il centro della mappa
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Sposta tutti i nodi per centrare la mappa su (0, 0)
    flowNodes.forEach(node => {
      node.position.x -= centerX;
      node.position.y -= centerY;
    });
  }

  // Add cross-links (dashed style) - only if both nodes exist
  const validConnections = (connections || [])
    .filter(conn => conn.from && conn.to && addedNodeIds.has(conn.from) && addedNodeIds.has(conn.to))
    .slice(0, 5);

  validConnections.forEach((conn, index) => {
    flowEdges.push({
      id: `cross-${index}`,
      source: conn.from,
      target: conn.to,
      type: 'smoothstep',
      style: {
        stroke: '#f472b6',
        strokeWidth: 1.5,
        strokeDasharray: '6,4',
        opacity: 0.5,
      },
    });
  });

  return { nodes: flowNodes, edges: flowEdges };
}

// ============================================
// Zoom Buttons Inline (for top position)
// ============================================
const ZoomButtonsInline: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-600 flex items-center overflow-hidden">
      <button
        onClick={() => zoomOut()}
        className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
        title="Zoom out"
      >
        −
      </button>
      <div className="w-px h-5 bg-slate-600" />
      <button
        onClick={() => fitView({ padding: 0.03, maxZoom: 1.5 })}
        className="px-2 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-[10px]"
        title="Reset vista"
      >
        ⟲
      </button>
      <div className="w-px h-5 bg-slate-600" />
      <button
        onClick={() => zoomIn()}
        className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
};

// ============================================
// Zoom Controls Component (bottom position)
// ============================================
const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="bottom-right" className="!m-2">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-600 flex items-center overflow-hidden">
        <button
          onClick={() => zoomOut()}
          className="px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-base font-medium"
          title="Zoom out"
        >
          −
        </button>
        <div className="w-px h-6 bg-slate-600" />
        <button
          onClick={() => fitView({ padding: 0.03, maxZoom: 1.5 })}
          className="px-2.5 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
          title="Reset vista"
        >
          ⟲
        </button>
        <div className="w-px h-6 bg-slate-600" />
        <button
          onClick={() => zoomIn()}
          className="px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-base font-medium"
          title="Zoom in"
        >
          +
        </button>
      </div>
    </Panel>
  );
};

// ============================================
// Inner Flow Component with Smart Scroll
// ============================================
const MindMapFlow: React.FC<{ data: UltraMapData; isMobile: boolean }> = ({ data, isMobile }) => {
  const { getViewport, setViewport } = useReactFlow();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => calculateTreeLayout(data.nodes, data.connections || [], isMobile),
    [data, isMobile]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateTreeLayout(data.nodes, data.connections || [], isMobile);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, isMobile, setNodes, setEdges]);

  // Calcola i bounds della mappa
  const mapBounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000, width: 1000, height: 1000 };

    const padding = 100;
    const nodeWidth = 200;
    const nodeHeight = 100;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: (maxX + padding) - (minX - padding),
      height: (maxY + padding) - (minY - padding),
    };
  }, [nodes]);

  const translateExtent: [[number, number], [number, number]] = [
    [mapBounds.minX, mapBounds.minY],
    [mapBounds.maxX, mapBounds.maxY]
  ];

  // Check se la mappa è più grande del container (serve scroll)
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (!containerRef.current) return;
      const viewport = getViewport();
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scaledMapWidth = mapBounds.width * viewport.zoom;
      const scaledMapHeight = mapBounds.height * viewport.zoom;
      setCanScroll(scaledMapWidth > containerWidth || scaledMapHeight > containerHeight);
    };

    checkScrollNeeded();
    // Ricontrolla dopo un attimo (per quando cambia lo zoom)
    const timeout = setTimeout(checkScrollNeeded, 100);
    return () => clearTimeout(timeout);
  }, [getViewport, mapBounds, nodes]);

  // Custom wheel handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!containerRef.current) return;

    const viewport = getViewport();
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scaledMapWidth = mapBounds.width * viewport.zoom;
    const scaledMapHeight = mapBounds.height * viewport.zoom;

    // Se la mappa sta tutta nel container, lascia passare lo scroll alla pagina
    if (scaledMapWidth <= containerWidth && scaledMapHeight <= containerHeight) {
      return; // Non fare nulla, scroll passa alla pagina
    }

    // Calcola i limiti di pan
    const maxPanX = -mapBounds.minX * viewport.zoom + 50;
    const minPanX = containerWidth - scaledMapWidth - mapBounds.minX * viewport.zoom - 50;
    const maxPanY = -mapBounds.minY * viewport.zoom + 50;
    const minPanY = containerHeight - scaledMapHeight - mapBounds.minY * viewport.zoom - 50;

    // Posizione corrente
    const currentX = viewport.x;
    const currentY = viewport.y;

    // Check se siamo ai bordi nella direzione dello scroll
    const atTop = currentY >= maxPanY - 5;
    const atBottom = currentY <= minPanY + 5;
    const atLeft = currentX >= maxPanX - 5;
    const atRight = currentX <= minPanX + 5;

    // Se scrolliamo verso un bordo già raggiunto, lascia passare alla pagina
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      return;
    }

    // Altrimenti gestisci lo scroll interno
    e.stopPropagation();

    const newX = Math.max(minPanX, Math.min(maxPanX, currentX - e.deltaX));
    const newY = Math.max(minPanY, Math.min(maxPanY, currentY - e.deltaY));

    setViewport({ x: newX, y: newY, zoom: viewport.zoom });
  }, [getViewport, setViewport, mapBounds]);

  const legendItems = [
    { type: 'concept', label: 'Concetti' },
    { type: 'definition', label: 'Definizioni' },
    { type: 'formula', label: 'Formule' },
    { type: 'example', label: 'Esempi' },
  ];

  return (
    <div ref={containerRef} className="w-full h-full" onWheel={handleWheel}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.03, maxZoom: 1.5 }}
        minZoom={0.3}
        maxZoom={2}
        translateExtent={translateExtent}
        style={{ background: '#0f172a' }}
        proOptions={{ hideAttribution: true }}
        // Interazioni
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}           // ✓ Manina per spostarsi
        panOnScroll={false}        // Gestiamo noi con handleWheel
        zoomOnScroll={false}       // Solo bottoni
        zoomOnPinch={false}        // Solo bottoni
        zoomOnDoubleClick={false}
        preventScrolling={false}
        selectionOnDrag={false}
      >
      <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="#1e293b" />

      {/* Zoom Controls - Top Right */}
      <Panel position="top-right" className="!m-2">
        <ZoomButtonsInline />
      </Panel>

      {/* Zoom Controls - Bottom Right */}
      <ZoomControls />

      {/* Legend */}
      <Panel position="top-left" className="!m-2">
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
          <div className="grid grid-cols-2 gap-1.5">
            {legendItems.map(item => (
              <div key={item.type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded flex-shrink-0"
                  style={{ background: typeColors[item.type]?.bg, border: `1px solid ${typeColors[item.type]?.border}` }}
                />
                <span className="text-[9px] text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Instructions */}
      <Panel position="bottom-left" className="!m-2">
        <div className="bg-slate-900/90 rounded-lg px-3 py-1.5 text-[10px] text-slate-400 border border-slate-700">
          🖱️ Trascina per spostarti • Clicca un nodo per dettagli
        </div>
      </Panel>
      </ReactFlow>
    </div>
  );
};

// ============================================
// Main Component (wrapped with Provider)
// ============================================
export const UltraMindMap: React.FC<{ data: UltraMapData }> = ({ data }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!data?.nodes?.length) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-500/20 p-6 rounded-xl border border-yellow-500/30">
          <p className="text-yellow-300">Nessun dato disponibile per la mappa</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl overflow-hidden border border-slate-700 ${isMobile ? 'h-[500px]' : 'h-[700px]'}`}>
      <ReactFlowProvider>
        <MindMapFlow data={data} isMobile={isMobile} />
      </ReactFlowProvider>
    </div>
  );
};

export default UltraMindMap;
