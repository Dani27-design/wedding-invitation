'use client';
import { memo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { CountdownTimer } from '../ui/CountdownTimer';
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveDateDisplay, deriveCalendarUrl } from '../../utils/weddingDerived';
import { safeUrl } from '../../utils/safeUrl';

const BLOB_SHAPES = [
  ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
  ["50% 50% 30% 70% / 60% 40% 50% 50%", "40% 60% 60% 40% / 50% 50% 40% 60%", "50% 50% 30% 70% / 60% 40% 50% 50%"],
  ["60% 40% 50% 50% / 40% 60% 50% 50%", "45% 55% 65% 35% / 55% 45% 50% 50%", "60% 40% 50% 50% / 40% 60% 50% 50%"],
];

const RING_SHAPES = [
  'rounded-[45%_55%_65%_35%]',
  'rounded-[55%_45%_35%_65%]',
  'rounded-[50%_50%_40%_60%]',
];

function BlobCard({ blobIndex, ringIndex, children, className = '' }: { blobIndex: number; ringIndex: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ borderRadius: BLOB_SHAPES[blobIndex % BLOB_SHAPES.length] }}
        transition={{ duration: 12 + blobIndex * 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-ivory border border-gold/15 shadow-lg shadow-gold/10"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

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

    {/* Mobile */}
    <div className="lg:hidden container mx-auto px-6 max-w-lg relative z-10 flex flex-col items-center text-center gap-[3vh]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} className="max-w-[300px]">
          <p className="font-serif text-sm leading-relaxed text-gold mb-1 break-words" dir="rtl">{wedding?.quranArabic}</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 mt-1 break-words">"{wedding?.quranTranslation}"</p>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-1 font-medium">{wedding?.quranReference}</p>
        </motion.div>

        {/* Countdown */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="w-full text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 max-w-[300px] mx-auto mb-[1vh]">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink tracking-tight mb-[1vh]">{wedding ? deriveDateDisplay(wedding.eventDate) : ''}</h2>
          <CountdownTimer targetDate={wedding ? `${wedding.eventDate}T${firstCeremony?.start ?? '09:00'}:00` : ''} />
          <button
            onClick={() => { if (wedding) window.open(deriveCalendarUrl(wedding), '_blank', 'noopener,noreferrer'); }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gold text-ivory rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30 hover:scale-[1.02] transition-all"
          >
            <Calendar className="w-3 h-3" />
            Lihat Kalender
          </button>
        </motion.div>

        {/* Unified ceremony cards (event + venue in one card) */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full flex flex-col items-center justify-center gap-[2vh]">
          {ceremonies.map((c, i) => (
            <BlobCard key={`${c.name}-${i}`} blobIndex={i + 1} ringIndex={i + 1} className="w-full">
              <div className="py-5 px-6 text-center">
                <span className="font-serif text-xl italic text-ink block mb-1 break-words">{c.name}</span>
                {c.date && c.date !== wedding?.eventDate && (
                  <p className="text-xs text-ink/60 mb-1">{deriveDateDisplay(c.date)}</p>
                )}
                <span className="font-display text-base text-gold font-bold uppercase tracking-[0.15em]">{c.start} — {c.end}</span>

                {c.venueName && (
                  <>
                    <div className="flex justify-center items-center gap-2 mt-3 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      <p className="font-serif italic text-sm text-ink break-words">{c.venueName}</p>
                    </div>
                    {c.venueAddress && <p className="text-xs text-ink/60 font-light max-w-[280px] mx-auto leading-relaxed">{c.venueAddress}</p>}
                    {c.venueMapsUrl && (
                      <a href={safeUrl(c.venueMapsUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gold text-ivory rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30 hover:scale-[1.02] transition-all">
                        <MapPin className="w-3 h-3" />
                        Lihat Maps
                      </a>
                    )}
                  </>
                )}
              </div>
            </BlobCard>
          ))}
        </motion.div>
    </div>

    {/* Desktop */}
    <div className="hidden lg:block container mx-auto px-12 xl:px-20 max-w-5xl relative z-10">
      <div className="flex gap-12 xl:gap-16 items-center min-h-[60vh]">
        {/* Left: quote + countdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex-[1.2] text-left">
          <div className="max-w-md">
            <p className="font-serif text-base leading-relaxed text-gold mb-1 break-words" dir="rtl">{wedding?.quranArabic}</p>
            <p className="font-serif italic text-sm leading-relaxed text-ink/60 mt-2">"{wedding?.quranTranslation}"</p>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-2 font-medium">{wedding?.quranReference}</p>
          </div>

          <div className="w-16 h-px bg-gold/30 my-8" />

          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-sm leading-relaxed text-ink/60 mb-4">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl xl:text-4xl text-ink tracking-tight mb-6">{wedding ? deriveDateDisplay(wedding.eventDate) : ''}</h2>
          <CountdownTimer targetDate={wedding ? `${wedding.eventDate}T${firstCeremony?.start ?? '09:00'}:00` : ''} />
          <button
            onClick={() => { if (wedding) window.open(deriveCalendarUrl(wedding), '_blank', 'noopener,noreferrer'); }}
            className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-2 bg-gold text-ivory rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30 hover:scale-[1.02] transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            Lihat Kalender
          </button>
        </motion.div>

        {/* Right: unified ceremony cards */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 max-w-[420px] flex flex-col gap-6">
          {ceremonies.map((c, i) => (
            <BlobCard key={`${c.name}-${i}`} blobIndex={i + 1} ringIndex={i + 1}>
              <div className="py-7 px-8 text-center">
                <span className="font-serif text-2xl italic text-ink block mb-2 break-words">{c.name}</span>
                {c.date && c.date !== wedding?.eventDate && (
                  <p className="text-sm text-ink/60 mb-2">{deriveDateDisplay(c.date)}</p>
                )}
                <span className="font-display text-lg text-gold font-bold uppercase tracking-[0.15em]">{c.start} — {c.end}</span>

                {c.venueName && (
                  <>
                    <div className="flex justify-center items-center gap-2 mt-4 mb-2">
                      <MapPin className="w-4 h-4 text-gold" />
                      <p className="font-serif italic text-lg text-ink break-words">{c.venueName}</p>
                    </div>
                    {c.venueAddress && (
                      <p className="text-sm text-ink/60 font-light leading-relaxed break-words">{c.venueAddress}</p>
                    )}
                    {c.venueMapsUrl && (
                      <a href={safeUrl(c.venueMapsUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 bg-gold text-ivory rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30 hover:scale-[1.02] transition-all">
                        <MapPin className="w-3.5 h-3.5" />
                        Lihat Maps
                      </a>
                    )}
                  </>
                )}
              </div>
            </BlobCard>
          ))}
        </motion.div>
      </div>
    </div>

    {/* Gradient Bridge */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-ivory pointer-events-none" />
  </section>
  );
});
