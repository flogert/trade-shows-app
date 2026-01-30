'use client';

import { motion } from 'framer-motion';

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
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'tween', duration: 0.25, ease: 'easeOut' },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
