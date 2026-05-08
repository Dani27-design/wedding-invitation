import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { CountdownTimer } from '../ui/CountdownTimer';
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveDateDisplay, deriveCalendarUrl } from '../../utils/weddingDerived';

const CEREMONY_SHAPES = [
  'rounded-[3rem_1rem_3rem_1rem]',
  'rounded-[1rem_3rem_1rem_3rem]',
];

export const EventSection = () => {
  const wedding = useWeddingContext();

  return (
  <section id="event-section" className="relative py-[3vh] bg-paper overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.3]">
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/3 -right-1/3 w-full h-full border border-gold/10 rounded-full" />
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }} transition={{ duration: 55, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/3 -left-1/3 w-full h-full border border-gold/10 rounded-full" />
    </div>

    <div className="container mx-auto px-6 max-w-lg relative z-10 flex flex-col items-center text-center gap-[3vh]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} className="max-w-[300px]">
          <p className="font-serif text-sm leading-relaxed text-gold mb-1" dir="rtl">{wedding?.quranArabic}</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 mt-1">"{wedding?.quranTranslation}"</p>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-1 font-medium">{wedding?.quranReference}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="w-full">
          <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 max-w-[300px] mx-auto mb-[1vh]">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight mb-[1vh]">{wedding ? deriveDateDisplay(wedding.eventDate) : ''}</h2>
          <CountdownTimer targetDate={wedding ? `${wedding.eventDate}T${wedding.ceremonies[0]?.start ?? '09:00'}:00` : ''} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full flex flex-col items-center justify-center gap-[1vh]">
          {wedding?.ceremonies.map((c, i) => (
            <motion.div key={c.name} whileHover={{ y: -3, scale: 1.01 }} className={`w-full bg-white/60 border border-gold/15 ${CEREMONY_SHAPES[i % CEREMONY_SHAPES.length]} py-3 px-6 text-center cursor-default transition-all shadow-sm`}>
              <span className="font-serif text-xl italic text-ink mb-1 block">{c.name}</span>
              <span className="font-display text-xs text-gold font-bold uppercase tracking-[0.15em]">{c.start} — {c.end}</span>
            </motion.div>
          ))}
          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-white/60 border border-gold/15 rounded-[2rem_3rem_3rem_2rem] py-3 px-6 text-center cursor-default transition-all shadow-sm">
            <div className="flex justify-center items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <p className="font-serif italic text-sm text-ink">{wedding?.venueName}</p>
            </div>
            <p className="text-xs text-ink/60 font-light max-w-[280px] mx-auto leading-relaxed">{wedding?.venueAddress}</p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap justify-center gap-3">
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={wedding?.venueMapsUrl ?? ''} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 px-5 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all shadow-md">
            <MapPin className="w-3 h-3" />
            <span>Lihat Peta</span>
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { if (wedding) window.open(deriveCalendarUrl(wedding), '_blank', 'noopener,noreferrer'); }}
            className="inline-flex items-center gap-2 py-2 px-5 border border-ink/10 text-ink rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all bg-white/70 backdrop-blur-sm"
          >
            <Calendar className="w-3 h-3" />
            <span>Ke Kalender</span>
          </motion.button>
        </motion.div>
    </div>
  </section>
  );
};
