'use client';

import { motion } from 'framer-motion';

interface ScanningLineProps {
  speed?: number;
  className?: string;
}

export default function ScanningLine({ speed = 4, className }: ScanningLineProps) {
  return (
    <div className={className} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #64d2ff 50%, transparent 100%)',
          boxShadow: '0 0 6px 2px rgba(100,210,255,0.15), 0 0 12px 4px rgba(100,210,255,0.08)',
        }}
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
