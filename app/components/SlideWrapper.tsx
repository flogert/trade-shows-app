'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface SlideWrapperProps {
  children: React.ReactNode;
  direction?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

export default function SlideWrapper({ children, direction = 1 }: SlideWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: prefersReducedMotion ? { duration: 0 } : { type: 'tween', duration: 0.25, ease: 'easeOut' },
        opacity: { duration: prefersReducedMotion ? 0.01 : 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
