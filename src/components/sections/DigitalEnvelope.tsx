import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { BANK_ACCOUNTS } from '../../constants/wedding';

interface DigitalEnvelopeProps {
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const DigitalEnvelope = ({ copiedIndex, onCopy }: DigitalEnvelopeProps) => (
  <section id="gift-section" className="relative py-[2vh] h-fit bg-ivory overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/4 -left-1/4 w-full h-full border border-gold/5 rounded-full" />
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/4 -right-1/4 w-full h-full border border-gold/5 rounded-full" />
    </div>

    <div className="container mx-auto px-6 max-w-4xl relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-[3vh]">
        <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Tanda Kasih</p>
        <p className="font-serif italic text-sm leading-relaxed text-ink/70 max-w-[300px] mx-auto mb-[3vh]">
          Kehadiran dan Doa Anda adalah hadiah terindah bagi kami. Namun jika berkenan memberi tanda kasih, kami menerimanya dengan penuh rasa terima kasih.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 max-w-5xl mx-auto">
          {BANK_ACCOUNTS.map((gift, i) => (
            <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }} onClick={() => onCopy(gift.account, i)} className="bg-white/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/60 flex flex-col items-center gap-1 group cursor-pointer shadow-sm transition-all relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 w-full flex flex-col items-center text-center">
                <p className="text-xs uppercase tracking-widest text-gold/70 font-bold mb-1">{gift.bank}</p>
                <div className="flex flex-col items-center gap-1.5 mb-1">
                  <span className="font-serif text-lg md:text-xl tracking-tight text-ink group-hover:text-gold transition-colors leading-none">{gift.account}</span>
                  <div className={`px-2 py-0.5 rounded-full text-xs tracking-tighter font-serif transition-all ${copiedIndex === i ? 'bg-green-500 text-white shadow-sm' : 'bg-gold/5 text-gold/70 group-hover:bg-gold group-hover:text-white'}`}>
                    {copiedIndex === i ? 'Tersalin' : 'Salin'}
                  </div>
                </div>
                <div className="pt-0.5 border-t border-gold/5 w-full">
                  <p className="text-xs text-ink/50 tracking-tight font-serif truncate">{gift.owner}</p>
                </div>
              </div>
              <AnimatePresence>
                {copiedIndex === i && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-1 shadow-md">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-serif italic text-xs text-ink">Tersalin</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);
