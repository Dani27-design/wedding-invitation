'use client';
import { motion } from 'motion/react';

// Deterministic pseudo-random using golden ratio to avoid hydration mismatch
const seed = (i: number, offset: number = 0) => ((i + offset) * 0.618033988749895) % 1;

export const PetalEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: -20, x: `${seed(i, 1) * 100}vw`, rotate: 0 }}
        animate={{
          opacity: [0, 0.3, 0],
          y: '100vh',
          x: [`${seed(i, 2) * 100}vw`, `${(seed(i, 3) - 0.5) * 50 + 50}vw`],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 18 + seed(i, 4) * 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 1.5,
        }}
        className="absolute w-1.5 h-1.5 bg-rose-pastel/15 rounded-full blur-[0.5px]"
      />
    ))}
  </div>
);
