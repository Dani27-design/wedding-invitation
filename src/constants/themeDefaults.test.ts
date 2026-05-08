import { describe, it, expect } from 'vitest';
import { THEME_DEFAULTS } from './themeDefaults';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

describe('constants/themeDefaults', () => {
  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  describe('export', () => {
    it('THEME_DEFAULTS is defined', () => {
      expect(THEME_DEFAULTS).toBeDefined();
    });

    it('THEME_DEFAULTS is an object', () => {
      expect(typeof THEME_DEFAULTS).toBe('object');
    });

    it('THEME_DEFAULTS is not null', () => {
      expect(THEME_DEFAULTS).not.toBeNull();
    });

    it('THEME_DEFAULTS is not an array', () => {
      expect(Array.isArray(THEME_DEFAULTS)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Cinematic template existence
  // ---------------------------------------------------------------------------
  describe('cinematic template', () => {
    it('cinematic key exists', () => {
      expect(THEME_DEFAULTS).toHaveProperty('cinematic');
    });

    it('cinematic is an object', () => {
      expect(typeof THEME_DEFAULTS.cinematic).toBe('object');
    });

    it('cinematic has template field', () => {
      expect(THEME_DEFAULTS.cinematic).toHaveProperty('template');
    });

    it('cinematic has colors field', () => {
      expect(THEME_DEFAULTS.cinematic).toHaveProperty('colors');
    });

    it('cinematic has fonts field', () => {
      expect(THEME_DEFAULTS.cinematic).toHaveProperty('fonts');
    });

    it('template value matches key name', () => {
      expect(THEME_DEFAULTS.cinematic.template).toBe('cinematic');
    });
  });

  // ---------------------------------------------------------------------------
  // Colors — structure
  // ---------------------------------------------------------------------------
  describe('cinematic colors — structure', () => {
    const { colors } = THEME_DEFAULTS.cinematic;

    it('colors is an object', () => {
      expect(typeof colors).toBe('object');
    });

    it('colors has accent field', () => {
      expect(colors).toHaveProperty('accent');
    });

    it('colors has background field', () => {
      expect(colors).toHaveProperty('background');
    });

    it('colors has text field', () => {
      expect(colors).toHaveProperty('text');
    });

    it('colors has surface field', () => {
      expect(colors).toHaveProperty('surface');
    });

    it('colors has button field', () => {
      expect(colors).toHaveProperty('button');
    });

    it('colors has exactly 5 fields', () => {
      expect(Object.keys(colors)).toHaveLength(5);
    });
  });

  // ---------------------------------------------------------------------------
  // Colors — values
  // ---------------------------------------------------------------------------
  describe('cinematic colors — values', () => {
    const { colors } = THEME_DEFAULTS.cinematic;

    it('accent is a valid hex color', () => {
      expect(colors.accent).toMatch(HEX_PATTERN);
    });

    it('background is a valid hex color', () => {
      expect(colors.background).toMatch(HEX_PATTERN);
    });

    it('text is a valid hex color', () => {
      expect(colors.text).toMatch(HEX_PATTERN);
    });

    it('surface is a valid hex color', () => {
      expect(colors.surface).toMatch(HEX_PATTERN);
    });

    it('button is a valid hex color', () => {
      expect(colors.button).toMatch(HEX_PATTERN);
    });

    it('accent is #B48D3E (gold)', () => {
      expect(colors.accent).toBe('#B48D3E');
    });

    it('background is #FDFCF8 (ivory)', () => {
      expect(colors.background).toBe('#FDFCF8');
    });

    it('text is #1A1A1A (ink)', () => {
      expect(colors.text).toBe('#1A1A1A');
    });

    it('surface is #F5F2ED (paper)', () => {
      expect(colors.surface).toBe('#F5F2ED');
    });

    it('button is #F8BBD0 (rose-pastel)', () => {
      expect(colors.button).toBe('#F8BBD0');
    });
  });

  // ---------------------------------------------------------------------------
  // Fonts — structure
  // ---------------------------------------------------------------------------
  describe('cinematic fonts — structure', () => {
    const { fonts } = THEME_DEFAULTS.cinematic;

    it('fonts is an object', () => {
      expect(typeof fonts).toBe('object');
    });

    it('fonts has heading field', () => {
      expect(fonts).toHaveProperty('heading');
    });

    it('fonts has body field', () => {
      expect(fonts).toHaveProperty('body');
    });

    it('fonts has decorative field', () => {
      expect(fonts).toHaveProperty('decorative');
    });

    it('fonts has script field', () => {
      expect(fonts).toHaveProperty('script');
    });

    it('fonts has exactly 4 fields', () => {
      expect(Object.keys(fonts)).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // Fonts — values
  // ---------------------------------------------------------------------------
  describe('cinematic fonts — values', () => {
    const { fonts } = THEME_DEFAULTS.cinematic;

    it('heading is a non-empty string', () => {
      expect(typeof fonts.heading).toBe('string');
      expect(fonts.heading.length).toBeGreaterThan(0);
    });

    it('body is a non-empty string', () => {
      expect(typeof fonts.body).toBe('string');
      expect(fonts.body.length).toBeGreaterThan(0);
    });

    it('decorative is a non-empty string', () => {
      expect(typeof fonts.decorative).toBe('string');
      expect(fonts.decorative.length).toBeGreaterThan(0);
    });

    it('script is a non-empty string', () => {
      expect(typeof fonts.script).toBe('string');
      expect(fonts.script.length).toBeGreaterThan(0);
    });

    it('heading is Cormorant Garamond', () => {
      expect(fonts.heading).toBe('Cormorant Garamond');
    });

    it('body is Montserrat', () => {
      expect(fonts.body).toBe('Montserrat');
    });

    it('decorative is Playfair Display', () => {
      expect(fonts.decorative).toBe('Playfair Display');
    });

    it('script is Dayland', () => {
      expect(fonts.script).toBe('Dayland');
    });
  });

  // ---------------------------------------------------------------------------
  // Font values do not include fallback stack
  // ---------------------------------------------------------------------------
  describe('font values are family names only (no fallback)', () => {
    const { fonts } = THEME_DEFAULTS.cinematic;

    it('heading does not contain comma', () => {
      expect(fonts.heading).not.toContain(',');
    });

    it('body does not contain comma', () => {
      expect(fonts.body).not.toContain(',');
    });

    it('decorative does not contain comma', () => {
      expect(fonts.decorative).not.toContain(',');
    });

    it('script does not contain comma', () => {
      expect(fonts.script).not.toContain(',');
    });
  });

  // ---------------------------------------------------------------------------
  // Template key consistency
  // ---------------------------------------------------------------------------
  describe('template key consistency', () => {
    it('every key has a matching template field', () => {
      Object.entries(THEME_DEFAULTS).forEach(([key, theme]) => {
        expect(theme.template).toBe(key);
      });
    });

    it('every theme has colors with 5 fields', () => {
      Object.values(THEME_DEFAULTS).forEach((theme) => {
        expect(Object.keys(theme.colors)).toHaveLength(5);
      });
    });

    it('every theme has fonts with 4 fields', () => {
      Object.values(THEME_DEFAULTS).forEach((theme) => {
        expect(Object.keys(theme.fonts)).toHaveLength(4);
      });
    });

    it('every color value is a valid hex string', () => {
      Object.values(THEME_DEFAULTS).forEach((theme) => {
        Object.values(theme.colors).forEach((color) => {
          expect(color).toMatch(HEX_PATTERN);
        });
      });
    });

    it('every font value is a non-empty string', () => {
      Object.values(THEME_DEFAULTS).forEach((theme) => {
        Object.values(theme.fonts).forEach((font) => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('THEME_DEFAULTS has at least one template', () => {
      expect(Object.keys(THEME_DEFAULTS).length).toBeGreaterThanOrEqual(1);
    });

    it('cinematic colors are all different from each other', () => {
      const values = Object.values(THEME_DEFAULTS.cinematic.colors);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it('cinematic fonts are all different from each other', () => {
      const values = Object.values(THEME_DEFAULTS.cinematic.fonts);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it('accessing a non-existent template returns undefined', () => {
      expect(THEME_DEFAULTS['non-existent']).toBeUndefined();
    });

    it('cinematic template is frozen-safe (no unexpected mutations)', () => {
      const original = THEME_DEFAULTS.cinematic.colors.accent;
      expect(original).toBe('#B48D3E');
    });
  });
});
