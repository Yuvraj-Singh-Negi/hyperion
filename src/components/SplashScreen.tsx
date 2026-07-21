'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

interface Particle {
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function Particles() {
  const [particles] = useState<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
      });
    }
    return arr;
  });

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px rounded-full bg-ice-blue/20"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'initial' | 'pulse' | 'symbol' | 'expand' | 'complete'>('initial');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pulse'), 400);
    const t2 = setTimeout(() => setPhase('symbol'), 900);
    const t3 = setTimeout(() => setPhase('expand'), 1800);
    const t4 = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
        >
          {phase === 'initial' && (
            <motion.div
              className="w-1 h-1 rounded-full bg-ice-blue"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          {phase === 'pulse' && (
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute w-12 h-12 rounded-full border border-ice-blue/30"
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div className="w-2 h-2 rounded-full bg-ice-blue shadow-glow-blue" />
            </motion.div>
          )}

          {(phase === 'symbol' || phase === 'expand') && (
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="text-ice-blue"
              >
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M32 12 L32 52 M16 24 L48 24 M16 40 L48 40 M20 16 L44 48 M44 16 L20 48"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="10"
                  fill="currentColor"
                  fillOpacity="0.1"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="4"
                  fill="currentColor"
                  fillOpacity="0.3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: 'easeOut' }}
                />
              </svg>

              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="text-sm font-medium tracking-[0.3em] text-pearl/60 uppercase">
                  Hyperion
                </span>
                <span className="text-[10px] tracking-[0.2em] text-titanium/40 uppercase">
                  Autonomous War Room
                </span>
              </motion.div>
            </motion.div>
          )}

          {(phase === 'expand') && (
            <>
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,210,255,0.03)_0%,_transparent_60%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <Particles />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
