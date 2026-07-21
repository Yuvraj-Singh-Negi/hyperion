'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FloatingCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0.5);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  const springY = useSpring(y, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouseX(e.clientX / window.innerWidth);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const coreX = (mouseX - 0.5) * 20;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 right-0 w-full h-full pointer-events-none z-10"
    >
      <motion.div
        className="absolute top-1/3 right-[12%]"
        style={{ y: springY, scale, opacity, rotateX, rotateY, x: coreX }}
      >
        <div className="relative">
          <motion.div
            className="w-32 h-32 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(100,210,255,0.15),transparent_70%)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-ice-blue/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ice-blue/40" />
          </motion.div>
          <motion.div
            className="absolute inset-4 rounded-full border border-ice-blue/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-ice-blue/30" />
            <div className="absolute bottom-1/4 left-0 w-1 h-1 rounded-full bg-ice-blue/20" />
          </motion.div>
          <div className="absolute inset-[30%] rounded-full bg-ice-blue/10 blur-sm" />
          <div className="absolute inset-[40%] rounded-full bg-ice-blue/20" />
          <motion.div
            className="absolute -inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(100,210,255,0.06) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
