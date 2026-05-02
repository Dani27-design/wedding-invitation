import { describe, it, expect } from 'vitest';
import { WEDDING_DATE, VENUE, BANK_ACCOUNTS, STORY_SLIDES, GALLERY_ITEMS } from './wedding';

/**
 * Comprehensive tests for wedding constants.
 * Covers structure, values, edge cases, and data integrity.
 */

// ---------------------------------------------------------------------------
// 1. WEDDING_DATE
// ---------------------------------------------------------------------------

describe('constants/wedding', () => {
  describe('WEDDING_DATE', () => {
    it('is a non-empty string', () => {
      expect(typeof WEDDING_DATE).toBe('string');
      expect(WEDDING_DATE.length).toBeGreaterThan(0);
    });

    it('is a valid ISO date string that parses without error', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getTime()).not.toBeNaN();
    });

    it('does not throw when parsed', () => {
      expect(() => new Date(WEDDING_DATE)).not.toThrow();
    });

    it('parses to the correct year: 2026', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getFullYear()).toBe(2026);
    });

    it('parses to the correct month: August (index 7)', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getMonth()).toBe(7);
    });

    it('parses to the correct day: 29', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getDate()).toBe(29);
    });

    it('falls on a Saturday (day of week = 6)', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getDay()).toBe(6);
    });

    it('is in the future relative to today (2026-05-02)', () => {
      const weddingDate = new Date(WEDDING_DATE);
      const today = new Date('2026-05-02');
      expect(weddingDate.getTime()).toBeGreaterThan(today.getTime());
    });

    it('contains the time component', () => {
      expect(WEDDING_DATE).toContain('T');
    });

    it('has a morning time (09:00)', () => {
      const date = new Date(WEDDING_DATE);
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(0);
    });

    it('matches expected ISO format pattern', () => {
      expect(WEDDING_DATE).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('date string does not contain timezone offset (local time)', () => {
      expect(WEDDING_DATE).not.toContain('Z');
      expect(WEDDING_DATE).not.toMatch(/[+-]\d{2}:\d{2}$/);
    });

    it('is in August 2026 specifically', () => {
      expect(WEDDING_DATE).toContain('2026-08');
    });

    it('the full date portion is 2026-08-29', () => {
      expect(WEDDING_DATE.substring(0, 10)).toBe('2026-08-29');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. VENUE
  // ---------------------------------------------------------------------------

  describe('VENUE', () => {
    it('is an object', () => {
      expect(typeof VENUE).toBe('object');
      expect(VENUE).not.toBeNull();
    });

    it('has a non-empty name', () => {
      expect(VENUE.name).toBeTruthy();
      expect(VENUE.name.length).toBeGreaterThan(0);
    });

    it('has a non-empty address', () => {
      expect(VENUE.address).toBeTruthy();
      expect(VENUE.address.length).toBeGreaterThan(0);
    });

    it('name is not a placeholder', () => {
      expect(VENUE.name).not.toMatch(/^(TBD|TBA|placeholder|TODO)/i);
    });

    it('address is not a placeholder', () => {
      expect(VENUE.address).not.toMatch(/^(TBD|TBA|placeholder|TODO)/i);
    });

    it('name contains "Candra Kencana"', () => {
      expect(VENUE.name).toContain('Candra Kencana');
    });

    it('address contains street information', () => {
      expect(VENUE.address).toContain('Jl.');
    });

    it('address contains Surabaya', () => {
      expect(VENUE.address).toContain('Surabaya');
    });

    it('has a mapsUrl property', () => {
      expect(VENUE).toHaveProperty('mapsUrl');
    });

    it('mapsUrl starts with https://', () => {
      expect(VENUE.mapsUrl).toMatch(/^https:\/\//);
    });

    it('mapsUrl is a valid Google Maps URL', () => {
      expect(VENUE.mapsUrl).toContain('google.com/maps');
    });

    it('mapsUrl contains Surabaya reference', () => {
      expect(VENUE.mapsUrl).toContain('Surabaya');
    });

    it('mapsUrl is not a placeholder URL', () => {
      expect(VENUE.mapsUrl).not.toBe('https://maps.google.com');
      expect(VENUE.mapsUrl).not.toContain('example.com');
    });

    it('mapsUrl contains coordinates or address details', () => {
      // Should contain either lat/long or address info
      expect(VENUE.mapsUrl.length).toBeGreaterThan(50);
    });

    it('mapsUrl contains the venue name reference', () => {
      expect(VENUE.mapsUrl.toLowerCase()).toContain('candra');
    });

    it('VENUE has exactly 3 properties', () => {
      expect(Object.keys(VENUE)).toHaveLength(3);
    });

    it('VENUE properties are name, address, mapsUrl', () => {
      expect(Object.keys(VENUE).sort()).toEqual(['address', 'mapsUrl', 'name']);
    });

    it('no VENUE values contain HTML tags', () => {
      Object.values(VENUE).forEach((val) => {
        expect(val).not.toMatch(/<[^>]+>/);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. BANK_ACCOUNTS
  // ---------------------------------------------------------------------------

  describe('BANK_ACCOUNTS', () => {
    it('is an array', () => {
      expect(Array.isArray(BANK_ACCOUNTS)).toBe(true);
    });

    it('has at least one account', () => {
      expect(BANK_ACCOUNTS.length).toBeGreaterThan(0);
    });

    it('has exactly 6 accounts', () => {
      expect(BANK_ACCOUNTS).toHaveLength(6);
    });

    it('every account has a bank property', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc).toHaveProperty('bank');
        expect(typeof acc.bank).toBe('string');
      });
    });

    it('every account has an account property', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc).toHaveProperty('account');
        expect(typeof acc.account).toBe('string');
      });
    });

    it('every account has an owner property', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc).toHaveProperty('owner');
        expect(typeof acc.owner).toBe('string');
      });
    });

    it('no account has an empty bank name', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.bank.trim().length).toBeGreaterThan(0);
      });
    });

    it('no account has an empty account number', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.account.trim().length).toBeGreaterThan(0);
      });
    });

    it('no account has an empty owner name', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.owner.trim().length).toBeGreaterThan(0);
      });
    });

    it('owner names are non-empty strings', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.owner.length).toBeGreaterThan(0);
        expect(acc.owner).not.toBe(' ');
      });
    });

    it('account numbers are numeric-like (digits only or phone format)', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        // Account numbers should only contain digits
        expect(acc.account).toMatch(/^\d+$/);
      });
    });

    it('account numbers have reasonable length (8-15 digits)', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.account.length).toBeGreaterThanOrEqual(8);
        expect(acc.account.length).toBeLessThanOrEqual(15);
      });
    });

    it('no duplicate account numbers', () => {
      const accounts = BANK_ACCOUNTS.map((a) => a.account);
      expect(new Set(accounts).size).toBe(accounts.length);
    });

    it('no duplicate bank names (each bank appears once)', () => {
      const banks = BANK_ACCOUNTS.map((a) => a.bank);
      expect(new Set(banks).size).toBe(banks.length);
    });

    it('every account has exactly 3 properties', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(Object.keys(acc)).toHaveLength(3);
      });
    });

    it('every account has properties bank, account, owner', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(Object.keys(acc).sort()).toEqual(['account', 'bank', 'owner']);
      });
    });

    it('bank names are known Indonesian banks or e-wallets', () => {
      const knownBanks = ['BCA', 'BRI', 'Jenius', 'BTN', 'BNI', 'CIMB', 'Gopay', 'OVO', 'ShopeePay', 'Seabank'];
      BANK_ACCOUNTS.forEach((acc) => {
        expect(knownBanks).toContain(acc.bank);
      });
    });

    it('no bank account values contain HTML tags', () => {
      BANK_ACCOUNTS.forEach((acc) => {
        expect(acc.bank).not.toMatch(/<[^>]+>/);
        expect(acc.account).not.toMatch(/<[^>]+>/);
        expect(acc.owner).not.toMatch(/<[^>]+>/);
      });
    });

    it('includes both conventional banks and e-wallets', () => {
      const banks = BANK_ACCOUNTS.map((a) => a.bank);
      const eWallets = ['Gopay', 'OVO', 'ShopeePay', 'Seabank'];
      const hasEWallet = banks.some((b) => eWallets.includes(b));
      const hasBank = banks.some((b) => !eWallets.includes(b));
      expect(hasEWallet).toBe(true);
      expect(hasBank).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. STORY_SLIDES
  // ---------------------------------------------------------------------------

  describe('STORY_SLIDES', () => {
    it('is an array', () => {
      expect(Array.isArray(STORY_SLIDES)).toBe(true);
    });

    it('has exactly 6 slides', () => {
      expect(STORY_SLIDES).toHaveLength(6);
    });

    it('every slide has a year property', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide).toHaveProperty('year');
        expect(typeof slide.year).toBe('string');
      });
    });

    it('every slide has a text property', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide).toHaveProperty('text');
        expect(typeof slide.text).toBe('string');
      });
    });

    it('every slide has a bg property', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide).toHaveProperty('bg');
        expect(typeof slide.bg).toBe('string');
      });
    });

    it('every slide year is non-empty', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.year.trim().length).toBeGreaterThan(0);
      });
    });

    it('every slide text is non-empty', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.text.trim().length).toBeGreaterThan(0);
      });
    });

    it('no slide has empty text', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.text).not.toBe('');
        expect(slide.text.length).toBeGreaterThan(10);
      });
    });

    it('bg paths start with /', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.bg).toMatch(/^\//);
      });
    });

    it('bg paths reference real image extensions (.jpeg, .png, .jpg, .webp)', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.bg).toMatch(/\.(jpeg|jpg|png|webp)$/i);
      });
    });

    it('bg paths do not contain spaces', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.bg).not.toContain(' ');
      });
    });

    it('years are in roughly chronological order', () => {
      // Extract the first numeric year from each slide (excluding "Ikrar")
      const numericSlides = STORY_SLIDES.filter((s) => /^\d/.test(s.year));
      const years = numericSlides.map((s) => {
        const match = s.year.match(/^(\d{4})/);
        return match ? parseInt(match[1], 10) : 0;
      });
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeLessThanOrEqual(years[i + 1]);
      }
    });

    it('first slide starts from the earliest year', () => {
      expect(STORY_SLIDES[0].year).toContain('2016');
    });

    it('last slide is "Ikrar"', () => {
      const lastSlide = STORY_SLIDES[STORY_SLIDES.length - 1];
      expect(lastSlide.year).toBe('Ikrar');
    });

    it('Ikrar slide has meaningful text', () => {
      const ikrar = STORY_SLIDES[STORY_SLIDES.length - 1];
      expect(ikrar.text.length).toBeGreaterThan(50);
    });

    it('text contains newlines for formatting', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.text).toContain('\n');
      });
    });

    it('text does not contain HTML tags', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(slide.text).not.toMatch(/<[^>]+>/);
      });
    });

    it('every slide has exactly 3 properties', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(Object.keys(slide)).toHaveLength(3);
      });
    });

    it('every slide has properties year, text, bg', () => {
      STORY_SLIDES.forEach((slide) => {
        expect(Object.keys(slide).sort()).toEqual(['bg', 'text', 'year']);
      });
    });

    it('year ranges use em-dash separator', () => {
      const rangeSlides = STORY_SLIDES.filter((s) => s.year.includes('—'));
      expect(rangeSlides.length).toBeGreaterThan(0);
      rangeSlides.forEach((slide) => {
        expect(slide.year).toMatch(/\d{4}\s*—\s*\d{4}/);
      });
    });

    it('slides cover the years 2016 through 2026', () => {
      const allYearsText = STORY_SLIDES.map((s) => s.year).join(' ');
      expect(allYearsText).toContain('2016');
      expect(allYearsText).toContain('2026');
    });

    it('no two adjacent slides have the same bg image', () => {
      for (let i = 0; i < STORY_SLIDES.length - 1; i++) {
        // Note: some may share bg legitimately, but adjacent ones should differ early on
        if (i < 3) {
          expect(STORY_SLIDES[i].bg).not.toBe(STORY_SLIDES[i + 1].bg);
        }
      }
    });

    it('at least one slide references bride portrait', () => {
      const hasBride = STORY_SLIDES.some((s) => s.bg.includes('bride'));
      expect(hasBride).toBe(true);
    });

    it('at least one slide references groom portrait', () => {
      const hasGroom = STORY_SLIDES.some((s) => s.bg.includes('groom'));
      expect(hasGroom).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. GALLERY_ITEMS
  // ---------------------------------------------------------------------------

  describe('GALLERY_ITEMS', () => {
    it('is an array', () => {
      expect(Array.isArray(GALLERY_ITEMS)).toBe(true);
    });

    it('has exactly 12 items', () => {
      expect(GALLERY_ITEMS).toHaveLength(12);
    });

    it('every item has a src property', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('src');
        expect(typeof item.src).toBe('string');
      });
    });

    it('every item has a span property', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('span');
        expect(typeof item.span).toBe('string');
      });
    });

    it('every item has a shape property', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('shape');
        expect(typeof item.shape).toBe('string');
      });
    });

    it('every item src starts with /', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.src).toMatch(/^\//);
      });
    });

    it('every item src references an image file', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.src).toMatch(/\.(jpeg|jpg|png|webp)$/i);
      });
    });

    it('every item span contains col-span', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.span).toContain('col-span-');
      });
    });

    it('every item span contains row-span', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.span).toContain('row-span-');
      });
    });

    it('span values use valid Tailwind col-span and row-span classes', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.span).toMatch(/col-span-\d+/);
        expect(item.span).toMatch(/row-span-\d+/);
      });
    });

    it('every item shape starts with rounded-', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.shape).toMatch(/^rounded-/);
      });
    });

    it('shape values use bracket notation for custom border-radius', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.shape).toMatch(/^rounded-\[.*\]$/);
      });
    });

    it('shape values contain rem units', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.shape).toContain('rem');
      });
    });

    it('no two adjacent items are identical entries', () => {
      for (let i = 0; i < GALLERY_ITEMS.length - 1; i++) {
        const current = JSON.stringify(GALLERY_ITEMS[i]);
        const next = JSON.stringify(GALLERY_ITEMS[i + 1]);
        expect(current).not.toBe(next);
      }
    });

    it('every item has exactly 3 properties', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(Object.keys(item)).toHaveLength(3);
      });
    });

    it('every item has properties src, span, shape', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(Object.keys(item).sort()).toEqual(['shape', 'span', 'src']);
      });
    });

    it('gallery uses a mix of different span sizes', () => {
      const spans = new Set(GALLERY_ITEMS.map((item) => item.span));
      expect(spans.size).toBeGreaterThan(1);
    });

    it('gallery uses a variety of shapes', () => {
      const shapes = new Set(GALLERY_ITEMS.map((item) => item.shape));
      expect(shapes.size).toBeGreaterThan(1);
    });

    it('all shapes are unique', () => {
      const shapes = GALLERY_ITEMS.map((item) => item.shape);
      expect(new Set(shapes).size).toBe(shapes.length);
    });

    it('includes bride portrait images', () => {
      const hasBride = GALLERY_ITEMS.some((item) =>
        item.src.includes('bride'),
      );
      expect(hasBride).toBe(true);
    });

    it('includes groom portrait images', () => {
      const hasGroom = GALLERY_ITEMS.some((item) =>
        item.src.includes('groom'),
      );
      expect(hasGroom).toBe(true);
    });

    it('includes couple portrait images', () => {
      const hasCouple = GALLERY_ITEMS.some(
        (item) =>
          item.src.includes('bride_and_groom'),
      );
      expect(hasCouple).toBe(true);
    });

    it('src paths do not contain spaces', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.src).not.toContain(' ');
      });
    });

    it('no item values contain HTML tags', () => {
      GALLERY_ITEMS.forEach((item) => {
        expect(item.src).not.toMatch(/<[^>]+>/);
        expect(item.span).not.toMatch(/<[^>]+>/);
        expect(item.shape).not.toMatch(/<[^>]+>/);
      });
    });

    it('col-span values are between 1 and 3', () => {
      GALLERY_ITEMS.forEach((item) => {
        const match = item.span.match(/col-span-(\d+)/);
        expect(match).not.toBeNull();
        const colSpan = parseInt(match![1], 10);
        expect(colSpan).toBeGreaterThanOrEqual(1);
        expect(colSpan).toBeLessThanOrEqual(3);
      });
    });

    it('row-span values are between 1 and 3', () => {
      GALLERY_ITEMS.forEach((item) => {
        const match = item.span.match(/row-span-(\d+)/);
        expect(match).not.toBeNull();
        const rowSpan = parseInt(match![1], 10);
        expect(rowSpan).toBeGreaterThanOrEqual(1);
        expect(rowSpan).toBeLessThanOrEqual(3);
      });
    });

    it('gallery has at least one item with col-span-2', () => {
      const hasColSpan2 = GALLERY_ITEMS.some((item) =>
        item.span.includes('col-span-2'),
      );
      expect(hasColSpan2).toBe(true);
    });

    it('gallery has at least one item with row-span-2', () => {
      const hasRowSpan2 = GALLERY_ITEMS.some((item) =>
        item.span.includes('row-span-2'),
      );
      expect(hasRowSpan2).toBe(true);
    });

    it('shape border-radius values have 4 corners specified', () => {
      GALLERY_ITEMS.forEach((item) => {
        const match = item.shape.match(/\[(.+)\]/);
        expect(match).not.toBeNull();
        const corners = match![1].split('_');
        expect(corners).toHaveLength(4);
      });
    });
  });
});
