'use client';
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

// Deterministic seed for sparkle positions (avoids hydration mismatch)
const seed = (i: number, offset: number = 0) => ((i + offset) * 0.618033988749895) % 1;

const Sparkle = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1.2, 0],
      y: [0, -30 - seed(index, 3) * 40, -60 - seed(index, 4) * 50, -90],
      x: [(seed(index, 5) - 0.5) * 20, (seed(index, 6) - 0.5) * 60],
    }}
    transition={{
      duration: 2 + seed(index, 7) * 1.5,
      repeat: Infinity,
      delay: seed(index, 8) * 3,
      ease: 'easeOut',
    }}
    className="absolute pointer-events-none"
    style={{ left: `${seed(index, 1) * 100}%`, top: `${30 + seed(index, 2) * 40}%` }}
  >
    <div className={`rounded-full ${index % 3 === 0 ? 'w-1.5 h-1.5 bg-gold/60' : index % 3 === 1 ? 'w-1 h-1 bg-rose-pastel/50' : 'w-2 h-2 bg-gold/30'}`} />
  </motion.div>
);

export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const timeLeft = useCountdown(targetDate);
  const isPast = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && targetDate && !isNaN(new Date(targetDate).getTime()) && new Date(targetDate).getTime() < Date.now();

  return (
    <div className="w-full max-w-xl mx-auto px-4 relative">
      {isPast && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => <Sparkle key={i} index={i} />)}
        </div>
      )}
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
