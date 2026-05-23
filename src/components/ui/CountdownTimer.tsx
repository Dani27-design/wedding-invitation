'use client';
import { motion } from 'motion/react';
import { useCountdown } from '../../hooks/useCountdown';

const SHAPES = [
  'rounded-[2.5rem_1rem_2.5rem_1rem]',
  'rounded-[1rem_2.5rem_1rem_2.5rem]',
  'rounded-[2rem_1.5rem_2rem_1.5rem]',
  'rounded-[1.5rem_2rem_1.5rem_2rem]',
];

const TimeBox = ({ value, label, index }: { value: number; label: string; index: number }) => (
  <div className="flex flex-col items-center flex-1 min-w-0">
    <div className={`relative bg-ivory border border-gold/10 ${SHAPES[index % SHAPES.length]} w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-sm`}>
      <span className="font-display text-3xl md:text-5xl text-gold-contrast block font-light leading-none tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="font-serif italic text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase text-gold/70 font-bold mt-2">
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
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="flex justify-center items-center gap-1 md:gap-14 py-2 md:py-6 w-full relative z-30"
      >
        <TimeBox value={timeLeft.days} label="Hari" index={0} />
        <TimeBox value={timeLeft.hours} label="Jam" index={1} />
        <TimeBox value={timeLeft.minutes} label="Menit" index={2} />
        <TimeBox value={timeLeft.seconds} label="Detik" index={3} />
      </motion.div>
    </div>
  );
};
