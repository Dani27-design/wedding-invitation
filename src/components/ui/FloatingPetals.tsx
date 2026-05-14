'use client';
import { motion } from 'motion/react';

// Deterministic pseudo-random using golden ratio to avoid hydration mismatch
const seed = (i: number, offset: number = 0) => ((i + offset) * 0.618033988749895) % 1;

export const FloatingPetals = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          opacity: 0,
          x: seed(i, 1) * 100 + '%',
          y: -50,
          rotate: seed(i, 2) * 360,
          scale: 0.8 + seed(i, 3) * 1.2,
        }}
        animate={{
          opacity: [0, 0.3, 0.3, 0],
          y: '100vh',
          x: (seed(i, 4) * 100 - 30 + Math.sin(i) * 15) + '%',
          rotate: [0, 180, 360, 540],
          skewX: [0, 15, -15, 0],
        }}
        transition={{
          duration: 25 + seed(i, 5) * 15,
          repeat: Infinity,
          delay: seed(i, 6) * 15,
          ease: [0.45, 0, 0.55, 1],
        }}
        className="absolute"
      >
        <div className="w-4 h-6 bg-gold/5 rounded-[100%_10%_100%_10%] blur-[0.5px] shadow-sm transform-gpu" />
      </motion.div>
    ))}
  </div>
);
