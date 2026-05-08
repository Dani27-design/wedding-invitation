import { WeddingTheme } from '../types/firestore';

export const THEME_DEFAULTS: Record<string, WeddingTheme> = {
  cinematic: {
    template: 'cinematic',
    colors: {
      accent: '#B48D3E',
      background: '#FDFCF8',
      text: '#1A1A1A',
      surface: '#F5F2ED',
      button: '#F8BBD0',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Montserrat',
      decorative: 'Playfair Display',
      script: 'Dayland',
    },
  },
};
