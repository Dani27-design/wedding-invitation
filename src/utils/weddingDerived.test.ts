import { describe, it, expect } from 'vitest';
import {
  deriveDateDisplay,
  deriveDateShort,
  deriveCalendarUrl,
  deriveTwibbonFilename,
  deriveWhatsappUrl,
  deriveCopyright,
  deriveMetaTitle,
} from './weddingDerived';
import { WeddingDocument } from '../types/firestore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockWedding(overrides: Partial<WeddingDocument> = {}): WeddingDocument {
  return {
    groomNickname: 'Dani',
    brideNickname: 'Marini',
    eventDate: '2026-08-29',
    eventCity: 'Surabaya',
    venueName: 'Gedung Wanita Candra Kencana',
    ceremonies: [
      { name: 'Akad Nikah', start: '09:00', end: '10:00' },
      { name: 'Resepsi', start: '10:00', end: '13:00' },
    ],
    theme: {
      template: 'cinematic',
      colors: { accent: '#B48D3E', background: '#FDFCF8', text: '#1A1A1A', surface: '#F5F2ED', button: '#F8BBD0' },
      fonts: { heading: 'Cormorant Garamond', body: 'Montserrat', decorative: 'Playfair Display', script: 'Dayland' },
    },
    ...overrides,
  } as WeddingDocument;
}

describe('utils/weddingDerived', () => {
  // ---------------------------------------------------------------------------
  // deriveDateDisplay
  // ---------------------------------------------------------------------------
  describe('deriveDateDisplay', () => {
    it('returns a non-empty string', () => {
      expect(deriveDateDisplay('2026-08-29').length).toBeGreaterThan(0);
    });

    it('includes the day number 29', () => {
      expect(deriveDateDisplay('2026-08-29')).toContain('29');
    });

    it('includes the year 2026', () => {
      expect(deriveDateDisplay('2026-08-29')).toContain('2026');
    });

    it('includes Indonesian month name Agustus', () => {
      expect(deriveDateDisplay('2026-08-29')).toContain('Agustus');
    });

    it('includes Indonesian weekday name Sabtu', () => {
      expect(deriveDateDisplay('2026-08-29')).toContain('Sabtu');
    });

    it('formats January correctly', () => {
      expect(deriveDateDisplay('2026-01-15')).toContain('Januari');
    });

    it('formats December correctly', () => {
      expect(deriveDateDisplay('2025-12-25')).toContain('Desember');
    });

    it('different dates produce different results', () => {
      expect(deriveDateDisplay('2026-01-01')).not.toBe(deriveDateDisplay('2026-08-29'));
    });

    it('result contains alphabetic characters', () => {
      expect(/[a-zA-Z]/.test(deriveDateDisplay('2026-08-29'))).toBe(true);
    });

    it('result is trimmed', () => {
      const result = deriveDateDisplay('2026-08-29');
      expect(result).toBe(result.trim());
    });
  });

  // ---------------------------------------------------------------------------
  // deriveDateShort
  // ---------------------------------------------------------------------------
  describe('deriveDateShort', () => {
    it('returns a non-empty string', () => {
      expect(deriveDateShort('2026-08-29').length).toBeGreaterThan(0);
    });

    it('includes the day number 29', () => {
      expect(deriveDateShort('2026-08-29')).toContain('29');
    });

    it('includes the year 2026', () => {
      expect(deriveDateShort('2026-08-29')).toContain('2026');
    });

    it('includes Agustus', () => {
      expect(deriveDateShort('2026-08-29')).toContain('Agustus');
    });

    it('does not include weekday name', () => {
      const result = deriveDateShort('2026-08-29');
      expect(result).not.toContain('Sabtu');
    });

    it('different months produce different results', () => {
      expect(deriveDateShort('2026-01-15')).not.toBe(deriveDateShort('2026-08-15'));
    });

    it('formats March correctly', () => {
      expect(deriveDateShort('2026-03-10')).toContain('Maret');
    });

    it('formats June correctly', () => {
      expect(deriveDateShort('2026-06-20')).toContain('Juni');
    });
  });

  // ---------------------------------------------------------------------------
  // deriveCalendarUrl
  // ---------------------------------------------------------------------------
  describe('deriveCalendarUrl', () => {
    it('returns a google calendar URL', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('google.com/calendar');
    });

    it('contains the event date 20260829', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('20260829');
    });

    it('contains start time T090000', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('T090000');
    });

    it('contains end time T130000', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('T130000');
    });

    it('contains groom nickname in title', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('Dani');
    });

    it('contains bride nickname in title', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('Marini');
    });

    it('contains venue name in location', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('Candra');
    });

    it('contains event city in location', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('Surabaya');
    });

    it('contains action=TEMPLATE', () => {
      const url = deriveCalendarUrl(createMockWedding());
      expect(url).toContain('action=TEMPLATE');
    });

    it('uses different times for different ceremonies', () => {
      const wedding = createMockWedding({
        ceremonies: [
          { name: 'Ceremony', start: '14:00', end: '16:00' },
        ],
      });
      const url = deriveCalendarUrl(wedding);
      expect(url).toContain('T140000');
      expect(url).toContain('T160000');
    });

    it('uses different date for different eventDate', () => {
      const wedding = createMockWedding({ eventDate: '2027-01-15' });
      const url = deriveCalendarUrl(wedding);
      expect(url).toContain('20270115');
    });
  });

  // ---------------------------------------------------------------------------
  // deriveTwibbonFilename
  // ---------------------------------------------------------------------------
  describe('deriveTwibbonFilename', () => {
    it('returns Memori-Dani-Marini.png', () => {
      expect(deriveTwibbonFilename('Dani', 'Marini')).toBe('Memori-Dani-Marini.png');
    });

    it('starts with Memori-', () => {
      expect(deriveTwibbonFilename('A', 'B')).toMatch(/^Memori-/);
    });

    it('ends with .png', () => {
      expect(deriveTwibbonFilename('A', 'B')).toMatch(/\.png$/);
    });

    it('includes groom name', () => {
      expect(deriveTwibbonFilename('TestGroom', 'Bride')).toContain('TestGroom');
    });

    it('includes bride name', () => {
      expect(deriveTwibbonFilename('Groom', 'TestBride')).toContain('TestBride');
    });

    it('different names produce different filenames', () => {
      expect(deriveTwibbonFilename('A', 'B')).not.toBe(deriveTwibbonFilename('C', 'D'));
    });

    it('handles empty strings', () => {
      expect(deriveTwibbonFilename('', '')).toBe('Memori--.png');
    });
  });

  // ---------------------------------------------------------------------------
  // deriveWhatsappUrl
  // ---------------------------------------------------------------------------
  describe('deriveWhatsappUrl', () => {
    it('returns wa.me URL', () => {
      expect(deriveWhatsappUrl('6281234567890')).toBe('https://wa.me/6281234567890');
    });

    it('starts with https://wa.me/', () => {
      expect(deriveWhatsappUrl('123')).toMatch(/^https:\/\/wa\.me\//);
    });

    it('includes the phone number', () => {
      expect(deriveWhatsappUrl('6285790428078')).toContain('6285790428078');
    });

    it('handles different numbers', () => {
      expect(deriveWhatsappUrl('111')).not.toBe(deriveWhatsappUrl('222'));
    });

    it('handles empty string', () => {
      expect(deriveWhatsappUrl('')).toBe('https://wa.me/');
    });
  });

  // ---------------------------------------------------------------------------
  // deriveCopyright
  // ---------------------------------------------------------------------------
  describe('deriveCopyright', () => {
    it('contains the year 2026', () => {
      expect(deriveCopyright('2026-08-29')).toContain('2026');
    });

    it('contains copyright symbol', () => {
      expect(deriveCopyright('2026-08-29')).toContain('\u00A9');
    });

    it('contains the fixed text', () => {
      expect(deriveCopyright('2026-08-29')).toContain('Kami membangunnya bersama');
    });

    it('uses different year for different dates', () => {
      expect(deriveCopyright('2025-01-01')).toContain('2025');
      expect(deriveCopyright('2027-06-15')).toContain('2027');
    });

    it('returns a non-empty string', () => {
      expect(deriveCopyright('2026-08-29').length).toBeGreaterThan(0);
    });

    it('result is trimmed', () => {
      const result = deriveCopyright('2026-08-29');
      expect(result).toBe(result.trim());
    });
  });

  // ---------------------------------------------------------------------------
  // deriveMetaTitle
  // ---------------------------------------------------------------------------
  describe('deriveMetaTitle', () => {
    it('returns correct format', () => {
      expect(deriveMetaTitle('Dani', 'Marini', '29 Agustus 2026')).toBe('Wedding Dani & Marini - 29 Agustus 2026');
    });

    it('starts with Wedding', () => {
      expect(deriveMetaTitle('A', 'B', 'date')).toMatch(/^Wedding /);
    });

    it('contains groom name', () => {
      expect(deriveMetaTitle('TestGroom', 'Bride', 'date')).toContain('TestGroom');
    });

    it('contains bride name', () => {
      expect(deriveMetaTitle('Groom', 'TestBride', 'date')).toContain('TestBride');
    });

    it('contains date string', () => {
      expect(deriveMetaTitle('A', 'B', '29 Agustus 2026')).toContain('29 Agustus 2026');
    });

    it('contains ampersand separator', () => {
      expect(deriveMetaTitle('A', 'B', 'date')).toContain('&');
    });

    it('contains dash separator', () => {
      expect(deriveMetaTitle('A', 'B', 'date')).toContain(' - ');
    });

    it('different inputs produce different results', () => {
      expect(deriveMetaTitle('A', 'B', 'x')).not.toBe(deriveMetaTitle('C', 'D', 'y'));
    });
  });
});
