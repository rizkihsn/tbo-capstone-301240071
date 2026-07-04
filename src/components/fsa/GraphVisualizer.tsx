import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node component untuk merender state (termasuk Final State double circle)
const FsaNode = ({ data, selected }: NodeProps) => {
  const isFinal = Boolean(data.isFinal);
  const isStart = Boolean(data.isStart);
  const isActive = Boolean(data.isActive);
  const label = String(data.label || '');

  return (
    <div className={`
      relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_24px_rgba(59,130,246,0.7)] border-2 border-white scale-110' 
        : 'bg-slate-800/90 text-slate-200 border-2 border-slate-600 hover:border-slate-400'
      }
      ${selected ? 'ring-4 ring-purple-500/50' : ''}
    `}>
      {isFinal && (
        <div className={`
          absolute inset-1 rounded-full border-2 pointer-events-none
          ${isActive ? 'border-white/60' : 'border-slate-500/60'}
        `} />
      )}
      
      {isStart && (
        <div className={`absolute -left-7 top-1/2 -translate-y-1/2 text-lg font-bold transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
          ▸
        </div>
      )}

      <Handle type="target" position={Position.Left} className="opacity-0" />
      <span className="z-10 truncate max-w-12 px-0.5">{label}</span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  fsaNode: FsaNode,
};

interface GraphVisualizerProps {
  states: string[];
  transitions: { from: string; to: string; symbol: string }[];
  startState: string;
  finalStates: string[];
  activeStates: string[];
  stateLabels?: Record<string, string>;
}

export default function GraphVisualizer({
  states,
  transitions,
  startState,
  finalStates,
  activeStates,
  stateLabels,
}: GraphVisualizerProps) {
  
  const initialNodes = useMemo(() => {
    // Layout: tempatkan nodes dalam pola yang lebih cerdas
    const nodeCount = states.length;
    return states.map((state, index) => {
      // Gunakan layout lingkaran untuk > 4 state, linear untuk sisanya
      let x, y;
      if (nodeCount <= 4) {
        x = 120 + index * 220;
        y = 200;
      } else {
        const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
        const radius = Math.max(150, nodeCount * 30);
        x = 400 + Math.cos(angle) * radius;
        y = 250 + Math.sin(angle) * radius;
      }
      
      return {
        id: state,
        type: 'fsaNode',
        position: { x, y },
        data: { 
          label: stateLabels ? stateLabels[state] : state, 
          isFinal: finalStates.includes(state),
          isStart: state === startState,
          isActive: activeStates.includes(state),
        },
      };
    });
  }, [states, finalStates, startState, activeStates, stateLabels]);

  const initialEdges = useMemo(() => {
    const edgeMap = new Map<string, string[]>();
    transitions.forEach((t) => {
      const key = `${t.from}-${t.to}`;
      if (!edgeMap.has(key)) edgeMap.set(key, []);
      if (!edgeMap.get(key)!.includes(t.symbol)) {
        edgeMap.get(key)!.push(t.symbol);
      }
    });

    return Array.from(edgeMap.entries()).map(([key, symbols], index) => {
      const [from, to] = key.split('-');
      const isSelfLoop = from === to;
      const isEdgeActive = activeStates.includes(to) && activeStates.includes(from);
      
      return {
        id: `e-${key}-${index}`,
        source: from,
        target: to,
        sourceHandle: isSelfLoop ? 'top' : undefined,
        label: symbols.join(', '),
        type: isSelfLoop ? 'bezier' : 'smoothstep',
        animated: isEdgeActive,
        style: { 
          stroke: isEdgeActive ? '#3b82f6' : '#334155', 
          strokeWidth: isEdgeActive ? 2.5 : 1.5,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        },
        labelStyle: { 
          fill: isEdgeActive ? '#93c5fd' : '#94a3b8', 
          fontWeight: 700, 
          fontSize: 12,
        },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeActive ? '#3b82f6' : '#334155',
          width: 16,
          height: 16,
        },
      };
    });
  }, [transitions, activeStates]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#060a14]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} color="#1e293b" size={1} />
        <Controls 
          className="bg-slate-900/80 border-slate-700/50 rounded-lg backdrop-blur" 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
