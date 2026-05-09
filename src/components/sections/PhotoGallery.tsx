import { motion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';
import { useWeddingContext } from '../../context/WeddingContext';
import { getGalleryLayout } from '../../utils/galleryLayout';

interface PhotoGalleryProps {
  onSelectPhoto: (src: string) => void;
}

export const PhotoGallery = ({ onSelectPhoto }: PhotoGalleryProps) => {
  const wedding = useWeddingContext();
  const galleryItems = (wedding?.gallery ?? []).map((src, i) => ({ src, ...getGalleryLayout(i) }));

  if (galleryItems.length === 0) return null;

  return (
  <section className="relative py-[2vh] h-fit bg-paper overflow-hidden">
    <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-sepia/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-[3vh]">
        <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Jejak Cerita Kami</p>
        <p className="font-serif italic text-sm leading-relaxed text-ink/70 max-w-[300px] mx-auto">Beberapa momen yang kami simpan, dan kini ingin kami bagikan bersama Anda.</p>
      </motion.div>

      <div className="relative">
        <div className="absolute -right-8 top-0 bottom-0 w-12 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="py-5 grid grid-rows-[150px_150px] sm:grid-rows-[200px_200px] md:grid-rows-[280px_280px] grid-flow-col-dense gap-3 sm:gap-4 md:gap-6 auto-cols-[120px] sm:auto-cols-[150px] md:auto-cols-[210px]">
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPhoto(item.src); } }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: Math.min(i * 0.1, 0.3) }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => onSelectPhoto(item.src)}
                className={`${item.span} relative group overflow-hidden shadow-2xl ${item.shape} cursor-zoom-in isolate transform-gpu [-webkit-mask-image:-webkit-radial-gradient(white,black)] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`}
              >
                <img src={item.src} loading="lazy" decoding="async" sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, 210px" onError={(e) => { e.currentTarget.style.display = 'none'; }} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 [backface-visibility:hidden]" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <motion.div initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-[2vh] text-center">
        <p className="font-serif italic text-ink/70 text-sm">Setiap foto menyimpan cerita yang tidak selalu mudah, tapi selalu kami pilih untuk dilanjutkan.</p>
      </motion.div>
    </div>

    {/* Gradient Bridge to Footer */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-ivory pointer-events-none" />
  </section>
  );
};
