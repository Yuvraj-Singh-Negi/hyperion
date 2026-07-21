'use client';

import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
  Handle,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Agent, AgentState } from '@/types';
import { Radar, Brain, Target, Crown } from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  scout: <Radar size={16} />,
  strategist: <Brain size={16} />,
  tactical: <Target size={16} />,
  commander: <Crown size={16} />,
};

const statusColors: Record<string, string> = {
  idle: '#8e8e93',
  scanning: '#64d2ff',
  analyzing: '#64d2ff',
  planning: '#fbbf24',
  executing: '#ef4444',
  resolved: '#34d399',
};

function CoreNode() {
  return (
    <div className="relative w-20 h-20">
      <Handle type="target" position={Position.Top} className="!bg-ice-blue/30 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-ice-blue/30 !w-2 !h-2" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.15),transparent_70%)]" />
      <div className="absolute inset-2 rounded-full border border-ice-blue/20" />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-gradient-to-b from-ice-blue/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-gradient-to-t from-ice-blue/30 to-transparent" />
      </motion.div>
      <div className="absolute inset-[30%] rounded-full bg-ice-blue/20 blur-[2px]" />
      <div className="absolute inset-[45%] rounded-full bg-ice-blue/30 flex items-center justify-center">
        <span className="text-[6px] font-mono text-ice-blue font-bold">H</span>
      </div>
    </div>
  );
}

function AgentNode({ data }: NodeProps) {
  const agent = data.agent as Agent;
  const anomalies = data.anomalies as number;
  const scenarios = data.scenarios as number;
  const actions = data.actions as number;

  return (
    <div className={`glass-panel rounded-xl p-3 min-w-[160px] ${agent.status !== 'idle' ? 'border-ice-blue/20' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-ice-blue/30 !w-2 !h-2" />
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${statusColors[agent.status]}15`, color: statusColors[agent.status] }}
        >
          {agentIcons[agent.role]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-pearl/90">{agent.name}</span>
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColors[agent.status] }}
              animate={{ scale: agent.status !== 'idle' ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-[9px] text-titanium/50 truncate mt-0.5">{agent.objective}</p>
          <p className="text-[8px] text-titanium/30 font-mono mt-0.5 uppercase tracking-wider">{agent.status}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[9px] text-titanium/40">
        {anomalies > 0 && <span className="text-crimson/60">{anomalies} anomalies</span>}
        {scenarios > 0 && <span className="text-amber/60">{scenarios} scenarios</span>}
        {actions > 0 && <span className="text-ice-blue/60">{actions} actions</span>}
      </div>

      <div className="mt-1.5 h-0.5 rounded-full bg-pearl/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: statusColors[agent.status] }}
          animate={{
            width: agent.status === 'resolved' ? '100%' : agent.status === 'idle' ? '0%' : '60%',
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-ice-blue/30 !w-2 !h-2" />
    </div>
  );
}

interface AgentGraphProps {
  agents: Agent[];
  state: AgentState;
}

const nodeTypes = { agentNode: AgentNode, coreNode: CoreNode };
const edgeStyle = { stroke: 'rgba(100,210,255,0.2)', strokeWidth: 1 };

export default function AgentGraph({ agents, state }: AgentGraphProps) {
  const positions = useMemo(() => [
    { x: 50, y: 20 },
    { x: 450, y: 20 },
    { x: 50, y: 320 },
    { x: 450, y: 320 },
  ], []);

  const freshNodes: Node[] = useMemo(() => [
    {
      id: 'core',
      type: 'coreNode',
      position: { x: 275, y: 175 },
      data: {},
      draggable: false,
      selectable: false,
    },
    ...agents.map((agent, i) => ({
      id: agent.id,
      type: 'agentNode',
      position: positions[i],
      data: {
        agent: { ...agent },
        anomalies: state.scout.anomalies.length,
        scenarios: state.strategist.scenarios.length,
        actions: state.tactical.actions.length,
      },
    })),
  ], [agents, state, positions]);

  const edges: Edge[] = useMemo(() => [
    { id: 'e-scout-core', source: 'scout-1', target: 'core', animated: true, style: edgeStyle },
    { id: 'e-core-scout', source: 'core', target: 'scout-1', animated: true, style: { ...edgeStyle, stroke: 'rgba(100,210,255,0.1)' } },
    { id: 'e-strat-core', source: 'strategist-1', target: 'core', animated: true, style: edgeStyle },
    { id: 'e-core-strat', source: 'core', target: 'strategist-1', animated: true, style: { ...edgeStyle, stroke: 'rgba(100,210,255,0.1)' } },
    { id: 'e-tact-core', source: 'tactical-1', target: 'core', animated: true, style: edgeStyle },
    { id: 'e-core-tact', source: 'core', target: 'tactical-1', animated: true, style: { ...edgeStyle, stroke: 'rgba(100,210,255,0.1)' } },
    { id: 'e-cmd-core', source: 'commander-1', target: 'core', animated: true, style: edgeStyle },
    { id: 'e-core-cmd', source: 'core', target: 'commander-1', animated: true, style: { ...edgeStyle, stroke: 'rgba(100,210,255,0.1)' } },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(freshNodes);
  const [flowEdges] = useEdgesState(edges);

  useEffect(() => {
    setNodes(freshNodes);
  }, [freshNodes, setNodes]);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden" style={{ height: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes as any /* eslint-disable-line */}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-obsidian"
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
      </ReactFlow>
    </div>
  );
}
