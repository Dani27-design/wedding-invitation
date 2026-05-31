'use client';
import { memo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { CountdownTimer } from '../ui/CountdownTimer';
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveDateDisplay, deriveCalendarUrl } from '../../utils/weddingDerived';
import { safeUrl } from '../../utils/safeUrl';

export const EventSection = memo(() => {
  const wedding = useWeddingContext();
  const ceremonies = wedding?.ceremonies ?? [];
  const firstCeremony = ceremonies[0];

  return (
  <section id="event-section" className="relative py-[3vh] lg:py-20 bg-paper overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.3]">
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/3 -right-1/3 w-full h-full border border-gold/10 rounded-full" />
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }} transition={{ duration: 55, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/3 -left-1/3 w-full h-full border border-gold/10 rounded-full" />
    </div>

    {/* Mobile: centered single column */}
    <div className="lg:hidden container mx-auto px-6 max-w-lg relative z-10 flex flex-col items-center text-center gap-[3vh]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} className="max-w-[300px]">
          <p className="font-serif text-sm leading-relaxed text-gold mb-1" dir="rtl">{wedding?.quranArabic}</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 mt-1">"{wedding?.quranTranslation}"</p>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-1 font-medium">{wedding?.quranReference}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="w-full">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 max-w-[300px] mx-auto mb-[1vh]">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight mb-[1vh]">{wedding ? deriveDateDisplay(wedding.eventDate) : ''}</h2>
          <CountdownTimer targetDate={wedding ? `${wedding.eventDate}T${firstCeremony?.start ?? '09:00'}:00` : ''} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full flex flex-col items-center justify-center gap-[1.5vh]">
          {ceremonies.map((c, i) => (
            <div key={`${c.name}-${i}`} className="w-full space-y-[1vh]">
              <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-ivory border border-gold/15 rounded-2xl py-3 px-6 text-center cursor-default transition-all shadow-sm">
                <span className="font-serif text-xl italic text-ink mb-1 block">{c.name}</span>
                {c.date && c.date !== wedding?.eventDate && (
                  <p className="text-xs text-ink/60 mb-1">{deriveDateDisplay(c.date)}</p>
                )}
                <span className="font-display text-xs text-gold font-bold uppercase tracking-[0.15em]">{c.start} — {c.end}</span>
              </motion.div>
              {c.venueName && (
                <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-ivory border border-gold/15 rounded-2xl py-3 px-6 text-center cursor-default transition-all shadow-sm">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    <p className="font-serif italic text-sm text-ink">{c.venueName}</p>
                  </div>
                  {c.venueAddress && <p className="text-xs text-ink/60 font-light max-w-[280px] mx-auto leading-relaxed">{c.venueAddress}</p>}
                  {c.venueMapsUrl && (
                    <a href={safeUrl(c.venueMapsUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] text-gold font-bold uppercase tracking-widest hover:underline">
                      <MapPin className="w-3 h-3" /> Lihat Peta
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap justify-center gap-3">
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

    {/* Desktop: Left-Right Split */}
    <div className="hidden lg:block container mx-auto px-12 xl:px-20 max-w-5xl relative z-10">
      <div className="flex gap-12 xl:gap-16 items-center min-h-[60vh]">
        {/* Left: quote + date + countdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex-[1.2] text-left">
          <div className="max-w-md">
            <p className="font-serif text-base leading-relaxed text-gold mb-1" dir="rtl">{wedding?.quranArabic}</p>
            <p className="font-serif italic text-sm leading-relaxed text-ink/60 mt-2">"{wedding?.quranTranslation}"</p>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-2 font-medium">{wedding?.quranReference}</p>
          </div>

          <div className="w-16 h-px bg-gold/30 my-8" />

          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-sm leading-relaxed text-ink/60 mb-4">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl xl:text-4xl text-ink tracking-tight mb-6">{wedding ? deriveDateDisplay(wedding.eventDate) : ''}</h2>
          <CountdownTimer targetDate={wedding ? `${wedding.eventDate}T${firstCeremony?.start ?? '09:00'}:00` : ''} />
        </motion.div>

        {/* Right: ceremonies with per-event venues */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 max-w-[420px] flex flex-col gap-4">
          {ceremonies.map((c, i) => (
            <div key={`${c.name}-${i}`} className="space-y-3">
              <motion.div whileHover={{ y: -4 }} className="bg-ivory border border-gold/15 rounded-2xl py-7 px-8 text-center cursor-default transition-all shadow-sm">
                <span className="font-serif text-2xl italic text-ink block mb-2">{c.name}</span>
                {c.date && c.date !== wedding?.eventDate && (
                  <p className="text-sm text-ink/60 mb-2">{deriveDateDisplay(c.date)}</p>
                )}
                <div className="w-8 h-px bg-gold/30 mx-auto mb-2" />
                <span className="font-display text-sm text-gold font-bold uppercase tracking-[0.15em]">{c.start} — {c.end}</span>
              </motion.div>
              {c.venueName && (
                <motion.div whileHover={{ y: -4 }} className="bg-ivory border border-gold/15 rounded-2xl py-5 px-8 text-center cursor-default transition-all shadow-sm">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <p className="font-serif italic text-lg text-ink">{c.venueName}</p>
                  </div>
                  {c.venueAddress && (
                    <>
                      <div className="w-8 h-px bg-gold/30 mx-auto mb-2" />
                      <p className="text-sm text-ink/60 font-light leading-relaxed">{c.venueAddress}</p>
                    </>
                  )}
                  {c.venueMapsUrl && (
                    <a href={safeUrl(c.venueMapsUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-gold font-bold uppercase tracking-widest hover:underline">
                      <MapPin className="w-3 h-3" /> Lihat Peta
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Calendar button centered below */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="flex justify-center gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { if (wedding) window.open(deriveCalendarUrl(wedding), '_blank', 'noopener,noreferrer'); }}
          className="inline-flex items-center gap-2 py-3 px-8 border border-ink/10 text-ink rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all bg-white/70"
        >
          <Calendar className="w-3 h-3" />
          <span>Ke Kalender</span>
        </motion.button>
      </motion.div>
    </div>

    {/* Gradient Bridge to Twibbon Section */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-ivory pointer-events-none" />
  </section>
  );
});
