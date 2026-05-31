'use client';
import { memo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";
import { GuestWishes } from "../../types";
import { formatDate } from "../../utils/formatDate";

interface RSVPSectionProps {
  wishes: GuestWishes[];
  currentWishes: GuestWishes[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (fn: (p: number) => number) => void;
  onOpenRSVP: () => void;
  isWishesLoading?: boolean;
}

export const RSVPSection = memo(({
  wishes,
  currentWishes,
  currentPage,
  totalPages,
  setCurrentPage,
  onOpenRSVP,
  isWishesLoading = false,
}: RSVPSectionProps) => (
  <section
    id="rsvp-section"
    className="relative py-[3vh] lg:py-20 h-fit bg-paper overflow-hidden"
  >
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,var(--color-gold)_3%,transparent)_0%,_transparent_70%)]" />
    </div>

    {/* Mobile */}
    <div className="lg:hidden container h-full mx-auto px-6 max-w-lg relative z-10 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-[3vh] w-full shrink-0"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
          Ucapan & Doa
        </p>
        <p className="font-serif italic text-[13px] leading-relaxed text-ink/70 max-w-[300px] mx-auto">
          Di antara {wishes.length} doa yang kami terima di sini, setiap satunya
          akan kami bawa sebagai bagian dari langkah kami ke depan.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="w-full flex flex-col flex-1 min-h-0 relative"
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenRSVP}
          className="absolute right-0 -top-8.5 z-20 w-11 h-11 bg-gradient-to-br from-gold via-gold/80 to-gold text-white rounded-full transition-all duration-500 flex items-center justify-center shadow-[0_8px_30px_color-mix(in_srgb,var(--color-gold)_35%,transparent)] group border border-white/20"
          title="Kirim Doa"
          aria-label="Kirim Doa"
        >
          <MessageSquare className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
        </motion.button>

        <div className="flex min-h-0 h-fit">
          {wishes.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl bg-gold/5 px-6 text-center">
              <Heart className="w-4 h-4 text-gold/30 mb-3 animate-pulse" />
              {isWishesLoading ? (
                <p className="font-serif italic text-[13px] text-ink/40 leading-relaxed">
                  Memuat ucapan...
                </p>
              ) : (
                <>
                  <p className="font-serif italic text-[13px] text-ink/70 leading-relaxed">
                    Ruang ini masih menunggu cerita pertama.
                  </p>
                  <p className="font-serif italic text-xs text-ink/60 mt-1">
                    Jika berkenan, tinggalkan doa untuk kami.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-fit">
              <div className="h-full grid grid-cols-1 gap-1 md:grid-cols-2 content-start">
                <AnimatePresence mode="popLayout">
                  {currentWishes.map((wish, idx) => (
                    <motion.div
                      key={wish.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      className="w-full bg-white/60 px-3 py-1 rounded-xl border border-gold/10 border-l-2 border-l-gold/30 relative group hover:border-gold/20 transition-all shadow-sm shadow-gold/5"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className="text-ink font-serif text-xs truncate max-w-[130px] sm:max-w-[160px]">
                            {wish.name}
                          </p>
                          <span
                            className={`text-xs px-1 py-0.3 rounded-full border font-serif italic shrink-0 ${wish.attendance === "yes" ? "bg-gold/10 text-gold border-gold/20" : "bg-ink/5 text-ink/60 border-ink/10"}`}
                          >
                            {wish.attendance === "yes"
                              ? "Hadir"
                              : "Berhalangan"}
                          </span>
                        </div>
                        <span className="text-xs text-ink/60 font-serif shrink-0">
                          {formatDate(wish.createdAt)}
                        </span>
                      </div>
                      <p className="font-serif italic text-sm leading-[1.3] text-ink/70 line-clamp-2">
                        "{wish.message}"
                      </p>
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Halaman sebelumnya"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow hover:bg-gold/5"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
              </motion.button>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gold/70">
                  Bab {currentPage} dari {totalPages}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Halaman selanjutnya"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow hover:bg-gold/5"
              >
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
            <p className="font-serif italic text-xs text-ink/60">
              Rangkaian Doa yang Kami Simpan
            </p>
          </div>
        )}
      </motion.div>
    </div>

    {/* Desktop: Left-Right Split */}
    <div className="hidden lg:block container mx-auto px-12 xl:px-20 max-w-5xl relative z-10">
      <div className="flex gap-12 xl:gap-16 items-start">
        {/* Left: title + description + send button */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-[280px] xl:w-[320px] flex-shrink-0 sticky top-[20vh] text-left">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-3">
            Ucapan & Doa
          </p>
          <p className="font-serif italic text-sm leading-relaxed text-ink/70 mb-6">
            Di antara {wishes.length} doa yang kami terima di sini, setiap satunya
            akan kami bawa sebagai bagian dari langkah kami ke depan.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenRSVP}
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-br from-gold via-gold/80 to-gold text-white rounded-full text-xs uppercase tracking-[0.3em] font-black transition-all shadow-[0_8px_30px_color-mix(in_srgb,var(--color-gold)_35%,transparent)] border border-white/20"
            aria-label="Kirim Doa"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim Doa</span>
          </motion.button>
        </motion.div>

        {/* Right: wish cards */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1">
          {wishes.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl bg-gold/5 px-6 text-center">
              <Heart className="w-4 h-4 text-gold/30 mb-3 animate-pulse" />
              {isWishesLoading ? (
                <p className="font-serif italic text-[13px] text-ink/40 leading-relaxed">Memuat ucapan...</p>
              ) : (
                <>
                  <p className="font-serif italic text-[13px] text-ink/70 leading-relaxed">Ruang ini masih menunggu cerita pertama.</p>
                  <p className="font-serif italic text-xs text-ink/60 mt-1">Jika berkenan, tinggalkan doa untuk kami.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 content-start">
              <AnimatePresence mode="popLayout">
                {currentWishes.map((wish, idx) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                    className="w-full bg-white/60 px-3 py-1 rounded-xl border border-gold/10 border-l-2 border-l-gold/30 relative group hover:border-gold/20 transition-all shadow-sm shadow-gold/5"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <p className="text-ink font-serif text-xs truncate max-w-[130px] sm:max-w-[160px]">{wish.name}</p>
                        <span className={`text-xs px-1 py-0.3 rounded-full border font-serif italic shrink-0 ${wish.attendance === "yes" ? "bg-gold/10 text-gold border-gold/20" : "bg-ink/5 text-ink/60 border-ink/10"}`}>
                          {wish.attendance === "yes" ? "Hadir" : "Berhalangan"}
                        </span>
                      </div>
                      <span className="text-xs text-ink/60 font-serif shrink-0">{formatDate(wish.createdAt)}</span>
                    </div>
                    <p className="font-serif italic text-sm leading-[1.3] text-ink/70 line-clamp-2">"{wish.message}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col items-center border-t border-gold/10 py-4 mt-4">
              <div className="flex items-center gap-4 mb-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow hover:bg-gold/5">
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </motion.button>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gold/70">Bab {currentPage} dari {totalPages}</span>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Halaman selanjutnya" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/20 text-gold disabled:opacity-10 transition-all bubble-glow hover:bg-gold/5">
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>
              <p className="font-serif italic text-xs text-ink/60">Rangkaian Doa yang Kami Simpan</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>

    {/* Gradient Bridge to Gift Section */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-ivory pointer-events-none" />
  </section>
));
