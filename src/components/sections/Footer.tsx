import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Heart, Code, Palette, Instagram, Linkedin } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

const ThreadsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.2 1.48-.69 2.61-1.469 3.36-.998.963-2.395 1.452-4.153 1.452-1.31 0-2.4-.342-3.237-1.018-.873-.704-1.354-1.726-1.354-2.879 0-1.27.567-2.335 1.596-2.996.856-.55 1.97-.856 3.226-.886.907-.023 1.728.064 2.454.26-.137-.716-.44-1.259-.906-1.617-.533-.41-1.32-.617-2.342-.617h-.071c-.77.009-1.483.195-2.06.538l-.977-1.737c.82-.489 1.822-.753 2.983-.771h.094c1.486 0 2.697.39 3.6 1.159.837.714 1.378 1.712 1.61 2.966.478.213.923.47 1.327.776 1.078.817 1.852 1.94 2.24 3.247.55 1.86.35 4.17-1.564 6.09C18.648 23.1 16.143 23.974 12.186 24zm-1.14-8.376c-.837.019-1.508.2-1.996.534-.528.36-.79.842-.79 1.439 0 .567.22 1.03.654 1.38.468.378 1.133.57 1.975.57 1.254 0 2.218-.334 2.865-.993.525-.535.842-1.315.96-2.339-.82-.248-1.72-.375-2.668-.375z"/></svg>
);

const SocialLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <motion.a href={href} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, color: '#B48D3E' }} className="text-ink">{children}</motion.a>
);

export const Footer = () => (
  <footer className="relative py-[5vh] h-[100dvh] bg-ivory overflow-hidden border-t border-gold/10">
    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
        <div className="mb-[2vh]">
          <h4 className="font-dayland text-4xl sm:text-5xl md:text-6xl text-ink mb-1 md:mb-2">Dani & Marini</h4>
          <p className="text-[11px] md:text-[12px] tracking-[0.2em] text-gold font-serif italic">Sebuah Cerita dari Perjalanan yang Kami Jalani dan Bangun Bersama, Dengan Keyakinan yang Sama</p>
        </div>

        <div className="grid grid-cols-2 gap-[1vh] mb-[2vh]">
          <div className="p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] bg-paper/50 border border-gold/5 flex flex-col items-center">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gold/5 flex items-center justify-center mb-1 md:mb-2 text-gold/60"><Code className="w-4 h-4 md:w-5 md:h-5" /></div>
            <h5 className="font-serif italic text-base md:text-xl text-ink mb-1 md:mb-2">M. Daniansyah C.</h5>
            <p className="text-[10px] md:text-xs text-ink/50 leading-relaxed mb-1 md:mb-2 max-w-[240px]">Menulis setiap baris code di balik halaman ini, merangkainya satu per satu sampai akhirnya bisa bercerita tentang kami.</p>
            <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
              <SocialLink href="https://instagram.com/danichusyaidin"><Instagram className="w-4 h-4" /></SocialLink>
              <SocialLink href="https://id.linkedin.com/in/daniansyahchusyaidin"><Linkedin className="w-4 h-4" /></SocialLink>
              <SocialLink href="https://wa.me/6285790428078"><WhatsAppIcon /></SocialLink>
            </div>
          </div>

          <div className="p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] bg-paper/50 border border-gold/5 flex flex-col items-center">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gold/5 flex items-center justify-center mb-1 md:mb-2 text-gold/60"><Palette className="w-4 h-4 md:w-5 md:h-5" /></div>
            <h5 className="font-serif italic text-base md:text-xl text-ink mb-1 md:mb-2">Siti Nur Marini</h5>
            <p className="text-[10px] md:text-xs text-ink/50 leading-relaxed mb-1 md:mb-2 max-w-[240px]">Menjadikan setiap bagian tidak hanya terlihat indah, tapi juga hingga semuanya benar-benar seperti kami.</p>
            <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
              <SocialLink href="https://instagram.com/mariniw_"><Instagram className="w-4 h-4" /></SocialLink>
              <SocialLink href="https://threads.com/@mariniw_"><ThreadsIcon /></SocialLink>
              <SocialLink href="https://wa.me/628883816403"><WhatsAppIcon /></SocialLink>
            </div>
          </div>
        </div>

        <div className="pt-1 border-t border-gold/5 mb-[2vh]">
          <div className="flex justify-center items-center gap-2 mb-2"><Heart className="w-3 h-3 text-gold fill-gold" /></div>
          <p className="text-[8px] text-ink/20 tracking-widest uppercase">&copy; 2026. Kami membangunnya bersama, dari perjalanan kami.</p>
        </div>
      </motion.div>
    </div>
  </footer>
);
