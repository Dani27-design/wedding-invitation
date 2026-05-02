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
       
        <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Ucapan & Doa</p>
        <p className="font-serif italic text-[13px] leading-relaxed text-ink/70 max-w-[300px] mx-auto">Di antara {wishes.length} doa yang kami terima di sini, setiap satunya akan kami bawa sebagai bagian dari langkah kami ke depan.</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={onOpenRSVP}
        className="absolute right-6 top-[7vh] z-20 w-11 h-11 bg-gradient-to-br from-gold via-gold/80 to-gold text-white rounded-full transition-all duration-500 flex items-center justify-center shadow-[0_8px_30px_rgba(212,175,55,0.35)] group border border-white/20"
        title="Kirim Doa"
        aria-label="Kirim Doa"
      >
        <MessageSquare className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full flex flex-col flex-1 min-h-0">

        <div className="flex min-h-0 h-fit">
          {wishes.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl bg-gold/5 px-6 text-center">
              <Heart className="w-4 h-4 text-gold/30 mb-3 animate-pulse" />
              <p className="font-serif italic text-[13px] text-ink/70 leading-relaxed">Ruang ini masih menunggu cerita pertama.</p>
              <p className="font-serif italic text-xs text-ink/50 mt-1">Jika berkenan, tinggalkan doa untuk kami.</p>
            </div>
          ) : (
            <div className="w-full h-fit">
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-2.5 content-start">
                <AnimatePresence mode="popLayout">
                  {currentWishes.map((wish, idx) => (
                    <motion.div key={wish.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, delay: idx * 0.02 }} className="w-full bg-white/60 p-3 rounded-2xl border border-gold/10 border-l-2 border-l-gold/30 relative group hover:border-gold/20 transition-all shadow-sm">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className="text-ink font-bold uppercase text-xs tracking-tight truncate max-w-[130px] sm:max-w-[160px]">{wish.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-black uppercase tracking-tighter shrink-0 ${wish.attendance === 'yes' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-ink/5 text-ink/50 border-ink/10'}`}>
                            {wish.attendance === 'yes' ? 'Hadir' : 'Berhalangan'}
                          </span>
                        </div>
                        <span className="text-xs text-ink/50 font-bold uppercase tracking-tighter shrink-0">{formatDate(wish.createdAt)}</span>
                      </div>
                      <p className="font-serif italic text-xs leading-[1.3] text-ink/70 line-clamp-2">"{wish.message}"</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="h-fit flex flex-col items-center shrink-0 border-t border-gold/10 py-[1.5vh] mt-[1vh]">
            <div className="flex items-center gap-4 mb-1">
              <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }} whileTap={{ scale: 0.9 }} aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow">
                <ArrowRight className="w-3 h-3 rotate-180" />
              </motion.button>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gold/70">Bab {currentPage} dari {totalPages}</span>
              </div>
              <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }} whileTap={{ scale: 0.9 }} aria-label="Halaman selanjutnya" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow">
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
            <p className="font-serif italic text-xs text-ink/50">Rangkaian Doa yang Kami Simpan</p>
          </div>
        )}
      </motion.div>
    </div>
  </section>
);
