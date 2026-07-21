'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import Image from 'next/image';
import { metrics } from '@/constants/mockData';
import { fadeInUp, staggerContainer } from '@/animations/motionVariants';
import { formatNumber } from '@/lib/utils';

function WaveformBars() {
  const [bars] = useState(() => {
    const cache = new Map<number, { height: number; opacity: number; delay: number }>();
    for (let i = 0; i < 40; i++) {
      cache.set(i, {
        height: Math.random() * 24 + 4,
        opacity: Math.random() * 0.3 + 0.1,
        delay: Math.random(),
      });
    }
    return cache;
  });

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 40 }).map((_, i) => {
        const bar = bars.get(i)!;
        return (
          <motion.div
            key={i}
            className="w-0.5 rounded-full"
            style={{
              height: `${bar.height + 4}px`,
              background: `rgba(100, 210, 255, ${bar.opacity})`,
            }}
            animate={{ height: [`${bar.height + 4}px`, `${bar.height + 8}px`, `${bar.height + 4}px`] }}
            transition={{
              duration: 1 + bar.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85"
          alt="Earth from orbit"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/40 to-obsidian" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 w-full">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-8">
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-ice-blue uppercase">
                <Shield size={12} />
                <span>Autonomous Threat Detection Platform</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
                <span className="text-pearl/80">Preparing Enterprises</span>
                <br />
                <span className="text-gradient">For The Next</span>
                <br />
                <span className="text-pearl">Black Swan.</span>
              </h1>

              <p className="text-base sm:text-lg text-titanium/80 max-w-xl leading-relaxed">
                Hyperion orchestrates autonomous AI agents that detect, analyze,
                simulate and neutralize enterprise crises before humans finish
                the first meeting.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <a
                href="#war-room"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all duration-300 text-sm tracking-wide"
              >
                Launch War Room
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#agents"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-pearl/10 text-titanium hover:text-pearl hover:border-pearl/20 transition-all duration-300 text-sm tracking-wide"
              >
                Explore Architecture
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4"
            >
              {metrics.slice(0, 4).map((metric) => (
                <div key={metric.id} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-light text-pearl">
                    {formatNumber(metric.value)}
                    <span className="text-xs text-titanium ml-0.5">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-titanium/60 tracking-wider">
                    {metric.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="hidden lg:flex justify-center"
          >
            <div className="glass-panel rounded-3xl p-6 w-full max-w-md relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider text-titanium uppercase">
                    Global Status
                  </span>
                  <span className="text-xs text-emerald flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    Live Feed
                  </span>
                </div>

                {[
                  { label: 'Global Risk Index', value: '47.3%', color: 'text-amber' },
                  { label: 'Cyber Threat Level', value: 'Elevated', color: 'text-amber' },
                  { label: 'Active Events', value: '12', color: 'text-ice-blue' },
                  { label: 'Agents Online', value: '4/4', color: 'text-emerald' },
                  { label: 'Response Latency', value: '0.4ms', color: 'text-emerald' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-pearl/5 last:border-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                  >
                    <span className="text-xs text-titanium">{item.label}</span>
                    <span className={`text-xs font-mono ${item.color}`}>{item.value}</span>
                  </motion.div>
                ))}

                <div className="pt-2">
                  <div className="h-20 rounded-lg bg-ice-blue/[0.02] border border-pearl/5 flex items-center justify-center">
                    <WaveformBars />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
