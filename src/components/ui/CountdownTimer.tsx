import { motion, AnimatePresence } from 'motion/react';
import { useCountdown } from '../../hooks/useCountdown';

const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <motion.div
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    className="flex flex-col items-center flex-1 min-w-0"
  >
    <div className="relative group">
      <div className="absolute inset-0 bg-gold/10 blur-xl rounded-full scale-150 animate-pulse opacity-50 -z-10" />
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 1.1 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className="font-display text-3xl md:text-5xl text-ink/90 block font-light leading-none tracking-tighter"
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="font-serif italic text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-gold/80 font-bold mt-2">
      {label}
    </span>
  </motion.div>
);

export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const timeLeft = useCountdown(targetDate);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="flex justify-center items-center gap-1 md:gap-14 py-2 md:py-6 w-full relative z-30"
      >
        <TimeBox value={timeLeft.days} label="Hari" />
        <TimeBox value={timeLeft.hours} label="Jam" />
        <TimeBox value={timeLeft.minutes} label="Menit" />
        <TimeBox value={timeLeft.seconds} label="Detik" />
      </motion.div>
    </div>
  );
};
