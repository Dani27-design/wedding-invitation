import { motion } from 'motion/react';

export const LightGlow = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
    <motion.div
      animate={{
        opacity: [0.05, 0.15, 0.05],
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0],
        x: ['-5%', '5%', '-5%'],
        y: ['-5%', '5%', '-5%'],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gold/10 blur-[180px] rounded-full pointer-events-none mix-blend-soft-light"
    />
  </div>
);
