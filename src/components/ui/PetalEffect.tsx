import { motion } from 'motion/react';

export const PetalEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: -20, x: `${Math.random() * 100}vw`, rotate: 0 }}
        animate={{
          opacity: [0, 0.3, 0],
          y: '100vh',
          x: [`${Math.random() * 100}vw`, `${(Math.random() - 0.5) * 50 + 50}vw`],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 18 + Math.random() * 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 1.5,
        }}
        className="absolute w-1.5 h-1.5 bg-rose-pastel/15 rounded-full blur-[0.5px]"
      />
    ))}
  </div>
);
