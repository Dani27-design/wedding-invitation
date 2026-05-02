import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { CountdownTimer } from '../ui/CountdownTimer';
import { WEDDING_DATE, VENUE } from '../../constants/wedding';

export const EventSection = () => (
  <section id="event-section" className="relative py-6 bg-ivory overflow-hidden">
    <div className="container mx-auto px-6 max-w-lg relative z-10">
      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="mb-6 w-full max-w-xs">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-black mb-4">Menuju Hari Bahagia</p>
          <CountdownTimer targetDate={WEDDING_DATE} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-ink italic tracking-tight">Sabtu, 29 Agustus 2026</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full mb-8">
          <div className="flex justify-center items-center gap-10 md:gap-16 border-y border-gold/10 py-5">
            <div className="flex flex-col">
              <span className="font-serif text-2xl italic text-ink mb-1">Akad Nikah</span>
              <span className="font-mono text-[10px] text-gold font-bold uppercase tracking-[0.2em]">09:00 — 10:00</span>
            </div>
            <div className="w-px h-8 bg-gold/20" />
            <div className="flex flex-col">
              <span className="font-serif text-2xl italic text-ink mb-1">Resepsi</span>
              <span className="font-mono text-[10px] text-gold font-bold uppercase tracking-[0.2em]">10:00 — 13:00</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gold/60" />
            <p className="font-serif italic text-xl text-ink/80">{VENUE.name}</p>
          </div>
          <p className="text-[12px] text-ink/50 font-light max-w-[280px] mx-auto leading-relaxed">{VENUE.address}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap justify-center gap-4">
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={VENUE.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2.5 px-6 bg-ink text-gold rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all shadow-md">
            <MapPin className="w-3 h-3" />
            <span>Lihat Peta</span>
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const event = { title: 'Pernikahan Dani & Marini', start: '20260829T090000', end: '20260829T130000', location: 'Gedung Wanita Candra Kencana, Surabaya' };
              window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=Pernikahan+kami&location=${encodeURIComponent(event.location)}&sf=true&output=xml`);
            }}
            className="inline-flex items-center gap-2 py-2.5 px-6 border border-ink/10 text-ink/60 rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all bg-white/50 backdrop-blur-sm"
          >
            <Calendar className="w-3 h-3" />
            <span>Ke Kalender</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  </section>
);
