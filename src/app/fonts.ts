import { Cormorant_Garamond, Montserrat, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
});

export const dayland = localFont({
  src: '../../public/fonts/Dayland.woff2',
  weight: '400',
  variable: '--font-dayland',
  display: 'swap',
  fallback: ['cursive'],
});
