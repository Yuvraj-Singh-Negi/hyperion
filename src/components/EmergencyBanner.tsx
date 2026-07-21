'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Anomaly } from '@/types';

interface EmergencyBannerProps {
  anomalies: Anomaly[];
  onDismiss?: () => void;
}

export default function EmergencyBanner({ anomalies, onDismiss }: EmergencyBannerProps) {
  const [visible, setVisible] = useState(true);

  const hasCritical = anomalies.some((a) => a.severity === 'critical' || a.severity === 'high');

  const dismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (!hasCritical || !visible) return null;

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
  const highCount = anomalies.filter((a) => a.severity === 'high').length;
  const criticalRegions = [...new Set(anomalies.filter((a) => a.severity === 'critical' || a.severity === 'high').map((a) => a.region))].slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-[60]"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-crimson/90 via-crimson/80 to-crimson/90 backdrop-blur-xl border-b border-crimson/30">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <AlertTriangle size={20} className="text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-wide">
                  EMERGENCY ALERT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-mono tracking-wider">
                  {criticalCount} CRITICAL · {highCount} HIGH
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {criticalCount > 0 && `${criticalCount} critical threat${criticalCount > 1 ? 's' : ''} detected`}
                {criticalCount > 0 && highCount > 0 && ' · '}
                {highCount > 0 && `${highCount} high-severity threat${highCount > 1 ? 's' : ''}`}
                {criticalRegions.length > 0 && ` · Affected: ${criticalRegions.join(', ')}`}
              </p>
            </div>
            <button
              onClick={dismiss}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
