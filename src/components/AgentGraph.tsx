'use client';

import { useMemo, memo } from 'react';
import {
  ReactFlow,
  Background,
  Position,
  Handle,
  NodeProps,
  Node,
  Edge,
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

const MemoizedCoreNode = memo(function CoreNode() {
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
});

const MemoizedAgentNode = memo(function AgentNodeComp({ data }: NodeProps) {
  const agent = data.agent as Agent;
  const anomalyCount = data.anomalyCount as number;
  const scenarioCount = data.scenarioCount as number;
  const actionCount = data.actionCount as number;

  return (
    <div className={`glass-panel rounded-xl p-3 min-w-[160px] ${agent.status !== 'idle' ? 'border-ice-blue/20 shadow-glow-blue' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-ice-blue/30 !w-2 !h-2" />
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500"
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
              animate={agent.status !== 'idle' ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: agent.status !== 'idle' ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-[9px] text-titanium/50 truncate mt-0.5 transition-all duration-300">{agent.objective}</p>
          <p className="text-[8px] text-titanium/30 font-mono mt-0.5 uppercase tracking-wider">{agent.status}</p>
        </div>
      </div>

      {(anomalyCount > 0 || scenarioCount > 0 || actionCount > 0) && (
        <div className="mt-2 flex items-center gap-2 text-[9px] flex-wrap">
          {anomalyCount > 0 && <span className="text-crimson/70 px-1.5 py-0.5 rounded bg-crimson/10">{anomalyCount} anomalies</span>}
          {scenarioCount > 0 && <span className="text-amber/70 px-1.5 py-0.5 rounded bg-amber/10">{scenarioCount} scenarios</span>}
          {actionCount > 0 && <span className="text-ice-blue/70 px-1.5 py-0.5 rounded bg-ice-blue/10">{actionCount} actions</span>}
        </div>
      )}

      <div className="mt-2 h-0.5 rounded-full bg-pearl/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: statusColors[agent.status] }}
          animate={{
            width: agent.status === 'resolved' ? '100%' : agent.status === 'idle' ? '0%' : '60%',
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-ice-blue/30 !w-2 !h-2" />
    </div>
  );
});

const nodeTypes = {
  coreNode: MemoizedCoreNode,
  agentNode: MemoizedAgentNode,
};

const EDGES: Edge[] = [
  { id: 'e-scout-core', source: 'scout-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
  { id: 'e-core-scout', source: 'core', target: 'scout-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
  { id: 'e-strat-core', source: 'strategist-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
  { id: 'e-core-strat', source: 'core', target: 'strategist-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
  { id: 'e-tact-core', source: 'tactical-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
  { id: 'e-core-tact', source: 'core', target: 'tactical-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
  { id: 'e-cmd-core', source: 'commander-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
  { id: 'e-core-cmd', source: 'core', target: 'commander-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
];

const POSITIONS = [
  { x: 50, y: 20 },
  { x: 450, y: 20 },
  { x: 50, y: 320 },
  { x: 450, y: 320 },
];

function buildNodes(agents: Agent[], state: AgentState): Node[] {
  return [
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
      position: POSITIONS[i],
      draggable: true,
      data: {
        agent,
        anomalyCount: state.scout.anomalies.length,
        scenarioCount: state.strategist.scenarios.length,
        actionCount: state.tactical.actions.length,
      },
    })),
  ];
}

interface AgentGraphProps {
  agents: Agent[];
  state: AgentState;
}

export default function AgentGraph({ agents, state }: AgentGraphProps) {
  const nodes = useMemo(() => buildNodes(agents, state), [agents, state]);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden" style={{ height: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={EDGES}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
    zoomOnScroll={false}
    zoomOnPinch={true}
    preventScrolling={false}
    minZoom={0.5}
    maxZoom={1.5}
    panOnDrag={true}
    selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-obsidian"
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
      </ReactFlow>
    </div>
  );
}
