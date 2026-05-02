import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { GuestWishes } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface RSVPSectionProps {
  wishes: GuestWishes[];
  currentWishes: GuestWishes[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (fn: (p: number) => number) => void;
  onOpenRSVP: () => void;
}

export const RSVPSection = ({ wishes, currentWishes, currentPage, totalPages, setCurrentPage, onOpenRSVP }: RSVPSectionProps) => (
  <section id="rsvp-section" className="relative py-[2vh] h-fit bg-paper overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/5 rounded-full blur-[120px]" />
    </div>

    <div className="container h-full mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-[3vh] w-full shrink-0">
        <div className="flex justify-center items-center gap-4 mb-3">
          <div className="h-px w-8 bg-gold/30" />
          <MessageSquare className="w-5 h-5 text-gold/60" />
          <div className="h-px w-8 bg-gold/30" />
        </div>
        <p className="font-serif text-[15px] italic tracking-[0.4em] text-gold uppercase">RSVP & Wishes</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full flex flex-col flex-1 min-h-0 relative">
        <div className="absolute -top-12 -right-3 z-20">
          <motion.button whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} onClick={onOpenRSVP} className="w-14 h-14 bg-gradient-to-br from-gold via-gold/80 to-gold text-white rounded-full transition-all duration-500 flex items-center justify-center shadow-[0_10px_40px_rgba(212,175,55,0.3)] group border border-white/20" title="Kirim Doa" aria-label="Kirim Doa">
            <MessageSquare className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
          </motion.button>
        </div>

        <div className="flex min-h-0 h-fit">
          {wishes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl bg-gold/5 px-6 text-center">
              <Heart className="w-4 h-4 text-gold/30 mb-2 animate-pulse" />
              <p className="text-[9px] opacity-40 italic font-serif tracking-widest uppercase">Belum ada doa.</p>
            </div>
          ) : (
            <div className="w-full h-fit">
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-2.5 content-start">
                <AnimatePresence mode="popLayout">
                  {currentWishes.map((wish, idx) => (
                    <motion.div key={wish.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, delay: idx * 0.02 }} className="w-full bg-white/60 p-3 rounded-2xl border border-gold/10 border-l-2 border-l-gold/30 relative group hover:border-gold/20 transition-all shadow-sm">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className="text-ink font-bold uppercase text-[9px] tracking-tight truncate max-w-[130px] sm:max-w-[160px]">{wish.name}</p>
                          <span className={`text-[7px] px-1.5 py-0.5 rounded-full border font-black uppercase tracking-tighter shrink-0 ${wish.attendance === 'yes' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-ink/5 text-ink/30 border-ink/10'}`}>
                            {wish.attendance === 'yes' ? 'Hadir' : 'Absen'}
                          </span>
                        </div>
                        <span className="text-[7px] text-ink/30 font-bold uppercase tracking-tighter shrink-0">{formatDate(wish.createdAt)}</span>
                      </div>
                      <p className="font-serif italic text-[12px] leading-[1.3] text-ink/60 line-clamp-2">"{wish.message}"</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="h-fit flex justify-center items-center gap-4 shrink-0 border-t border-gold/10 py-[1.5vh] mt-[1vh]">
            <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }} whileTap={{ scale: 0.9 }} aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow">
              <ArrowRight className="w-3 h-3 rotate-180" />
            </motion.button>
            <div className="text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/80">{currentPage} / {totalPages}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }} whileTap={{ scale: 0.9 }} aria-label="Halaman selanjutnya" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow">
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  </section>
);
