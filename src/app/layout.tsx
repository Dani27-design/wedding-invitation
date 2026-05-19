import type { Metadata, Viewport } from 'next';
import { cormorantGaramond, montserrat, playfairDisplay, dayland } from './fonts';
import { Providers } from './providers';
import { BASE_URL } from '@/constants/baseUrl';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marinikah - Undangan Pernikahan Digital',
  description: 'Undangan pernikahan digital yang elegan dan berkesan',
  metadataBase: new URL(BASE_URL),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1A1A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${cormorantGaramond.variable} ${montserrat.variable} ${playfairDisplay.variable} ${dayland.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
