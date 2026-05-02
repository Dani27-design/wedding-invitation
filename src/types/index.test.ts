import { describe, it, expect } from 'vitest';
import type { GuestWishes } from './index';

/**
 * Comprehensive tests for the GuestWishes interface.
 *
 * Because TypeScript interfaces are erased at runtime, these tests
 * validate that objects conforming to the interface behave correctly
 * at runtime — structure, value constraints, and edge-case resilience.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWish(overrides: Partial<GuestWishes> = {}): GuestWishes {
  return {
    id: 'default-id',
    name: 'Default Name',
    message: 'Default message',
    attendance: 'yes',
    createdAt: Date.now(),
    ...overrides,
  };
}

const REQUIRED_KEYS: (keyof GuestWishes)[] = [
  'id',
  'name',
  'message',
  'attendance',
  'createdAt',
];

// ---------------------------------------------------------------------------
// 1. Valid objects — all field combinations
// ---------------------------------------------------------------------------

describe('types/GuestWishes', () => {
  describe('valid objects with attendance "yes"', () => {
    it('creates a valid wish with attendance "yes"', () => {
      const wish = createWish({ attendance: 'yes' });
      expect(wish.attendance).toBe('yes');
    });

    it('has all required fields defined', () => {
      const wish = createWish({ attendance: 'yes' });
      REQUIRED_KEYS.forEach((key) => {
        expect(wish).toHaveProperty(key);
      });
    });

    it('id is a string', () => {
      const wish = createWish();
      expect(typeof wish.id).toBe('string');
    });

    it('name is a string', () => {
      const wish = createWish();
      expect(typeof wish.name).toBe('string');
    });

    it('message is a string', () => {
      const wish = createWish();
      expect(typeof wish.message).toBe('string');
    });

    it('createdAt is a number', () => {
      const wish = createWish();
      expect(typeof wish.createdAt).toBe('number');
    });
  });

  describe('valid objects with attendance "no"', () => {
    it('creates a valid wish with attendance "no"', () => {
      const wish = createWish({ attendance: 'no' });
      expect(wish.attendance).toBe('no');
    });

    it('attendance value is exactly the string "no"', () => {
      const wish = createWish({ attendance: 'no' });
      expect(wish.attendance).not.toBe('No');
      expect(wish.attendance).not.toBe('NO');
      expect(wish.attendance).toBe('no');
    });

    it('all other fields remain intact when attendance is "no"', () => {
      const wish = createWish({
        id: 'no-attend-1',
        name: 'Absent Guest',
        message: 'Sorry I cannot make it',
        attendance: 'no',
        createdAt: 1700000000000,
      });
      expect(wish.id).toBe('no-attend-1');
      expect(wish.name).toBe('Absent Guest');
      expect(wish.message).toBe('Sorry I cannot make it');
      expect(wish.createdAt).toBe(1700000000000);
    });
  });

  describe('attendance field constraints', () => {
    it('accepts "yes" as a valid value', () => {
      const wish = createWish({ attendance: 'yes' });
      expect(['yes', 'no']).toContain(wish.attendance);
    });

    it('accepts "no" as a valid value', () => {
      const wish = createWish({ attendance: 'no' });
      expect(['yes', 'no']).toContain(wish.attendance);
    });

    it('attendance is always a non-empty string', () => {
      const wishYes = createWish({ attendance: 'yes' });
      const wishNo = createWish({ attendance: 'no' });
      expect(wishYes.attendance.length).toBeGreaterThan(0);
      expect(wishNo.attendance.length).toBeGreaterThan(0);
    });

    it('attendance values are lowercase', () => {
      const wishYes = createWish({ attendance: 'yes' });
      const wishNo = createWish({ attendance: 'no' });
      expect(wishYes.attendance).toBe(wishYes.attendance.toLowerCase());
      expect(wishNo.attendance).toBe(wishNo.attendance.toLowerCase());
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Type structure validation
  // ---------------------------------------------------------------------------

  describe('type structure validation', () => {
    it('has exactly 5 required fields', () => {
      const wish = createWish();
      const keys = Object.keys(wish);
      expect(keys).toHaveLength(5);
    });

    it('contains all required keys', () => {
      const wish = createWish();
      REQUIRED_KEYS.forEach((key) => {
        expect(Object.keys(wish)).toContain(key);
      });
    });

    it('field order does not matter — all keys present regardless of creation order', () => {
      const wish: GuestWishes = {
        createdAt: 123,
        attendance: 'yes',
        message: 'msg',
        id: 'x',
        name: 'n',
      };
      REQUIRED_KEYS.forEach((key) => {
        expect(wish).toHaveProperty(key);
      });
    });

    it('does not have unexpected fields when created with exact shape', () => {
      const wish = createWish();
      const extraKeys = Object.keys(wish).filter(
        (k) => !REQUIRED_KEYS.includes(k as keyof GuestWishes),
      );
      expect(extraKeys).toHaveLength(0);
    });

    it('string fields are not numbers', () => {
      const wish = createWish();
      expect(typeof wish.id).not.toBe('number');
      expect(typeof wish.name).not.toBe('number');
      expect(typeof wish.message).not.toBe('number');
      expect(typeof wish.attendance).not.toBe('number');
    });

    it('createdAt is not a string', () => {
      const wish = createWish();
      expect(typeof wish.createdAt).not.toBe('string');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Edge cases — empty strings
  // ---------------------------------------------------------------------------

  describe('edge case: empty strings', () => {
    it('allows empty string for id at runtime', () => {
      const wish = createWish({ id: '' });
      expect(wish.id).toBe('');
      expect(typeof wish.id).toBe('string');
    });

    it('allows empty string for name at runtime', () => {
      const wish = createWish({ name: '' });
      expect(wish.name).toBe('');
      expect(wish.name.length).toBe(0);
    });

    it('allows empty string for message at runtime', () => {
      const wish = createWish({ message: '' });
      expect(wish.message).toBe('');
      expect(wish.message.length).toBe(0);
    });

    it('empty string id has zero length', () => {
      const wish = createWish({ id: '' });
      expect(wish.id.length).toBe(0);
    });

    it('empty string name trims to empty', () => {
      const wish = createWish({ name: '' });
      expect(wish.name.trim()).toBe('');
    });

    it('empty string message trims to empty', () => {
      const wish = createWish({ message: '' });
      expect(wish.message.trim()).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Edge cases — very long strings (500+ chars)
  // ---------------------------------------------------------------------------

  describe('edge case: very long strings', () => {
    const longString500 = 'A'.repeat(500);
    const longString1000 = 'B'.repeat(1000);
    const longString5000 = 'C'.repeat(5000);

    it('accepts a name with 500+ characters', () => {
      const wish = createWish({ name: longString500 });
      expect(wish.name.length).toBe(500);
    });

    it('accepts a name with 1000 characters', () => {
      const wish = createWish({ name: longString1000 });
      expect(wish.name.length).toBe(1000);
    });

    it('accepts a message with 500+ characters', () => {
      const wish = createWish({ message: longString500 });
      expect(wish.message.length).toBe(500);
    });

    it('accepts a message with 5000 characters', () => {
      const wish = createWish({ message: longString5000 });
      expect(wish.message.length).toBe(5000);
    });

    it('accepts an id with 500+ characters', () => {
      const wish = createWish({ id: longString500 });
      expect(wish.id.length).toBe(500);
    });

    it('long strings preserve exact content', () => {
      const wish = createWish({ name: longString500 });
      expect(wish.name).toBe(longString500);
      expect(wish.name[0]).toBe('A');
      expect(wish.name[499]).toBe('A');
    });

    it('long message with mixed characters', () => {
      const mixed = 'Hello '.repeat(100) + '!' .repeat(100);
      const wish = createWish({ message: mixed });
      expect(wish.message.length).toBe(mixed.length);
      expect(wish.message).toBe(mixed);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Edge cases — special characters
  // ---------------------------------------------------------------------------

  describe('edge case: special characters in name', () => {
    it('accepts names with apostrophes', () => {
      const wish = createWish({ name: "O'Brien" });
      expect(wish.name).toBe("O'Brien");
    });

    it('accepts names with hyphens', () => {
      const wish = createWish({ name: 'Mary-Jane' });
      expect(wish.name).toContain('-');
    });

    it('accepts names with periods', () => {
      const wish = createWish({ name: 'Dr. Smith Jr.' });
      expect(wish.name).toContain('.');
    });

    it('accepts names with numbers', () => {
      const wish = createWish({ name: 'User123' });
      expect(wish.name).toMatch(/\d/);
    });

    it('accepts names with ampersand', () => {
      const wish = createWish({ name: 'Ahmad & Keluarga' });
      expect(wish.name).toContain('&');
    });

    it('accepts names with parentheses', () => {
      const wish = createWish({ name: 'Tono (alias)' });
      expect(wish.name).toContain('(');
    });

    it('accepts names with newlines', () => {
      const wish = createWish({ name: 'Line1\nLine2' });
      expect(wish.name).toContain('\n');
    });

    it('accepts names with tab characters', () => {
      const wish = createWish({ name: 'Name\twith\ttabs' });
      expect(wish.name).toContain('\t');
    });
  });

  describe('edge case: special characters in message', () => {
    it('accepts messages with quotes', () => {
      const wish = createWish({ message: 'He said "congratulations"' });
      expect(wish.message).toContain('"');
    });

    it('accepts messages with backticks', () => {
      const wish = createWish({ message: 'Code: `hello`' });
      expect(wish.message).toContain('`');
    });

    it('accepts messages with backslashes', () => {
      const wish = createWish({ message: 'path\\to\\file' });
      expect(wish.message).toContain('\\');
    });

    it('accepts messages with newlines and carriage returns', () => {
      const wish = createWish({ message: 'Line1\r\nLine2\nLine3' });
      expect(wish.message).toContain('\n');
    });

    it('accepts messages with null characters', () => {
      const wish = createWish({ message: 'before\0after' });
      expect(wish.message.length).toBe(12);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Edge cases — unicode
  // ---------------------------------------------------------------------------

  describe('edge case: unicode characters', () => {
    it('accepts Arabic text in name', () => {
      const wish = createWish({ name: 'بسم الله' });
      expect(wish.name).toBe('بسم الله');
    });

    it('accepts CJK characters in name', () => {
      const wish = createWish({ name: '太郎' });
      expect(wish.name).toBe('太郎');
    });

    it('accepts emoji in message', () => {
      const wish = createWish({ message: 'Congrats! \u2764\uFE0F\uD83C\uDF89' });
      expect(wish.message).toContain('\u2764');
    });

    it('accepts Cyrillic text in message', () => {
      const wish = createWish({ message: 'Поздравляю!' });
      expect(wish.message).toBe('Поздравляю!');
    });

    it('accepts mixed scripts', () => {
      const wish = createWish({
        name: 'Ahmad アハマド',
        message: 'Selamat 祝福 축하',
      });
      expect(wish.name).toContain('Ahmad');
      expect(wish.name).toContain('アハマド');
      expect(wish.message).toContain('축하');
    });

    it('accepts Devanagari script', () => {
      const wish = createWish({ name: 'राम' });
      expect(wish.name.length).toBeGreaterThan(0);
    });

    it('accepts Thai script', () => {
      const wish = createWish({ message: 'ยินดีด้วย' });
      expect(wish.message.length).toBeGreaterThan(0);
    });

    it('preserves combining characters', () => {
      // e + combining acute accent
      const wish = createWish({ name: 'caf\u0065\u0301' });
      expect(wish.name).toContain('e\u0301');
    });

    it('accepts zero-width characters', () => {
      const wish = createWish({ name: 'A\u200BB' });
      expect(wish.name.length).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Edge cases — HTML injection attempts
  // ---------------------------------------------------------------------------

  describe('edge case: HTML injection attempts in name', () => {
    it('stores script tags as plain text', () => {
      const wish = createWish({ name: '<script>alert("xss")</script>' });
      expect(wish.name).toBe('<script>alert("xss")</script>');
      expect(wish.name).toContain('<script>');
    });

    it('stores img onerror tags as plain text', () => {
      const wish = createWish({
        name: '<img src=x onerror=alert(1)>',
      });
      expect(wish.name).toContain('<img');
      expect(wish.name).toContain('onerror');
    });

    it('stores anchor tags as plain text', () => {
      const wish = createWish({
        name: '<a href="javascript:alert(1)">click</a>',
      });
      expect(wish.name).toContain('<a href');
    });

    it('stores iframe tags as plain text', () => {
      const wish = createWish({
        name: '<iframe src="evil.com"></iframe>',
      });
      expect(wish.name).toContain('<iframe');
    });

    it('stores SVG onload as plain text', () => {
      const wish = createWish({
        name: '<svg onload=alert(1)>',
      });
      expect(wish.name).toContain('<svg');
    });
  });

  describe('edge case: HTML injection attempts in message', () => {
    it('stores script tags as plain text in message', () => {
      const wish = createWish({
        message: '<script>document.cookie</script>',
      });
      expect(wish.message).toBe('<script>document.cookie</script>');
    });

    it('stores style tags as plain text', () => {
      const wish = createWish({
        message: '<style>body{display:none}</style>',
      });
      expect(wish.message).toContain('<style>');
    });

    it('stores HTML entities as-is', () => {
      const wish = createWish({
        message: '&lt;script&gt;alert(1)&lt;/script&gt;',
      });
      expect(wish.message).toContain('&lt;');
    });

    it('stores event handler injection as plain text', () => {
      const wish = createWish({
        message: '" onfocus="alert(1)" autofocus="',
      });
      expect(wish.message).toContain('onfocus');
    });

    it('stores nested HTML injection as plain text', () => {
      const wish = createWish({
        message: '<<script>>alert(1)<</script>>',
      });
      expect(wish.message).toContain('<<script>>');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Edge cases — createdAt boundary values
  // ---------------------------------------------------------------------------

  describe('edge case: createdAt with value 0', () => {
    it('accepts createdAt = 0', () => {
      const wish = createWish({ createdAt: 0 });
      expect(wish.createdAt).toBe(0);
    });

    it('createdAt 0 represents epoch start', () => {
      const wish = createWish({ createdAt: 0 });
      const date = new Date(wish.createdAt);
      expect(date.getFullYear()).toBe(1970);
    });
  });

  describe('edge case: createdAt with negative values', () => {
    it('accepts negative createdAt', () => {
      const wish = createWish({ createdAt: -1 });
      expect(wish.createdAt).toBe(-1);
    });

    it('negative createdAt represents date before epoch', () => {
      const wish = createWish({ createdAt: -86400000 });
      const date = new Date(wish.createdAt);
      expect(date.getFullYear()).toBe(1969);
    });

    it('accepts very large negative createdAt', () => {
      const wish = createWish({ createdAt: -999999999999 });
      expect(wish.createdAt).toBe(-999999999999);
      expect(typeof wish.createdAt).toBe('number');
    });
  });

  describe('edge case: createdAt with very large timestamps', () => {
    it('accepts timestamp far in the future', () => {
      const farFuture = 32503680000000; // year 3000
      const wish = createWish({ createdAt: farFuture });
      expect(wish.createdAt).toBe(farFuture);
    });

    it('accepts Number.MAX_SAFE_INTEGER as createdAt', () => {
      const wish = createWish({ createdAt: Number.MAX_SAFE_INTEGER });
      expect(wish.createdAt).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('accepts floating point createdAt', () => {
      const wish = createWish({ createdAt: 1700000000000.5 });
      expect(wish.createdAt).toBe(1700000000000.5);
    });

    it('accepts Infinity as createdAt', () => {
      const wish = createWish({ createdAt: Infinity });
      expect(wish.createdAt).toBe(Infinity);
    });

    it('accepts NaN as createdAt (number type)', () => {
      const wish = createWish({ createdAt: NaN });
      expect(typeof wish.createdAt).toBe('number');
      expect(wish.createdAt).toBeNaN();
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Edge cases — id uniqueness patterns
  // ---------------------------------------------------------------------------

  describe('id uniqueness patterns', () => {
    it('two wishes with different ids are distinguishable', () => {
      const wish1 = createWish({ id: 'unique-1' });
      const wish2 = createWish({ id: 'unique-2' });
      expect(wish1.id).not.toBe(wish2.id);
    });

    it('uuid-style ids are accepted', () => {
      const wish = createWish({ id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(wish.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('numeric string ids are accepted', () => {
      const wish = createWish({ id: '12345' });
      expect(wish.id).toBe('12345');
    });

    it('prefixed ids like "d1", "d2" are accepted', () => {
      const wish1 = createWish({ id: 'd1' });
      const wish2 = createWish({ id: 'd2' });
      expect(wish1.id).toMatch(/^d\d+$/);
      expect(wish2.id).toMatch(/^d\d+$/);
    });

    it('hash-like ids are accepted', () => {
      const wish = createWish({ id: 'abc123def456' });
      expect(wish.id).toMatch(/^[a-z0-9]+$/);
    });

    it('can build a Set of ids from an array of wishes', () => {
      const wishes = Array.from({ length: 100 }, (_, i) =>
        createWish({ id: `wish-${i}` }),
      );
      const ids = new Set(wishes.map((w) => w.id));
      expect(ids.size).toBe(100);
    });

    it('duplicate ids are technically possible (no runtime enforcement)', () => {
      const wish1 = createWish({ id: 'same-id' });
      const wish2 = createWish({ id: 'same-id' });
      expect(wish1.id).toBe(wish2.id);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Boundary values for each field
  // ---------------------------------------------------------------------------

  describe('boundary values for each field', () => {
    it('single character id', () => {
      const wish = createWish({ id: 'x' });
      expect(wish.id).toBe('x');
      expect(wish.id.length).toBe(1);
    });

    it('single character name', () => {
      const wish = createWish({ name: 'A' });
      expect(wish.name.length).toBe(1);
    });

    it('single character message', () => {
      const wish = createWish({ message: '!' });
      expect(wish.message.length).toBe(1);
    });

    it('whitespace-only name', () => {
      const wish = createWish({ name: '   ' });
      expect(wish.name.trim()).toBe('');
      expect(wish.name.length).toBe(3);
    });

    it('whitespace-only message', () => {
      const wish = createWish({ message: '\t\n ' });
      expect(wish.message.trim()).toBe('');
    });

    it('createdAt = 1 (minimum meaningful positive)', () => {
      const wish = createWish({ createdAt: 1 });
      expect(wish.createdAt).toBe(1);
    });

    it('createdAt = -0 is treated as 0', () => {
      const wish = createWish({ createdAt: -0 });
      expect(Object.is(wish.createdAt, -0)).toBe(true);
      expect(wish.createdAt === 0).toBe(true);
    });

    it('name with only special characters', () => {
      const wish = createWish({ name: '!@#$%^&*()' });
      expect(wish.name).toBe('!@#$%^&*()');
    });

    it('message with only whitespace and newlines', () => {
      const wish = createWish({ message: '\n\n\n\t\t\t   ' });
      expect(wish.message.trim()).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Stress testing — bulk creation
  // ---------------------------------------------------------------------------

  describe('stress testing: bulk creation', () => {
    it('creates 1000 wishes without error', () => {
      const wishes: GuestWishes[] = [];
      for (let i = 0; i < 1000; i++) {
        wishes.push(
          createWish({
            id: `stress-${i}`,
            name: `User ${i}`,
            message: `Message number ${i}`,
            attendance: i % 2 === 0 ? 'yes' : 'no',
            createdAt: Date.now() - i * 1000,
          }),
        );
      }
      expect(wishes).toHaveLength(1000);
    });

    it('all bulk-created wishes have unique ids', () => {
      const wishes = Array.from({ length: 500 }, (_, i) =>
        createWish({ id: `bulk-${i}` }),
      );
      const ids = wishes.map((w) => w.id);
      expect(new Set(ids).size).toBe(500);
    });

    it('bulk wishes alternate attendance correctly', () => {
      const wishes = Array.from({ length: 100 }, (_, i) =>
        createWish({ attendance: i % 2 === 0 ? 'yes' : 'no' }),
      );
      const yesCount = wishes.filter((w) => w.attendance === 'yes').length;
      const noCount = wishes.filter((w) => w.attendance === 'no').length;
      expect(yesCount).toBe(50);
      expect(noCount).toBe(50);
    });

    it('bulk creation preserves descending createdAt order', () => {
      const now = Date.now();
      const wishes = Array.from({ length: 200 }, (_, i) =>
        createWish({ createdAt: now - i * 1000 }),
      );
      for (let i = 0; i < wishes.length - 1; i++) {
        expect(wishes[i].createdAt).toBeGreaterThan(wishes[i + 1].createdAt);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Immutability and reference behavior
  // ---------------------------------------------------------------------------

  describe('immutability and reference behavior', () => {
    it('modifying a copy does not affect the original', () => {
      const original = createWish({ name: 'Original' });
      const copy = { ...original };
      copy.name = 'Modified';
      expect(original.name).toBe('Original');
      expect(copy.name).toBe('Modified');
    });

    it('two wishes with the same data are deeply equal', () => {
      const data = {
        id: 'eq-1',
        name: 'Same',
        message: 'Same msg',
        attendance: 'yes' as const,
        createdAt: 1000,
      };
      const wish1: GuestWishes = { ...data };
      const wish2: GuestWishes = { ...data };
      expect(wish1).toEqual(wish2);
    });

    it('two wishes with the same data are not reference-equal', () => {
      const data = {
        id: 'ref-1',
        name: 'Ref',
        message: 'Ref msg',
        attendance: 'yes' as const,
        createdAt: 1000,
      };
      const wish1: GuestWishes = { ...data };
      const wish2: GuestWishes = { ...data };
      expect(wish1).not.toBe(wish2);
    });

    it('JSON round-trip preserves data', () => {
      const wish = createWish({
        id: 'json-1',
        name: 'JSON Test',
        message: 'Round trip',
        createdAt: 1700000000000,
      });
      const json = JSON.stringify(wish);
      const parsed = JSON.parse(json) as GuestWishes;
      expect(parsed).toEqual(wish);
    });

    it('JSON round-trip with unicode preserves data', () => {
      const wish = createWish({
        name: 'テスト',
        message: 'Привет мир',
      });
      const parsed = JSON.parse(JSON.stringify(wish)) as GuestWishes;
      expect(parsed.name).toBe('テスト');
      expect(parsed.message).toBe('Привет мир');
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Realistic scenario tests
  // ---------------------------------------------------------------------------

  describe('realistic scenarios', () => {
    it('Indonesian name with cultural format', () => {
      const wish = createWish({
        id: 'ind-1',
        name: 'Ahmad & Keluarga',
        message: 'Selamat menempuh hidup baru!',
        attendance: 'yes',
        createdAt: 1700000000000,
      });
      expect(wish.name).toContain('&');
      expect(wish.message).toContain('Selamat');
    });

    it('Arabic prayer message', () => {
      const wish = createWish({
        message: "Baarakallahu laka wa baaraka 'alaika",
      });
      expect(wish.message).toContain('Baarakallahu');
    });

    it('short casual message', () => {
      const wish = createWish({ message: 'Congrats!' });
      expect(wish.message.length).toBeLessThan(20);
    });

    it('long heartfelt message', () => {
      const longMsg =
        'Selamat menempuh hidup baru Dani & Marini! ' +
        'Semoga menjadi keluarga sakinah mawaddah warahmah. ' +
        'Doa kami selalu menyertai langkah kalian berdua. ' +
        'Semoga selalu diberi keberkahan dan kebahagiaan.';
      const wish = createWish({ message: longMsg });
      expect(wish.message.length).toBeGreaterThan(100);
    });

    it('guest declining invitation politely', () => {
      const wish = createWish({
        name: 'Citra Lestari',
        message: 'Maaf belum bisa hadir, lancar sampai hari H ya!',
        attendance: 'no',
      });
      expect(wish.attendance).toBe('no');
      expect(wish.message).toContain('Maaf');
    });
  });
});
