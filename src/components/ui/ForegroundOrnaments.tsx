'use client';
import { motion } from 'motion/react';

export const ForegroundOrnaments = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      animate={{ y: [0, -15, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -bottom-20 -left-20 w-80 h-80 bg-ink/10 blur-[60px] rounded-full"
    />
    <motion.div
      animate={{ y: [0, 20, 0], rotate: [1, -1, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-20 -right-20 w-96 h-96 bg-gold/5 blur-[80px] rounded-full"
    />
  </div>
);
