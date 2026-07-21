'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
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
    <div className={`glass-panel rounded-xl p-3 min-w-[160px] ${agent.status === 'resolved' ? 'border-emerald/20' : ''}`}>
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
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColors[agent.status] }}
            />
          </div>
          <p className="text-[9px] text-titanium/50 truncate mt-0.5">{agent.objective}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[9px] text-titanium/40">
        {anomalies > 0 && <span>{anomalies} anomalies</span>}
        {scenarios > 0 && <span>{scenarios} scenarios</span>}
        {actions > 0 && <span>{actions} actions</span>}
      </div>

      <div className="mt-1.5 h-0.5 rounded-full bg-pearl/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: statusColors[agent.status] }}
          initial={{ width: '0%' }}
          animate={{ width: agent.status === 'resolved' ? '100%' : agent.status === 'idle' ? '0%' : '60%' }}
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

export default function AgentGraph({ agents, state }: AgentGraphProps) {
  const initialNodes: Node[] = useMemo(() => [
    {
      id: 'core',
      type: 'coreNode',
      position: { x: 275, y: 175 },
      data: {},
      draggable: false,
      selectable: false,
    },
    ...agents.map((agent, i) => {
      const positions = [
        { x: 50, y: 20 },
        { x: 450, y: 20 },
        { x: 50, y: 320 },
        { x: 450, y: 320 },
      ];
      return {
        id: agent.id,
        type: 'agentNode',
        position: positions[i],
        data: {
          agent,
          anomalies: state.scout.anomalies.length,
          scenarios: state.strategist.scenarios.length,
          actions: state.tactical.actions.length,
        },
      };
    }),
  ], [agents, state]);

  const initialEdges: Edge[] = useMemo(() => [
    { id: 'e-scout-core', source: 'scout-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.2)', strokeWidth: 1 } },
    { id: 'e-core-scout', source: 'core', target: 'scout-1', animated: true, style: { stroke: 'rgba(100,210,255,0.1)', strokeWidth: 0.5 } },
    { id: 'e-strat-core', source: 'strategist-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.2)', strokeWidth: 1 } },
    { id: 'e-core-strat', source: 'core', target: 'strategist-1', animated: true, style: { stroke: 'rgba(100,210,255,0.1)', strokeWidth: 0.5 } },
    { id: 'e-tact-core', source: 'tactical-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.2)', strokeWidth: 1 } },
    { id: 'e-core-tact', source: 'core', target: 'tactical-1', animated: true, style: { stroke: 'rgba(100,210,255,0.1)', strokeWidth: 0.5 } },
    { id: 'e-cmd-core', source: 'commander-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.2)', strokeWidth: 1 } },
    { id: 'e-core-cmd', source: 'core', target: 'commander-1', animated: true, style: { stroke: 'rgba(100,210,255,0.1)', strokeWidth: 0.5 } },
  ], []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden" style={{ height: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes as any /* eslint-disable-line @typescript-eslint/no-explicit-any */}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="bg-obsidian"
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <Controls className="!bg-graphite !border-pearl/10 !rounded-lg [&_button]:!text-titanium [&_button]:!border-pearl/10 [&_button]:hover:!bg-pearl/5" />
      </ReactFlow>
    </div>
  );
}
