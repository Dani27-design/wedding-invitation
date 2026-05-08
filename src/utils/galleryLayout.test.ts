import { describe, it, expect } from 'vitest';
import { getGalleryLayout } from './galleryLayout';

describe('utils/galleryLayout', () => {
  // ---------------------------------------------------------------------------
  // Basic functionality
  // ---------------------------------------------------------------------------
  describe('basic functionality', () => {
    it('returns an object with span and shape keys', () => {
      const layout = getGalleryLayout(0);
      expect(layout).toHaveProperty('span');
      expect(layout).toHaveProperty('shape');
    });

    it('span is a non-empty string', () => {
      const layout = getGalleryLayout(0);
      expect(typeof layout.span).toBe('string');
      expect(layout.span.length).toBeGreaterThan(0);
    });

    it('shape is a non-empty string', () => {
      const layout = getGalleryLayout(0);
      expect(typeof layout.shape).toBe('string');
      expect(layout.shape.length).toBeGreaterThan(0);
    });

    it('span contains col-span', () => {
      const layout = getGalleryLayout(0);
      expect(layout.span).toContain('col-span');
    });

    it('span contains row-span', () => {
      const layout = getGalleryLayout(0);
      expect(layout.span).toContain('row-span');
    });

    it('shape contains rounded-', () => {
      const layout = getGalleryLayout(0);
      expect(layout.shape).toContain('rounded-');
    });
  });

  // ---------------------------------------------------------------------------
  // Specific indices (0-11)
  // ---------------------------------------------------------------------------
  describe('specific indices', () => {
    it('index 0: col-span-1 row-span-1', () => {
      expect(getGalleryLayout(0).span).toBe('col-span-1 row-span-1');
    });

    it('index 1: col-span-2 row-span-2', () => {
      expect(getGalleryLayout(1).span).toBe('col-span-2 row-span-2');
    });

    it('index 2: col-span-1 row-span-1', () => {
      expect(getGalleryLayout(2).span).toBe('col-span-1 row-span-1');
    });

    it('index 3: col-span-2 row-span-1', () => {
      expect(getGalleryLayout(3).span).toBe('col-span-2 row-span-1');
    });

    it('index 4: col-span-1 row-span-2', () => {
      expect(getGalleryLayout(4).span).toBe('col-span-1 row-span-2');
    });

    it('index 8: col-span-2 row-span-1', () => {
      expect(getGalleryLayout(8).span).toBe('col-span-2 row-span-1');
    });

    it('index 11: col-span-2 row-span-1', () => {
      expect(getGalleryLayout(11).span).toBe('col-span-2 row-span-1');
    });

    it('all 12 patterns produce unique shapes', () => {
      const shapes = new Set(Array.from({ length: 12 }, (_, i) => getGalleryLayout(i).shape));
      expect(shapes.size).toBe(12);
    });

    it('returns 12 total layout patterns', () => {
      const layouts = Array.from({ length: 12 }, (_, i) => getGalleryLayout(i));
      expect(layouts).toHaveLength(12);
    });
  });

  // ---------------------------------------------------------------------------
  // Modulo cycling
  // ---------------------------------------------------------------------------
  describe('modulo cycling', () => {
    it('index 12 returns same as index 0', () => {
      expect(getGalleryLayout(12)).toEqual(getGalleryLayout(0));
    });

    it('index 13 returns same as index 1', () => {
      expect(getGalleryLayout(13)).toEqual(getGalleryLayout(1));
    });

    it('index 24 returns same as index 0', () => {
      expect(getGalleryLayout(24)).toEqual(getGalleryLayout(0));
    });

    it('index 23 returns same as index 11', () => {
      expect(getGalleryLayout(23)).toEqual(getGalleryLayout(11));
    });

    it('large index cycles correctly', () => {
      expect(getGalleryLayout(100)).toEqual(getGalleryLayout(100 % 12));
    });

    it('index 0 and index 12 have same span', () => {
      expect(getGalleryLayout(0).span).toBe(getGalleryLayout(12).span);
    });

    it('index 0 and index 12 have same shape', () => {
      expect(getGalleryLayout(0).shape).toBe(getGalleryLayout(12).shape);
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('same index returns same result', () => {
      expect(getGalleryLayout(5)).toEqual(getGalleryLayout(5));
    });

    it('100 calls with same index produce same result', () => {
      const baseline = getGalleryLayout(3);
      for (let i = 0; i < 100; i++) {
        expect(getGalleryLayout(3)).toEqual(baseline);
      }
    });

    it('different indices within 0-11 produce at least some different spans', () => {
      const spans = new Set(Array.from({ length: 12 }, (_, i) => getGalleryLayout(i).span));
      expect(spans.size).toBeGreaterThan(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('does not throw for index 0', () => {
      expect(() => getGalleryLayout(0)).not.toThrow();
    });

    it('does not throw for large index', () => {
      expect(() => getGalleryLayout(9999)).not.toThrow();
    });

    it('all 12 patterns have both span and shape', () => {
      for (let i = 0; i < 12; i++) {
        const layout = getGalleryLayout(i);
        expect(layout.span).toBeTruthy();
        expect(layout.shape).toBeTruthy();
      }
    });
  });
});
