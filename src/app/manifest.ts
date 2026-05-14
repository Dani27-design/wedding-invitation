import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Undangan Pernikahan',
    short_name: 'Undangan',
    description: 'Undangan Pernikahan Digital',
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
