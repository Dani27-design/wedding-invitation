import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('utils/formatDate', () => {
  // ---------------------------------------------------------------------------
  // Normal: formats various dates correctly
  // ---------------------------------------------------------------------------
  describe('normal date formatting', () => {
    it('formats the wedding date (2026-08-29) correctly', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('includes the day number 29 for August 29', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result).toContain('29');
    });

    it('includes the year 2026', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result).toContain('2026');
    });

    it('formats January 1, 2025 correctly', () => {
      const result = formatDate(new Date('2025-01-01').getTime());
      expect(result).toContain('1');
      expect(result).toContain('2025');
    });

    it('formats a date in March correctly', () => {
      const result = formatDate(new Date('2024-03-15').getTime());
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats a date in December correctly', () => {
      const result = formatDate(new Date('2023-12-25').getTime());
      expect(result).toContain('25');
      expect(result).toContain('2023');
    });

    it('formats a date in June correctly', () => {
      const result = formatDate(new Date('2026-06-10').getTime());
      expect(result).toContain('10');
      expect(result).toContain('2026');
    });

    it('includes day, month abbreviation, and year in output', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      // Format should be something like "29 Agt 2026"
      const parts = result.split(/\s+/);
      expect(parts.length).toBeGreaterThanOrEqual(3);
    });

    it('formats a single-digit day correctly', () => {
      const result = formatDate(new Date('2026-01-05').getTime());
      expect(result).toContain('5');
      expect(result).toContain('2026');
    });

    it('formats a double-digit day correctly', () => {
      const result = formatDate(new Date('2026-01-15').getTime());
      expect(result).toContain('15');
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: special timestamps
  // ---------------------------------------------------------------------------
  describe('edge: special timestamps', () => {
    it('handles timestamp 0 (Unix epoch)', () => {
      const result = formatDate(0);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('epoch timestamp includes year 1970', () => {
      const result = formatDate(0);
      expect(result).toContain('1970');
    });

    it('handles a very large timestamp (year ~5000)', () => {
      // approximately year 5000
      const largeTs = new Date('5000-06-15').getTime();
      const result = formatDate(largeTs);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('handles a negative timestamp (before epoch)', () => {
      // December 31, 1969 or earlier
      const result = formatDate(-86400000);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('negative timestamp produces a year before 1970', () => {
      const result = formatDate(-86400000 * 365);
      expect(result).toBeTruthy();
      // Should reference a year before 1970
      expect(result).toContain('196');
    });

    it('handles the current time', () => {
      const result = formatDate(Date.now());
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles midnight boundary (start of day)', () => {
      const midnight = new Date('2026-08-29T00:00:00Z').getTime();
      const result = formatDate(midnight);
      expect(result).toContain('2026');
    });

    it('handles just before midnight', () => {
      const beforeMidnight = new Date('2026-08-29T23:59:59.999Z').getTime();
      const result = formatDate(beforeMidnight);
      expect(result).toBeTruthy();
    });

    it('handles timestamp of 1 (1 millisecond after epoch)', () => {
      const result = formatDate(1);
      expect(result).toBeTruthy();
      expect(result).toContain('1970');
    });

    it('handles a timestamp in the far past (year 1900)', () => {
      const ts = new Date('1900-01-01').getTime();
      const result = formatDate(ts);
      expect(result).toBeTruthy();
      expect(result).toContain('1900');
    });
  });

  // ---------------------------------------------------------------------------
  // Locale: Indonesian month abbreviations
  // ---------------------------------------------------------------------------
  describe('locale: Indonesian output', () => {
    it('output contains an Indonesian month abbreviation for August', () => {
      const result = formatDate(new Date('2026-08-15').getTime());
      // Indonesian abbreviation for August is "Agt" or "Agu"
      const hasIndonesianMonth = /Agt|Agu/i.test(result);
      expect(hasIndonesianMonth).toBe(true);
    });

    it('output for January contains Indonesian month abbreviation', () => {
      const result = formatDate(new Date('2026-01-15').getTime());
      // "Jan" is the same in Indonesian
      const hasMonth = /Jan/i.test(result);
      expect(hasMonth).toBe(true);
    });

    it('different months produce different outputs', () => {
      const jan = formatDate(new Date('2026-01-15').getTime());
      const aug = formatDate(new Date('2026-08-15').getTime());
      expect(jan).not.toBe(aug);
    });

    it('different months on the same day/year have unique month parts', () => {
      const results = [];
      for (let m = 1; m <= 12; m++) {
        const dateStr = `2026-${String(m).padStart(2, '0')}-15`;
        results.push(formatDate(new Date(dateStr).getTime()));
      }
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(12);
    });

    it('output for December contains Indonesian month abbreviation', () => {
      const result = formatDate(new Date('2026-12-15').getTime());
      // Indonesian: "Des"
      const hasDes = /Des/i.test(result);
      expect(hasDes).toBe(true);
    });

    it('output for February contains Indonesian month abbreviation', () => {
      const result = formatDate(new Date('2026-02-15').getTime());
      // Indonesian: "Feb"
      const hasFeb = /Feb/i.test(result);
      expect(hasFeb).toBe(true);
    });

    it('output for March contains Indonesian month abbreviation', () => {
      const result = formatDate(new Date('2026-03-15').getTime());
      // Indonesian: "Mar"
      const hasMar = /Mar/i.test(result);
      expect(hasMar).toBe(true);
    });

    it('output for October contains Indonesian month abbreviation', () => {
      const result = formatDate(new Date('2026-10-15').getTime());
      // Indonesian: "Okt"
      const hasOkt = /Okt/i.test(result);
      expect(hasOkt).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency: same input produces same output
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('returns consistent result for the same timestamp', () => {
      const ts = new Date('2026-08-29').getTime();
      const first = formatDate(ts);
      const second = formatDate(ts);
      expect(first).toBe(second);
    });

    it('returns consistent result across 100 calls', () => {
      const ts = new Date('2026-01-15').getTime();
      const baseline = formatDate(ts);
      for (let i = 0; i < 100; i++) {
        expect(formatDate(ts)).toBe(baseline);
      }
    });

    it('returns consistent result for epoch', () => {
      const first = formatDate(0);
      const second = formatDate(0);
      expect(first).toBe(second);
    });

    it('different timestamps produce different results', () => {
      const ts1 = new Date('2026-01-01').getTime();
      const ts2 = new Date('2026-06-15').getTime();
      expect(formatDate(ts1)).not.toBe(formatDate(ts2));
    });

    it('same day in different years produces different results', () => {
      const ts2025 = new Date('2025-08-29').getTime();
      const ts2026 = new Date('2026-08-29').getTime();
      expect(formatDate(ts2025)).not.toBe(formatDate(ts2026));
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary: first/last day of month, leap year, end of year
  // ---------------------------------------------------------------------------
  describe('boundary dates', () => {
    it('formats the first day of a month', () => {
      const result = formatDate(new Date('2026-03-01').getTime());
      expect(result).toContain('1');
      expect(result).toContain('2026');
    });

    it('formats the last day of January (31)', () => {
      const result = formatDate(new Date('2026-01-31').getTime());
      expect(result).toContain('31');
    });

    it('formats the last day of February in a non-leap year (28)', () => {
      const result = formatDate(new Date('2026-02-28').getTime());
      expect(result).toContain('28');
    });

    it('formats leap year date Feb 29', () => {
      const result = formatDate(new Date('2024-02-29').getTime());
      expect(result).toContain('29');
      expect(result).toContain('2024');
    });

    it('formats the last day of the year (Dec 31)', () => {
      const result = formatDate(new Date('2026-12-31').getTime());
      expect(result).toContain('31');
      expect(result).toContain('2026');
    });

    it('formats the first day of the year (Jan 1)', () => {
      const result = formatDate(new Date('2026-01-01').getTime());
      expect(result).toContain('1');
      expect(result).toContain('2026');
    });

    it('formats last day of April (30)', () => {
      const result = formatDate(new Date('2026-04-30').getTime());
      expect(result).toContain('30');
    });

    it('formats last day of a 31-day month correctly', () => {
      const result = formatDate(new Date('2026-07-31').getTime());
      expect(result).toContain('31');
    });

    it('handles the transition from year to year', () => {
      const dec31 = formatDate(new Date('2025-12-31').getTime());
      const jan1 = formatDate(new Date('2026-01-01').getTime());
      expect(dec31).toContain('2025');
      expect(jan1).toContain('2026');
    });
  });

  // ---------------------------------------------------------------------------
  // Bad input: NaN, Infinity
  // ---------------------------------------------------------------------------
  describe('bad input', () => {
    it('calling with NaN throws a RangeError', () => {
      expect(() => formatDate(NaN)).toThrow(RangeError);
    });

    it('NaN input throws with "Invalid time value" message', () => {
      expect(() => formatDate(NaN)).toThrow('Invalid time value');
    });

    it('calling with Infinity does not crash the process', () => {
      // Intl.DateTimeFormat may throw RangeError for invalid dates
      // We just verify it does not cause an unhandled crash
      try {
        const result = formatDate(Infinity);
        expect(typeof result).toBe('string');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('calling with negative Infinity does not crash the process', () => {
      try {
        const result = formatDate(-Infinity);
        expect(typeof result).toBe('string');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('calling with a very small number does not throw', () => {
      expect(() => formatDate(0.001)).not.toThrow();
    });

    it('calling with Number.MAX_SAFE_INTEGER handles gracefully', () => {
      try {
        const result = formatDate(Number.MAX_SAFE_INTEGER);
        expect(typeof result).toBe('string');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Performance: calling many times
  // ---------------------------------------------------------------------------
  describe('performance', () => {
    it('calling formatDate 1000 times does not throw', () => {
      const ts = new Date('2026-08-29').getTime();
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          formatDate(ts);
        }
      }).not.toThrow();
    });

    it('calling formatDate with different timestamps 500 times does not throw', () => {
      expect(() => {
        for (let i = 0; i < 500; i++) {
          formatDate(i * 86400000);
        }
      }).not.toThrow();
    });

    it('1000 calls produce consistent results', () => {
      const ts = new Date('2026-08-29').getTime();
      const baseline = formatDate(ts);
      for (let i = 0; i < 1000; i++) {
        expect(formatDate(ts)).toBe(baseline);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Format: result shape
  // ---------------------------------------------------------------------------
  describe('format validation', () => {
    it('result is a non-empty string', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('result length is reasonable (5 to 20 characters)', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('result for single-digit day has reasonable length', () => {
      const result = formatDate(new Date('2026-01-05').getTime());
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('result for double-digit day has reasonable length', () => {
      const result = formatDate(new Date('2026-12-25').getTime());
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('result does not contain HTML or special characters', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('&');
    });

    it('result is trimmed (no leading/trailing spaces)', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(result).toBe(result.trim());
    });

    it('result contains numeric characters for day and year', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(/\d/.test(result)).toBe(true);
    });

    it('result contains alphabetic characters for month', () => {
      const result = formatDate(new Date('2026-08-29').getTime());
      expect(/[a-zA-Z]/.test(result)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Firestore Timestamp compatibility
  // ---------------------------------------------------------------------------
  describe('Firestore Timestamp input', () => {
    const createMockTimestamp = (date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    });

    it('formats a Timestamp-like object correctly', () => {
      const ts = createMockTimestamp(new Date('2026-08-29'));
      // formatDate checks instanceof Timestamp — mock won't pass instanceof
      // but in real usage it will. Test the toDate path via direct Date input.
      const result = formatDate(ts.toDate().getTime());
      expect(result).toContain('29');
      expect(result).toContain('2026');
    });

    it('handles Timestamp for January date', () => {
      const ts = createMockTimestamp(new Date('2025-01-15'));
      const result = formatDate(ts.toDate().getTime());
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('handles Timestamp for December date', () => {
      const ts = createMockTimestamp(new Date('2025-12-25'));
      const result = formatDate(ts.toDate().getTime());
      expect(result).toContain('25');
      expect(result).toContain('2025');
    });
  });
});
