'use client';

import { useMemo, memo, useState, useEffect } from 'react';
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
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 3), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-24 h-24">
      <Handle type="target" position={Position.Top} className="!bg-ice-blue/30 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-ice-blue/30 !w-2 !h-2" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.2),transparent_70%)]" />

      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-ice-blue/20"
          initial={{ scale: 1, opacity: 0.05 }}
          animate={pulse === i ? { scale: [1, 1.3, 1], opacity: [0.05, 0.02, 0.05] } : {}}
          transition={{ duration: 0.6 }}
        />
      ))}

      <div className="absolute inset-2 rounded-full border border-ice-blue/20" />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-ice-blue/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-ice-blue/40 to-transparent" />
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-ice-blue/40 to-transparent" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-l from-ice-blue/40 to-transparent" />
      </motion.div>
      <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-ice-blue/20 to-transparent blur-[3px]" />
      <div className="absolute inset-[40%] rounded-full bg-ice-blue/30 flex items-center justify-center shadow-glow-blue">
        <span className="text-[8px] font-mono text-ice-blue font-bold tracking-wider">H</span>
      </div>
    </div>
  );
});

const MemoizedAgentNode = memo(function AgentNodeComp({ data }: NodeProps) {
  const agent = data.agent as Agent;
  const anomalyCount = data.anomalyCount as number;
  const scenarioCount = data.scenarioCount as number;
  const actionCount = data.actionCount as number;
  const isCommanded = data.isCommanded as boolean;

  return (
    <motion.div
      className={`rounded-xl p-3 min-w-[170px] relative overflow-hidden ${
        agent.status !== 'idle'
          ? 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] shadow-2xl'
          : 'bg-white/[0.03] border border-white/[0.04]'
      }`}
      animate={agent.status === 'resolved' ? { borderColor: ['rgba(52,211,153,0.1)', 'rgba(52,211,153,0.4)', 'rgba(52,211,153,0.1)'] } : {}}
      transition={{ duration: 2, repeat: agent.status === 'resolved' ? Infinity : 0 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-ice-blue/30 !w-2 !h-2" />
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-40" style={{
        background: `linear-gradient(90deg, transparent, ${statusColors[agent.status]}, transparent)`,
      }} />
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
            agent.status !== 'idle' ? 'shadow-lg' : ''
          }`}
          style={{
            background: `${statusColors[agent.status]}18`,
            color: statusColors[agent.status],
            boxShadow: agent.status !== 'idle' ? `0 0 16px ${statusColors[agent.status]}25` : 'none',
          }}
        >
          {agentIcons[agent.role]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-pearl/90">{agent.name}</span>
            {isCommanded && (
              <span className="text-[7px] uppercase tracking-widest text-emerald/60 px-1 py-0.5 rounded bg-emerald/5 border border-emerald/10">
                Active
              </span>
            )}
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColors[agent.status] }}
              animate={agent.status !== 'idle' ? { scale: [1, 1.5, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, repeat: agent.status !== 'idle' ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-[10px] text-titanium/50 truncate mt-0.5 transition-all duration-300">{agent.objective}</p>
          <p className="text-[8px] font-mono mt-0.5 uppercase tracking-widest"
            style={{ color: agent.status !== 'idle' ? statusColors[agent.status] + '80' : 'rgba(142,142,147,0.3)' }}
          >
            {agent.status}
            {agent.confidence < 100 && agent.status !== 'idle' && ' · ' + agent.confidence + '% confidence'}
          </p>
        </div>
      </div>

      {(anomalyCount > 0 || scenarioCount > 0 || actionCount > 0) && (
        <div className="mt-2.5 flex items-center gap-2 text-[10px] flex-wrap">
          {anomalyCount > 0 && (
            <span className="text-crimson/80 px-2 py-0.5 rounded-full bg-crimson/10 border border-crimson/10">
              {anomalyCount} anomalies
            </span>
          )}
          {scenarioCount > 0 && (
            <span className="text-amber/80 px-2 py-0.5 rounded-full bg-amber/10 border border-amber/10">
              {scenarioCount} scenarios
            </span>
          )}
          {actionCount > 0 && (
            <span className="text-ice-blue/80 px-2 py-0.5 rounded-full bg-ice-blue/10 border border-ice-blue/10">
              {actionCount} actions
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 h-[2px] rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: statusColors[agent.status] }}
          animate={{
            width: agent.status === 'resolved' ? '100%' : agent.status === 'idle' ? '0%' : '60%',
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {agent.thinking && agent.status !== 'idle' && (
        <p className="mt-2 text-[9px] text-titanium/40 italic leading-relaxed border-t border-white/5 pt-2">{agent.thinking}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-ice-blue/30 !w-2 !h-2" />
    </motion.div>
  );
});

const nodeTypes = {
  coreNode: MemoizedCoreNode,
  agentNode: MemoizedAgentNode,
};

const POSITIONS = [
  { x: 40, y: 20 },
  { x: 460, y: 20 },
  { x: 40, y: 330 },
  { x: 460, y: 330 },
];

function buildEdges(agents: Agent[], activeRole?: string): Edge[] {
  const base: Edge[] = [
    { id: 'e-scout-core', source: 'scout-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
    { id: 'e-core-scout', source: 'core', target: 'scout-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
    { id: 'e-strat-core', source: 'strategist-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
    { id: 'e-core-strat', source: 'core', target: 'strategist-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
    { id: 'e-tact-core', source: 'tactical-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
    { id: 'e-core-tact', source: 'core', target: 'tactical-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
    { id: 'e-cmd-core', source: 'commander-1', target: 'core', animated: true, style: { stroke: 'rgba(100,210,255,0.25)', strokeWidth: 1.5 } },
    { id: 'e-core-cmd', source: 'core', target: 'commander-1', animated: true, style: { stroke: 'rgba(100,210,255,0.08)', strokeWidth: 0.5 } },
  ];

  return base.map((edge) => {
    const isActive = activeRole && edge.id.includes(activeRole);
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isActive ? 'rgba(100,210,255,0.6)' : edge.style?.stroke,
        strokeWidth: isActive ? 2.5 : edge.style?.strokeWidth,
      },
    };
  });
}

function buildNodes(agents: Agent[], state: AgentState, activeRole?: string): Node[] {
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
        isCommanded: activeRole === agent.role,
      },
    })),
  ];
}

interface AgentGraphProps {
  agents: Agent[];
  state: AgentState;
  activeRole?: string;
}

export default function AgentGraph({ agents, state, activeRole }: AgentGraphProps) {
  const nodes = useMemo(() => buildNodes(agents, state, activeRole), [agents, state, activeRole]);
  const edges = useMemo(() => buildEdges(agents, activeRole), [agents, activeRole]);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden" style={{ height: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        zoomOnScroll={false}
        zoomOnPinch={true}
        preventScrolling={false}
        minZoom={0.4}
        maxZoom={1.8}
        panOnDrag={true}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-obsidian"
      >
        <Background color="rgba(100,210,255,0.03)" gap={24} />
      </ReactFlow>
    </div>
  );
}
