'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent } from '@/types';
import {
  Radar,
  Brain,
  Target,
  Crown,
  ChevronDown,
  Check,
  Activity,
} from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  scout: <Radar size={18} />,
  strategist: <Brain size={18} />,
  tactical: <Target size={18} />,
  commander: <Crown size={18} />,
};

const statusColors: Record<string, string> = {
  idle: 'text-titanium',
  scanning: 'text-ice-blue',
  planning: 'text-amber',
  executing: 'text-crimson',
  resolved: 'text-emerald',
};

interface AgentPanelProps {
  agent: Agent;
  index: number;
}

export default function AgentPanel({ agent, index }: AgentPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="glass-panel rounded-2xl relative overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                agent.status === 'resolved'
                  ? 'bg-emerald/10 text-emerald'
                  : agent.status === 'scanning'
                  ? 'bg-ice-blue/10 text-ice-blue'
                  : agent.status === 'planning'
                  ? 'bg-amber/10 text-amber'
                  : 'bg-pearl/5 text-titanium'
              }`}
            >
              {agentIcons[agent.role]}
            </div>
            <div>
              <h3 className="text-sm font-medium text-pearl">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] uppercase tracking-wider ${statusColors[agent.status]}`}>
                  {agent.status}
                </span>
                <span className="text-[10px] text-titanium/40">•</span>
                <span className="text-[10px] text-titanium/60">{agent.timeline}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-mono text-pearl/80">{agent.confidence}%</div>
              <div className="text-[9px] text-titanium/50 uppercase tracking-wider">Confidence</div>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={14} className="text-titanium/40" />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-titanium/70">
          <Activity size={12} />
          <span>{agent.objective}</span>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-pearl/5 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-titanity/50">
                  Current Actions
                </span>
                {agent.actions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-titanium/70"
                  >
                    <Check size={10} className="text-emerald/60" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`absolute top-0 right-0 w-1 h-full ${
          agent.status === 'resolved'
            ? 'bg-emerald/30'
            : agent.status === 'scanning'
            ? 'bg-ice-blue/30'
            : agent.status === 'planning'
            ? 'bg-amber/30'
            : 'bg-pearl/5'
        }`}
      />
    </motion.div>
  );
}
