import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { CountdownTimer } from '../ui/CountdownTimer';
import { WEDDING_DATE, WEDDING_DATE_DISPLAY, VENUE } from '../../constants/wedding';

export const EventSection = () => (
  <section id="event-section" className="relative py-[3vh] h-[100dvh] bg-paper overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.3]">
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/3 -right-1/3 w-full h-full border border-gold/10 rounded-full" />
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }} transition={{ duration: 55, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/3 -left-1/3 w-full h-full border border-gold/10 rounded-full" />
    </div>

    <div className="container mx-auto px-6 max-w-lg relative z-10 h-full flex flex-col items-center text-center justify-evenly">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} className="max-w-[300px]">
          <p className="font-serif text-sm leading-relaxed text-gold mb-1" dir="rtl">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 mt-1">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."</p>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mt-1 font-medium">QS. Ar-Rum: 21</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="w-full">
          <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-1">Dengan Segenap Cinta</p>
          <p className="font-serif italic text-xs leading-relaxed text-ink/60 max-w-[300px] mx-auto mb-[1vh]">Kami menanti kehadiran Anda di hari istimewa kami.</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight mb-[1vh]">{WEDDING_DATE_DISPLAY}</h2>
          <CountdownTimer targetDate={WEDDING_DATE} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full flex flex-col items-center justify-center gap-[1vh]">
          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-white/60 border border-gold/15 rounded-[3rem_1rem_3rem_1rem] py-3 px-6 text-center cursor-default transition-all shadow-sm">
            <span className="font-serif text-xl italic text-ink mb-1 block">Akad Nikah</span>
            <span className="font-display text-xs text-gold font-bold uppercase tracking-[0.15em]">09:00 — 10:00</span>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-white/60 border border-gold/15 rounded-[1rem_3rem_1rem_3rem] py-3 px-6 text-center cursor-default transition-all shadow-sm">
            <span className="font-serif text-xl italic text-ink mb-1 block">Resepsi</span>
            <span className="font-display text-xs text-gold font-bold uppercase tracking-[0.15em]">10:00 — 13:00</span>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="w-full bg-white/60 border border-gold/15 rounded-[2rem_3rem_3rem_2rem] py-3 px-6 text-center cursor-default transition-all shadow-sm">
            <div className="flex justify-center items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <p className="font-serif italic text-sm text-ink">{VENUE.name}</p>
            </div>
            <p className="text-xs text-ink/60 font-light max-w-[280px] mx-auto leading-relaxed">{VENUE.address}</p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap justify-center gap-3">
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={VENUE.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 px-5 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all shadow-md">
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
            className="inline-flex items-center gap-2 py-2 px-5 border border-ink/10 text-ink rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all bg-white/50 backdrop-blur-sm"
          >
            <Calendar className="w-3 h-3" />
            <span>Ke Kalender</span>
          </motion.button>
        </motion.div>
    </div>
  </section>
);
