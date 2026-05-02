import { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X } from 'lucide-react';

interface RSVPModalProps {
  isOpen: boolean;
  isSubmitSuccess: boolean;
  guestName: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const RSVPModal = ({ isOpen, isSubmitSuccess, guestName, onClose, onSubmit }: RSVPModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-ivory p-6 md:p-6 rounded-[2.5rem] border border-gold/20 shadow-2xl"
        >
          <div className="absolute -top-10 -right-10 pointer-events-none opacity-[0.03]">
            <Heart className="w-48 h-48 text-gold" fill="currentColor" />
          </div>

          <div className="relative z-10">
            {isSubmitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <Heart className="w-12 h-12 text-gold fill-gold/20 mb-4" />
                </motion.div>
                <h3 className="font-serif italic text-2xl text-ink mb-2">Terima Kasih Atas Doa Anda</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-bold max-w-[260px]">Setiap kata yang Anda sampaikan akan kami simpan dalam hati</p>
              </motion.div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h4 className="font-serif italic text-xl text-ink">Setiap doa yang Anda titipkan akan kami simpan sebagai bagian dari perjalanan ini</h4>
                  </div>
                  <button
                    aria-label="Tutup"
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gold/5 rounded-full transition-colors text-ink/40 hover:text-gold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="relative group">
                    <label htmlFor="rsvp-name" className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1 block">Nama</label>
                    <input
                      id="rsvp-name" name="name" required type="text" maxLength={50} placeholder={guestName}
                      className="w-full bg-transparent border-b border-gold/20 py-2 outline-none focus:border-gold transition-all font-serif italic text-lg text-ink placeholder:text-ink/30"
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1.5 block">Konfirmasi Kehadiran</label>
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="attendance" value="yes" defaultChecked className="hidden peer" />
                        <div className="w-full py-2.5 text-center border border-gold/20 rounded-xl peer-checked:border-gold peer-checked:bg-gold/5 transition-all text-ink/60 peer-checked:text-gold uppercase text-[8px] font-black tracking-widest leading-none">
                          Hadir
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="attendance" value="no" className="hidden peer" />
                        <div className="w-full py-2.5 text-center border border-gold/20 rounded-xl peer-checked:border-gold peer-checked:bg-gold/5 transition-all text-ink/60 peer-checked:text-gold uppercase text-[8px] font-black tracking-widest leading-none">
                          Berhalangan
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="relative group">
                    <label htmlFor="rsvp-message" className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1 block">Ucapan & Doa</label>
                    <textarea
                      id="rsvp-message" name="message" required rows={3} maxLength={200} placeholder="Tinggalkan doa Anda, dan biarkan ia menjadi bagian dari cerita kami..."
                      className="w-full bg-transparent border-b border-gold/20 py-2 outline-none focus:border-gold transition-all resize-none font-serif italic text-base text-ink placeholder:text-ink/30"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: '#1A1A1A', color: '#D4AF37' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-ink text-gold rounded-full text-[10px] tracking-[0.35em] font-black uppercase transition-all duration-500 shadow-xl mt-2"
                  >
                    Kirim
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
