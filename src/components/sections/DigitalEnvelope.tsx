'use client';
import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import { useWeddingContext } from '../../context/WeddingContext';

interface DigitalEnvelopeProps {
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const DigitalEnvelope = memo(({ copiedIndex, onCopy }: DigitalEnvelopeProps) => {
  const wedding = useWeddingContext();
  const giftAccounts = wedding?.giftAccounts ?? [];

  if (giftAccounts.length === 0) return null;

  return (
  <section id="gift-section" className="relative py-[3vh] lg:py-20 h-fit bg-ivory overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/4 -left-1/4 w-full h-full border border-gold/5 rounded-full" />
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/4 -right-1/4 w-full h-full border border-gold/5 rounded-full" />
    </div>

    {/* Mobile */}
    <div className="lg:hidden container mx-auto px-6 max-w-lg relative z-10">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Tanda Kasih</p>
        <p className="font-serif italic text-sm leading-relaxed text-ink/70 max-w-[300px] mx-auto mb-[3vh]">
          Kehadiran dan Doa Anda adalah hadiah terindah bagi kami. Namun jika berkenan memberi tanda kasih, kami menerimanya dengan penuh rasa terima kasih.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {giftAccounts.map((gift, i) => (
            <motion.div key={i} role="button" tabIndex={0} aria-label={`Salin nomor ${gift.bank} ${gift.account}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCopy(gift.account, i); } }} whileHover={{ y: -3, scale: 1.01 }} onClick={() => onCopy(gift.account, i)} className="bg-white/60 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/60 flex flex-col items-center gap-1 group cursor-pointer shadow-sm shadow-gold/5 transition-all relative overflow-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
              
              {/* Top-Right Action Button */}
              <div className="absolute top-2 right-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${copiedIndex === i ? 'bg-green-500 text-white' : 'bg-gold/5 text-gold/60 group-hover:bg-gold group-hover:text-white border border-gold/10'}`}>
                  {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </div>
              </div>

              <div className="relative z-10 w-full flex flex-col items-center text-center">
                <p className="text-[10px] uppercase tracking-widest text-gold/70 font-bold mb-1">{gift.bank}</p>
                <div className="flex flex-col items-center gap-1 mb-1">
                  <span className="font-serif text-lg md:text-xl tracking-tight text-ink group-hover:text-gold transition-colors leading-none">{gift.account}</span>
                </div>
                <div className="pt-0.5 border-t border-gold/5 w-full">
                  <p className="text-[10px] text-ink/60 tracking-tight font-serif truncate">{gift.owner}</p>
                </div>
              </div>

              <AnimatePresence>
                {copiedIndex === i && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center mb-1 shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-serif italic text-[10px] text-ink">Tersalin</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Desktop: Left-Right Split */}
    <div className="hidden lg:block container mx-auto px-12 xl:px-20 max-w-5xl relative z-10">
      <div className="flex gap-12 xl:gap-16 items-start">
        {/* Left: title + description */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-[280px] xl:w-[320px] flex-shrink-0 sticky top-[20vh] text-left">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-3">Tanda Kasih</p>
          <p className="font-serif italic text-sm leading-relaxed text-ink/70">
            Kehadiran dan Doa Anda adalah hadiah terindah bagi kami. Namun jika berkenan memberi tanda kasih, kami menerimanya dengan penuh rasa terima kasih.
          </p>
        </motion.div>

        {/* Right: gift cards */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            {giftAccounts.map((gift, i) => (
              <motion.div key={i} role="button" tabIndex={0} aria-label={`Salin nomor ${gift.bank} ${gift.account}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCopy(gift.account, i); } }} whileHover={{ y: -3, scale: 1.01 }} onClick={() => onCopy(gift.account, i)} className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 flex flex-col items-center gap-1 group cursor-pointer shadow-sm shadow-gold/5 transition-all relative overflow-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute top-2 right-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${copiedIndex === i ? 'bg-green-500 text-white' : 'bg-gold/5 text-gold/60 group-hover:bg-gold group-hover:text-white border border-gold/10'}`}>
                    {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </div>
                </div>
                <div className="relative z-10 w-full flex flex-col items-center text-center">
                  <p className="text-[10px] uppercase tracking-widest text-gold/70 font-bold mb-1">{gift.bank}</p>
                  <span className="font-serif text-xl tracking-tight text-ink group-hover:text-gold transition-colors leading-none mb-1">{gift.account}</span>
                  <div className="pt-0.5 border-t border-gold/5 w-full">
                    <p className="text-[10px] text-ink/60 tracking-tight font-serif truncate">{gift.owner}</p>
                  </div>
                </div>
                <AnimatePresence>
                  {copiedIndex === i && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center mb-1 shadow-md">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-serif italic text-[10px] text-ink">Tersalin</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

    {/* Gradient Bridge to Gallery Section */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-paper pointer-events-none" />
  </section>
  );
});
