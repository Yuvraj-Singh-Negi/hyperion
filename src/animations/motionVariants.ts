import { Variants, Transition } from 'framer-motion';

export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const smoothSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: smoothSpring },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: smoothSpring },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: smoothSpring },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: gentleSpring },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const glassReveal: Variants = {
  hidden: { opacity: 0, y: 30, backdropFilter: 'blur(0px)' },
  visible: {
    opacity: 1,
    y: 0,
    backdropFilter: 'blur(20px)',
    transition: { duration: 1, ease: [0.25, 0.1, 0, 1] },
  },
};

export const pulseGlow = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};
