'use client';

import { motion } from 'framer-motion';
import AgentPanel from './AgentPanel';
import { agents } from '@/constants/mockData';
import { fadeInUp, staggerContainer } from '@/animations/motionVariants';

export default function WarRoom() {
  return (
    <section id="war-room" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-graphite/20 to-obsidian" />

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
            <span>Command Center</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-light text-pearl"
          >
            War Room
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-titanium/60 max-w-xl mx-auto text-sm sm:text-base"
          >
            Four specialized AI agents working in concert to detect, strategize,
            execute, and command — orchestrated by the Hyperion Core.
          </motion.p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.06),transparent_70%)]" />
              <div className="absolute inset-8 rounded-full border border-ice-blue/10" />
              <div className="absolute inset-16 rounded-full border border-ice-blue/5" />
              <div className="absolute inset-[30%] rounded-full bg-ice-blue/10 blur-sm" />
              <div className="absolute inset-[45%] rounded-full bg-ice-blue/20" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-ice-blue/20 to-transparent" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-t from-ice-blue/20 to-transparent" />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 h-px w-12 bg-gradient-to-r from-ice-blue/20 to-transparent" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-px w-12 bg-gradient-to-l from-ice-blue/20 to-transparent" />
              </motion.div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {agents.map((agent, index) => (
              <AgentPanel key={agent.id} agent={agent} index={index} />
            ))}
          </div>

          <div className="lg:hidden mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-titanium/50">
              <span className="w-1 h-1 rounded-full bg-ice-blue/40" />
              Tap any agent to expand
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
