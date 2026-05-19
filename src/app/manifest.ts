import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marinikah - Undangan Pernikahan Digital',
    short_name: 'Marinikah',
    description: 'Undangan pernikahan digital yang elegan dan berkesan',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFCF8',
    theme_color: '#1A1A1A',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
