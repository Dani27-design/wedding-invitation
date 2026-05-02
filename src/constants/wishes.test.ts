import { describe, it, expect } from 'vitest';
import { SEED_WISHES } from './wishes';

/**
 * Comprehensive tests for the SEED_WISHES constant.
 * Covers count, structure, uniqueness, ordering, content quality, and edge cases.
 */

// ---------------------------------------------------------------------------
// 1. Count and basic structure
// ---------------------------------------------------------------------------

describe('constants/wishes', () => {
  describe('count', () => {
    it('has exactly 20 seed wishes', () => {
      expect(SEED_WISHES).toHaveLength(20);
    });

    it('is an array', () => {
      expect(Array.isArray(SEED_WISHES)).toBe(true);
    });

    it('is not empty', () => {
      expect(SEED_WISHES.length).toBeGreaterThan(0);
    });

    it('has more than 10 wishes for a realistic seed', () => {
      expect(SEED_WISHES.length).toBeGreaterThan(10);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Structural validation — every wish has exactly the required fields
  // ---------------------------------------------------------------------------

  describe('structural validation', () => {
    const REQUIRED_KEYS = ['id', 'name', 'message', 'attendance', 'createdAt'];

    it('every wish has exactly 5 properties', () => {
      SEED_WISHES.forEach((wish, index) => {
        expect(Object.keys(wish)).toHaveLength(5);
      });
    });

    it('every wish has the "id" field', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish).toHaveProperty('id');
      });
    });

    it('every wish has the "name" field', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish).toHaveProperty('name');
      });
    });

    it('every wish has the "message" field', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish).toHaveProperty('message');
      });
    });

    it('every wish has the "attendance" field', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish).toHaveProperty('attendance');
      });
    });

    it('every wish has the "createdAt" field', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish).toHaveProperty('createdAt');
      });
    });

    it('every wish contains exactly the required keys and no extras', () => {
      SEED_WISHES.forEach((wish) => {
        const keys = Object.keys(wish).sort();
        expect(keys).toEqual([...REQUIRED_KEYS].sort());
      });
    });

    it('id is a string for every wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(typeof wish.id).toBe('string');
      });
    });

    it('name is a string for every wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(typeof wish.name).toBe('string');
      });
    });

    it('message is a string for every wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(typeof wish.message).toBe('string');
      });
    });

    it('attendance is a string for every wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(typeof wish.attendance).toBe('string');
      });
    });

    it('createdAt is a number for every wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(typeof wish.createdAt).toBe('number');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. ID uniqueness and validity
  // ---------------------------------------------------------------------------

  describe('ID uniqueness and validity', () => {
    it('all IDs are unique', () => {
      const ids = SEED_WISHES.map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all IDs are non-empty strings', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id.length).toBeGreaterThan(0);
      });
    });

    it('no ID is purely whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id.trim().length).toBeGreaterThan(0);
      });
    });

    it('IDs follow a consistent prefix pattern', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id).toMatch(/^d\d+$/);
      });
    });

    it('IDs are sequential from d1 to d20', () => {
      SEED_WISHES.forEach((wish, index) => {
        expect(wish.id).toBe(`d${index + 1}`);
      });
    });

    it('no duplicate IDs even when checking with Set', () => {
      const idSet = new Set<string>();
      SEED_WISHES.forEach((wish) => {
        expect(idSet.has(wish.id)).toBe(false);
        idSet.add(wish.id);
      });
    });

    it('ID values do not contain special characters', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id).toMatch(/^[a-z0-9]+$/);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Name validation
  // ---------------------------------------------------------------------------

  describe('name validation', () => {
    it('all names are non-empty', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.length).toBeGreaterThan(0);
      });
    });

    it('all names are non-empty after trimming', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('no duplicate names', () => {
      const names = SEED_WISHES.map((w) => w.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('names do not contain HTML tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name).not.toMatch(/<[^>]+>/);
      });
    });

    it('names do not contain script tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.toLowerCase()).not.toContain('<script');
      });
    });

    it('names have reasonable length (1-100 characters)', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.length).toBeGreaterThanOrEqual(1);
        expect(wish.name.length).toBeLessThanOrEqual(100);
      });
    });

    it('names do not start with whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name).toBe(wish.name.trimStart());
      });
    });

    it('names do not end with whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name).toBe(wish.name.trimEnd());
      });
    });

    it('some names contain the ampersand character (family format)', () => {
      const hasAmpersand = SEED_WISHES.some((w) => w.name.includes('&'));
      expect(hasAmpersand).toBe(true);
    });

    it('all names are human-readable (no encoded characters)', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name).not.toMatch(/%[0-9A-F]{2}/i);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Message validation
  // ---------------------------------------------------------------------------

  describe('message validation', () => {
    it('all messages are non-empty', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.length).toBeGreaterThan(0);
      });
    });

    it('all messages are non-empty after trimming', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.trim().length).toBeGreaterThan(0);
      });
    });

    it('messages have reasonable minimum length (not too short)', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.length).toBeGreaterThanOrEqual(10);
      });
    });

    it('messages have reasonable maximum length (not too long)', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.length).toBeLessThanOrEqual(500);
      });
    });

    it('messages do not contain HTML tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message).not.toMatch(/<[^>]+>/);
      });
    });

    it('messages do not contain script tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.toLowerCase()).not.toContain('<script');
      });
    });

    it('messages do not start with whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message).toBe(wish.message.trimStart());
      });
    });

    it('messages do not end with whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message).toBe(wish.message.trimEnd());
      });
    });

    it('all messages are unique', () => {
      const messages = SEED_WISHES.map((w) => w.message);
      expect(new Set(messages).size).toBe(messages.length);
    });

    it('average message length is reasonable (20-200 chars)', () => {
      const avgLen =
        SEED_WISHES.reduce((sum, w) => sum + w.message.length, 0) /
        SEED_WISHES.length;
      expect(avgLen).toBeGreaterThanOrEqual(20);
      expect(avgLen).toBeLessThanOrEqual(200);
    });

    it('the longest message is not excessively long', () => {
      const maxLen = Math.max(...SEED_WISHES.map((w) => w.message.length));
      expect(maxLen).toBeLessThanOrEqual(500);
    });

    it('the shortest message is not trivially short', () => {
      const minLen = Math.min(...SEED_WISHES.map((w) => w.message.length));
      expect(minLen).toBeGreaterThanOrEqual(10);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Attendance validation
  // ---------------------------------------------------------------------------

  describe('attendance validation', () => {
    it('all attendance values are either "yes" or "no"', () => {
      SEED_WISHES.forEach((wish) => {
        expect(['yes', 'no']).toContain(wish.attendance);
      });
    });

    it('attendance values are lowercase', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.attendance).toBe(wish.attendance.toLowerCase());
      });
    });

    it('there is a mix of "yes" and "no" values', () => {
      const yesCount = SEED_WISHES.filter((w) => w.attendance === 'yes').length;
      const noCount = SEED_WISHES.filter((w) => w.attendance === 'no').length;
      expect(yesCount).toBeGreaterThan(0);
      expect(noCount).toBeGreaterThan(0);
    });

    it('majority of wishes have attendance "yes"', () => {
      const yesCount = SEED_WISHES.filter((w) => w.attendance === 'yes').length;
      expect(yesCount).toBeGreaterThan(SEED_WISHES.length / 2);
    });

    it('at least 2 wishes have attendance "no"', () => {
      const noCount = SEED_WISHES.filter((w) => w.attendance === 'no').length;
      expect(noCount).toBeGreaterThanOrEqual(2);
    });

    it('attendance is not an empty string for any wish', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.attendance.length).toBeGreaterThan(0);
      });
    });

    it('no attendance value contains extra whitespace', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.attendance).toBe(wish.attendance.trim());
      });
    });

    it('yes + no count equals total wishes', () => {
      const yesCount = SEED_WISHES.filter((w) => w.attendance === 'yes').length;
      const noCount = SEED_WISHES.filter((w) => w.attendance === 'no').length;
      expect(yesCount + noCount).toBe(SEED_WISHES.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Timestamp (createdAt) validation
  // ---------------------------------------------------------------------------

  describe('timestamp (createdAt) validation', () => {
    it('all timestamps are positive numbers', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.createdAt).toBeGreaterThan(0);
      });
    });

    it('all timestamps are finite numbers', () => {
      SEED_WISHES.forEach((wish) => {
        expect(Number.isFinite(wish.createdAt)).toBe(true);
      });
    });

    it('no timestamp is NaN', () => {
      SEED_WISHES.forEach((wish) => {
        expect(Number.isNaN(wish.createdAt)).toBe(false);
      });
    });

    it('wishes are ordered by createdAt descending', () => {
      for (let i = 0; i < SEED_WISHES.length - 1; i++) {
        expect(SEED_WISHES[i].createdAt).toBeGreaterThan(
          SEED_WISHES[i + 1].createdAt,
        );
      }
    });

    it('no two wishes share the same timestamp', () => {
      const timestamps = SEED_WISHES.map((w) => w.createdAt);
      expect(new Set(timestamps).size).toBe(timestamps.length);
    });

    it('timestamp differences are consistent (roughly 1000000 apart)', () => {
      for (let i = 0; i < SEED_WISHES.length - 1; i++) {
        const diff = SEED_WISHES[i].createdAt - SEED_WISHES[i + 1].createdAt;
        // Allow small tolerance for Date.now() evaluation during module import
        expect(Math.abs(diff - 1000000)).toBeLessThan(100);
      }
    });

    it('timestamps are based on Date.now() offsets', () => {
      // The first wish should be close to Date.now() minus 1000000
      // Allow some tolerance for test execution time (5 seconds)
      const now = Date.now();
      const firstWish = SEED_WISHES[0];
      const expectedApprox = now - 1000000;
      const tolerance = 5000;
      expect(Math.abs(firstWish.createdAt - expectedApprox)).toBeLessThan(
        tolerance,
      );
    });

    it('the last wish timestamp is the smallest', () => {
      const lastCreatedAt = SEED_WISHES[SEED_WISHES.length - 1].createdAt;
      SEED_WISHES.forEach((wish) => {
        expect(wish.createdAt).toBeGreaterThanOrEqual(lastCreatedAt);
      });
    });

    it('the first wish timestamp is the largest', () => {
      const firstCreatedAt = SEED_WISHES[0].createdAt;
      SEED_WISHES.forEach((wish) => {
        expect(wish.createdAt).toBeLessThanOrEqual(firstCreatedAt);
      });
    });

    it('total time span is approximately 19 * 1000000 ms', () => {
      const span = SEED_WISHES[0].createdAt - SEED_WISHES[SEED_WISHES.length - 1].createdAt;
      expect(Math.abs(span - 19 * 1000000)).toBeLessThan(1000);
    });

    it('all timestamps represent reasonable dates (not year 1970 or 3000)', () => {
      SEED_WISHES.forEach((wish) => {
        const date = new Date(wish.createdAt);
        const year = date.getFullYear();
        expect(year).toBeGreaterThanOrEqual(2024);
        expect(year).toBeLessThanOrEqual(2030);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Content quality checks
  // ---------------------------------------------------------------------------

  describe('content quality', () => {
    it('messages contain wedding-related words', () => {
      const weddingWords = [
        'selamat',
        'happy',
        'wedding',
        'bahagia',
        'doa',
        'congrats',
        'sakinah',
        'mawaddah',
      ];
      const allMessages = SEED_WISHES.map((w) => w.message.toLowerCase()).join(
        ' ',
      );
      const hasWeddingContent = weddingWords.some((word) =>
        allMessages.includes(word),
      );
      expect(hasWeddingContent).toBe(true);
    });

    it('at least one message mentions the couple names', () => {
      const allMessages = SEED_WISHES.map((w) => w.message).join(' ');
      const mentionsDani = allMessages.includes('Dani');
      const mentionsMarini = allMessages.includes('Marini');
      expect(mentionsDani || mentionsMarini).toBe(true);
    });

    it('some messages are in Indonesian', () => {
      const indonesianWords = ['selamat', 'semoga', 'bahagia', 'lancar', 'doa', 'maaf'];
      const allMessages = SEED_WISHES.map((w) => w.message.toLowerCase()).join(' ');
      const indonesianCount = indonesianWords.filter((w) =>
        allMessages.includes(w),
      ).length;
      expect(indonesianCount).toBeGreaterThan(0);
    });

    it('some messages are in English', () => {
      const englishWords = ['happy', 'wedding', 'congrats', 'forever'];
      const allMessages = SEED_WISHES.map((w) => w.message.toLowerCase()).join(' ');
      const englishCount = englishWords.filter((w) =>
        allMessages.includes(w),
      ).length;
      expect(englishCount).toBeGreaterThan(0);
    });

    it('no message is identical to another', () => {
      const messages = SEED_WISHES.map((w) => w.message);
      expect(new Set(messages).size).toBe(messages.length);
    });

    it('names represent diverse Indonesian names', () => {
      const names = SEED_WISHES.map((w) => w.name);
      // Check first letters are diverse
      const firstLetters = new Set(names.map((n) => n[0].toUpperCase()));
      expect(firstLetters.size).toBeGreaterThan(5);
    });

    it('no wish has a name that looks like test data', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.toLowerCase()).not.toMatch(
          /^(test|user|foo|bar|lorem|ipsum|dummy)/,
        );
      });
    });

    it('no wish has a message that looks like test data', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.toLowerCase()).not.toMatch(
          /^(test|lorem ipsum|foo|bar|asdf|placeholder)/,
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Edge case: HTML and injection
  // ---------------------------------------------------------------------------

  describe('edge case: HTML and injection safety', () => {
    it('no names contain HTML tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name).not.toMatch(/<[^>]+>/);
      });
    });

    it('no messages contain HTML tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message).not.toMatch(/<[^>]+>/);
      });
    });

    it('no names contain script injection', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.name.toLowerCase()).not.toContain('javascript:');
        expect(wish.name.toLowerCase()).not.toContain('onerror');
        expect(wish.name.toLowerCase()).not.toContain('onload');
      });
    });

    it('no messages contain script injection', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.message.toLowerCase()).not.toContain('javascript:');
        expect(wish.message.toLowerCase()).not.toContain('onerror');
        expect(wish.message.toLowerCase()).not.toContain('onload');
      });
    });

    it('no IDs contain HTML tags', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id).not.toMatch(/<[^>]+>/);
      });
    });

    it('no field values contain null bytes', () => {
      SEED_WISHES.forEach((wish) => {
        expect(wish.id).not.toContain('\0');
        expect(wish.name).not.toContain('\0');
        expect(wish.message).not.toContain('\0');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Relationship between fields
  // ---------------------------------------------------------------------------

  describe('field relationships', () => {
    it('"no" attendance wishes still have positive messages', () => {
      const noWishes = SEED_WISHES.filter((w) => w.attendance === 'no');
      noWishes.forEach((wish) => {
        expect(wish.message.length).toBeGreaterThan(10);
      });
    });

    it('IDs and names are independently unique', () => {
      const ids = SEED_WISHES.map((w) => w.id);
      const names = SEED_WISHES.map((w) => w.name);
      expect(new Set(ids).size).toBe(SEED_WISHES.length);
      expect(new Set(names).size).toBe(SEED_WISHES.length);
    });

    it('wishes with "no" attendance mention apology or inability', () => {
      const noWishes = SEED_WISHES.filter((w) => w.attendance === 'no');
      const apologyWords = ['maaf', 'sorry', 'tidak bisa', 'belum bisa', 'doa'];
      noWishes.forEach((wish) => {
        const msgLower = wish.message.toLowerCase();
        const containsApology = apologyWords.some((word) =>
          msgLower.includes(word),
        );
        expect(containsApology).toBe(true);
      });
    });

    it('createdAt values decrease as array index increases', () => {
      for (let i = 0; i < SEED_WISHES.length; i++) {
        // createdAt = Date.now() - (i+1)*1000000 pattern
        if (i < SEED_WISHES.length - 1) {
          expect(SEED_WISHES[i].createdAt).toBeGreaterThan(
            SEED_WISHES[i + 1].createdAt,
          );
        }
      }
    });

    it('ID numeric suffix matches array position', () => {
      SEED_WISHES.forEach((wish, index) => {
        const numericPart = parseInt(wish.id.replace(/\D/g, ''), 10);
        expect(numericPart).toBe(index + 1);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Serialization and data integrity
  // ---------------------------------------------------------------------------

  describe('serialization and data integrity', () => {
    it('can be serialized to JSON without error', () => {
      expect(() => JSON.stringify(SEED_WISHES)).not.toThrow();
    });

    it('JSON round-trip preserves structure', () => {
      const json = JSON.stringify(SEED_WISHES);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(SEED_WISHES.length);
      parsed.forEach((wish: Record<string, unknown>, i: number) => {
        expect(wish.id).toBe(SEED_WISHES[i].id);
        expect(wish.name).toBe(SEED_WISHES[i].name);
        expect(wish.message).toBe(SEED_WISHES[i].message);
        expect(wish.attendance).toBe(SEED_WISHES[i].attendance);
      });
    });

    it('JSON round-trip preserves createdAt as numbers', () => {
      const json = JSON.stringify(SEED_WISHES);
      const parsed = JSON.parse(json);
      parsed.forEach((wish: Record<string, unknown>) => {
        expect(typeof wish.createdAt).toBe('number');
      });
    });

    it('total JSON size is reasonable (under 10KB)', () => {
      const json = JSON.stringify(SEED_WISHES);
      expect(json.length).toBeLessThan(10000);
    });

    it('spreading into a new array creates independent copies', () => {
      const copy = [...SEED_WISHES];
      expect(copy).toHaveLength(SEED_WISHES.length);
      expect(copy).not.toBe(SEED_WISHES);
    });

    it('individual wish objects can be destructured', () => {
      const { id, name, message, attendance, createdAt } = SEED_WISHES[0];
      expect(id).toBe(SEED_WISHES[0].id);
      expect(name).toBe(SEED_WISHES[0].name);
      expect(message).toBe(SEED_WISHES[0].message);
      expect(attendance).toBe(SEED_WISHES[0].attendance);
      expect(createdAt).toBe(SEED_WISHES[0].createdAt);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Boundary and stress checks
  // ---------------------------------------------------------------------------

  describe('boundary and stress checks', () => {
    it('first wish in array is accessible', () => {
      expect(SEED_WISHES[0]).toBeDefined();
      expect(SEED_WISHES[0].id).toBe('d1');
    });

    it('last wish in array is accessible', () => {
      const last = SEED_WISHES[SEED_WISHES.length - 1];
      expect(last).toBeDefined();
      expect(last.id).toBe('d20');
    });

    it('accessing out-of-bounds index returns undefined', () => {
      expect(SEED_WISHES[20]).toBeUndefined();
      expect(SEED_WISHES[-1]).toBeUndefined();
    });

    it('filtering by attendance "yes" returns a subset', () => {
      const yesWishes = SEED_WISHES.filter((w) => w.attendance === 'yes');
      expect(yesWishes.length).toBeGreaterThan(0);
      expect(yesWishes.length).toBeLessThan(SEED_WISHES.length);
    });

    it('filtering by attendance "no" returns a subset', () => {
      const noWishes = SEED_WISHES.filter((w) => w.attendance === 'no');
      expect(noWishes.length).toBeGreaterThan(0);
      expect(noWishes.length).toBeLessThan(SEED_WISHES.length);
    });

    it('mapping names produces an array of 20 strings', () => {
      const names = SEED_WISHES.map((w) => w.name);
      expect(names).toHaveLength(20);
      names.forEach((name) => {
        expect(typeof name).toBe('string');
      });
    });

    it('reducing to total message length produces a positive number', () => {
      const totalLen = SEED_WISHES.reduce((sum, w) => sum + w.message.length, 0);
      expect(totalLen).toBeGreaterThan(0);
    });

    it('sorting a copy by createdAt ascending produces a reversed array', () => {
      const sorted = [...SEED_WISHES].sort((a, b) => a.createdAt - b.createdAt);
      // Original is descending, sorted ascending — first and last should swap
      expect(sorted[0].id).toBe(SEED_WISHES[SEED_WISHES.length - 1].id);
      expect(sorted[sorted.length - 1].id).toBe(SEED_WISHES[0].id);
    });

    it('can find a specific wish by id', () => {
      const found = SEED_WISHES.find((w) => w.id === 'd10');
      expect(found).toBeDefined();
      expect(found!.id).toBe('d10');
    });

    it('can find a wish by name', () => {
      const found = SEED_WISHES.find((w) => w.name === 'Budi Santoso');
      expect(found).toBeDefined();
      expect(found!.attendance).toBe('yes');
    });

    it('searching for non-existent id returns undefined', () => {
      const found = SEED_WISHES.find((w) => w.id === 'd999');
      expect(found).toBeUndefined();
    });
  });
});
