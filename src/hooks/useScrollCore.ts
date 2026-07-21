'use client';

import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ScrollCoreValues {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollYProgress: MotionValue<number>;
  coreY: MotionValue<number>;
  coreScale: MotionValue<number>;
  coreOpacity: MotionValue<number>;
  coreRotateX: MotionValue<number>;
  coreRotateY: MotionValue<number>;
}

export function useScrollCore(): ScrollCoreValues {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const coreY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const coreScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.85, 0.7]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.3]);
  const coreRotateX = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const coreRotateY = useTransform(scrollYProgress, [0, 1], [0, -10]);

  return {
    containerRef,
    scrollYProgress,
    coreY,
    coreScale,
    coreOpacity,
    coreRotateX,
    coreRotateY,
  };
}
