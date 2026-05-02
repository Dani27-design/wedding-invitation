import { motion } from 'motion/react';

export const FloatingPetals = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          opacity: 0,
          x: Math.random() * 100 + '%',
          y: -50,
          rotate: Math.random() * 360,
          scale: 0.8 + Math.random() * 1.2,
        }}
        animate={{
          opacity: [0, 0.3, 0.3, 0],
          y: '100vh',
          x: (Math.random() * 100 - 30 + Math.sin(i) * 15) + '%',
          rotate: [0, 180, 360, 540],
          skewX: [0, 15, -15, 0],
        }}
        transition={{
          duration: 25 + Math.random() * 15,
          repeat: Infinity,
          delay: Math.random() * 15,
          ease: [0.45, 0, 0.55, 1],
        }}
        className="absolute"
      >
        <div className="w-4 h-6 bg-gold/5 rounded-[100%_10%_100%_10%] blur-[0.5px] shadow-sm transform-gpu" />
      </motion.div>
    ))}
  </div>
);
