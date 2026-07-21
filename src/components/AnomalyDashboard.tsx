'use client';

import { motion } from 'framer-motion';
import { alerts } from '@/constants/mockData';
import { fadeInUp, staggerContainer } from '@/animations/motionVariants';
import {
  AlertTriangle,
  Cloud,
  TrendingUp,
  Zap,
  Truck,
  Map,
  ChevronRight,
} from 'lucide-react';

const alertIcons: Record<string, React.ReactNode> = {
  cyber: <Shield size={14} />,
  weather: <Cloud size={14} />,
  financial: <TrendingUp size={14} />,
  infrastructure: <Zap size={14} />,
  supply_chain: <Truck size={14} />,
  geopolitical: <Map size={14} />,
};

import { Shield } from 'lucide-react';

const severityColors: Record<string, string> = {
  low: 'text-titanium border-titanium/20 bg-titanium/5',
  moderate: 'text-amber border-amber/20 bg-amber/5',
  high: 'text-crimson border-crimson/20 bg-crimson/5',
  critical: 'text-crimson border-crimson/30 bg-crimson/10',
};

export default function AnomalyDashboard() {
  return (
    <section id="dashboard" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-graphite/15 to-obsidian" />

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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-amber uppercase"
          >
            <AlertTriangle size={12} />
            <span>Anomaly Detection</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-light text-pearl"
          >
            Threat Dashboard
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-titanium/60 max-w-xl mx-auto text-sm sm:text-base"
          >
            Real-time classification and prioritization of global anomalies
            detected by the Scout agent network.
          </motion.p>
        </motion.div>

        <motion.div
          className="glass-panel rounded-3xl overflow-hidden max-w-5xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="px-6 py-4 border-b border-pearl/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-wider text-titanium uppercase">
                Active Anomalies
              </span>
              <span className="text-[10px] font-mono text-crimson bg-crimson/10 px-2 py-0.5 rounded-full">
                {alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length} critical
              </span>
            </div>
            <span className="text-[10px] text-titanium/40">{alerts.length} events</span>
          </div>

          <div className="divide-y divide-pearl/[0.03]">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                className="px-6 py-4 hover:bg-pearl/[0.02] transition-colors group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.severity === 'critical' || alert.severity === 'high'
                        ? 'bg-crimson/10 text-crimson'
                        : alert.severity === 'moderate'
                        ? 'bg-amber/10 text-amber'
                        : 'bg-titanium/10 text-titanium'
                    }`}
                  >
                    {alertIcons[alert.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-pearl/90">
                        {alert.title}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                          severityColors[alert.severity]
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-titanium/60 leading-relaxed mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-titanium/40">
                      <span>{alert.region}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                      <span>•</span>
                      <span className={alert.trend === 'up' ? 'text-crimson/60' : 'text-emerald/60'}>
                        {alert.value}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-titanium/20 group-hover:text-titanium/50 transition-colors shrink-0 mt-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
