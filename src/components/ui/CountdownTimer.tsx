import { motion } from 'motion/react';
import { useCountdown } from '../../hooks/useCountdown';

const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center flex-1 min-w-0">
    <div className="relative">
      <div className="absolute inset-0 bg-gold/10 rounded-full scale-150 opacity-30 -z-10" />
      <span className="font-display text-3xl md:text-5xl text-ink block font-light leading-none tracking-tighter">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="font-serif italic text-xs md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase text-gold/70 font-bold mt-2">
      {label}
    </span>
  </div>
);

export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const timeLeft = useCountdown(targetDate);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{ opacity: { duration: 1.5 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
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
