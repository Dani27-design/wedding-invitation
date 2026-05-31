'use client';
import { ReactNode, memo } from 'react';
import { motion } from 'motion/react';
import { Heart, Instagram, Linkedin, LucideIcon, MessageCircle } from 'lucide-react';
import NextImage from 'next/image';
import { CREDIT_ICON_MAP } from '../../constants/creditIcons';
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveWhatsappUrl, deriveCopyright } from '../../utils/weddingDerived';
import { safeUrl } from '../../utils/safeUrl';

// Original Icons
const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

const ThreadsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.2 1.48-.69 2.61-1.469 3.36-.998.963-2.395 1.452-4.153 1.452-1.31 0-2.4-.342-3.237-1.018-.873-.704-1.354-1.726-1.354-2.879 0-1.27.567-2.335 1.596-2.996.856-.55 1.97-.856 3.226-.886.907-.023 1.728.064 2.454.26-.137-.716-.44-1.259-.906-1.617-.533-.41-1.32-.617-2.342-.617h-.071c-.77.009-1.483.195-2.06.538l-.977-1.737c.82-.489 1.822-.753 2.983-.771h.094c1.486 0 2.697.39 3.6 1.159.837.714 1.378 1.712 1.61 2.966.478.213.923.47 1.327.776 1.078.817 1.852 1.94 2.24 3.247.55 1.86.35 4.17-1.564 6.09C18.648 23.1 16.143 23.974 12.186 24zm-1.14-8.376c-.837.019-1.508.2-1.996.534-.528.36-.79.842-.79 1.439 0 .567.22 1.03.654 1.38.468.378 1.133.57 1.975.57 1.254 0 2.218-.334 2.865-.993.525-.535.842-1.315.96-2.339-.82-.248-1.72-.375-2.668-.375z"/></svg>
);

const SocialLink = ({ href, label, children }: { href: string; label: string; children: ReactNode }) => (
  <motion.a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, color: 'var(--color-gold)' }} className="text-ink">{children}</motion.a>
);

const ROLE_ICONS: Record<string, LucideIcon> = CREDIT_ICON_MAP;

const getIcon = (label: string) => {
  const norm = label.toLowerCase();
  if (norm.includes('instagram')) return Instagram;
  if (norm.includes('linkedin')) return Linkedin;
  if (norm.includes('whatsapp')) return WhatsAppIcon;
  if (norm.includes('threads')) return ThreadsIcon;
  return null;
};

export const Footer = memo(() => {
  const wedding = useWeddingContext();

  const creditSocials = wedding ? [
    (wedding.groomSocialLinks || []).map(l => ({ href: l.label === 'WhatsApp' ? deriveWhatsappUrl(l.url) : safeUrl(l.url), Icon: getIcon(l.label) || Heart, label: l.label })),
    (wedding.brideSocialLinks || []).map(l => ({ href: l.label === 'WhatsApp' ? deriveWhatsappUrl(l.url) : safeUrl(l.url), Icon: getIcon(l.label) || Heart, label: l.label })),
  ] : [];

  return (
  <footer className="relative py-[2vh] h-fit bg-ivory overflow-hidden">
    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
        <div className="mb-[2vh]">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Penutup</p>
          <p className="text-sm leading-relaxed text-ink/70 font-serif italic">Sebuah Cerita dari Perjalanan yang Kami Jalani dan Bangun Bersama, Dengan Keyakinan yang Sama</p>
        </div>

        <div className="grid grid-cols-2 gap-[1vh] mb-[2vh]">
          {wedding?.credits.map((credit, i) => {
            const RoleIcon = ROLE_ICONS[credit.role] ?? Heart;
            return (
              <div key={credit.name} className="p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] bg-paper/50 border border-gold/5 flex flex-col items-center justify-evenly">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gold/5 flex items-center justify-center mb-1 md:mb-2 text-gold/70"><RoleIcon className="w-4 h-4 md:w-5 md:h-5" /></div>
                <h3 className="font-serif italic text-lg text-ink mb-1 md:mb-2">{credit.name}</h3>
                <p className="font-serif text-xs text-ink/70 leading-relaxed mb-1 md:mb-2 max-w-[240px]">{credit.description}</p>
                <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
                  {creditSocials[i]?.map(({ href, Icon, label }, idx) => (
                    <SocialLink key={idx} href={href} label={label}><Icon className="w-4 h-4" /></SocialLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-center items-center mb-1"><Heart className="w-3 h-3 text-gold fill-gold" /></div>
          <p className="text-xs text-ink/60 tracking-widest font-serif italic">{wedding ? deriveCopyright(wedding.eventDate) : ''}</p>
        </div>

        {/* Vendor badge */}
        <a
          href="https://marinikah.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group cursor-pointer"
        >
          <NextImage src="/images/logo-2.png" alt="Marinikah" width={400} height={100} className="h-[100px] w-auto group-hover:scale-105 transition-all" />
          <span className="-mt-4 text-[9px] text-ink/30 tracking-[0.2em] uppercase group-hover:text-gold/60 transition-colors">Dibuat dengan Marinikah Invitation</span>
        </a>
      </motion.div>
    </div>
  </footer>
  );
});
