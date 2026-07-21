'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { statusFeed } from '@/constants/mockData';
import { fadeInUp, staggerContainer } from '@/animations/motionVariants';
import {
  AlertTriangle,
  Globe,
  Activity,
  TrendingUp,
  Shield,
} from 'lucide-react';

const sourceIcons: Record<string, React.ReactNode> = {
  Scout: <Globe size={12} />,
  Strategist: <TrendingUp size={12} />,
  Tactical: <Shield size={12} />,
  Commander: <Activity size={12} />,
};

export default function DataFeed() {
  const reversedFeed = useMemo(() => [...statusFeed].reverse(), []);

  return (
    <section id="data-feed" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-graphite/10 to-obsidian" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16 space-y-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-ice-blue uppercase"
          >
            <Activity size={12} />
            <span>Live Intelligence Feed</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-light text-pearl"
          >
            Signal Intelligence
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-titanium/60 max-w-xl mx-auto text-sm sm:text-base"
          >
            Real-time data streams processed, analyzed, and prioritized by Hyperion&apos;s
            agent swarm.
          </motion.p>
        </motion.div>

        <motion.div
          className="glass-panel rounded-3xl overflow-hidden max-w-3xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="px-6 py-4 border-b border-pearl/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs tracking-wider text-titanium uppercase">Live Feed</span>
            </div>
            <span className="text-[10px] text-titanity/40 font-mono">
              {reversedFeed.length} signals
            </span>
          </div>

          <div className="divide-y divide-pearl/[0.03]">
            {reversedFeed.map((signal, i) => (
              <motion.div
                key={signal.id}
                className="px-6 py-4 hover:bg-pearl/[0.02] transition-colors group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-ice-blue/[0.05] border border-pearl/5 flex items-center justify-center text-titanium/60 shrink-0">
                    {sourceIcons[signal.source] || <Activity size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-pearl/80">
                        {signal.source}
                      </span>
                      <span className="text-[10px] text-titanium/40">•</span>
                      <span className="text-[10px] text-titanium/60">{signal.type}</span>
                      <span className="text-[10px] text-titanium/40 ml-auto">
                        {signal.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-titanium/70 leading-relaxed">
                      {signal.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-ice-blue/70">
                      {signal.confidence}%
                    </span>
                    <AlertTriangle size={10} className="text-amber/40" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
