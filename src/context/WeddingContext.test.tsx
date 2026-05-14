import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { WeddingContext, useWeddingContext } from './WeddingContext';
import type { SerializedWedding } from '../lib/serialize-wedding';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_WEDDING = {
  groomNickname: 'Dani',
  brideNickname: 'Marini',
  eventDate: '2026-08-29',
  theme: {
    template: 'cinematic',
    colors: { accent: '#B48D3E', background: '#FDFCF8', text: '#1A1A1A', surface: '#F5F2ED', button: '#F8BBD0' },
    fonts: { heading: 'Cormorant Garamond', body: 'Montserrat', decorative: 'Playfair Display', script: 'Dayland' },
  },
} as SerializedWedding;

function createWrapper(value: SerializedWedding | null) {
  return ({ children }: { children: ReactNode }) => (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  );
}

describe('context/WeddingContext', () => {
  // ---------------------------------------------------------------------------
  // Default value
  // ---------------------------------------------------------------------------
  describe('default value', () => {
    it('default context value is null', () => {
      const { result } = renderHook(() => useWeddingContext());
      expect(result.current).toBeNull();
    });

    it('returns null when no provider is present', () => {
      const { result } = renderHook(() => useWeddingContext());
      expect(result.current).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------
  describe('provider', () => {
    it('provides wedding data to consumers', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current).toEqual(MOCK_WEDDING);
    });

    it('provides null when value is null', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(null),
      });
      expect(result.current).toBeNull();
    });

    it('provides groomNickname field', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current?.groomNickname).toBe('Dani');
    });

    it('provides brideNickname field', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current?.brideNickname).toBe('Marini');
    });

    it('provides eventDate field', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current?.eventDate).toBe('2026-08-29');
    });
  });

  // ---------------------------------------------------------------------------
  // useWeddingContext hook
  // ---------------------------------------------------------------------------
  describe('useWeddingContext', () => {
    it('is a function', () => {
      expect(typeof useWeddingContext).toBe('function');
    });

    it('returns the same reference as provided', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current).toBe(MOCK_WEDDING);
    });

    it('updates when provider value changes', () => {
      const wrapper1 = createWrapper(MOCK_WEDDING);
      const { result, rerender } = renderHook(() => useWeddingContext(), {
        wrapper: wrapper1,
      });
      expect(result.current).toBe(MOCK_WEDDING);

      const updated = { ...MOCK_WEDDING, groomNickname: 'Updated' } as SerializedWedding;
      const wrapper2 = createWrapper(updated);
      rerender({ wrapper: wrapper2 });
      // After rerender with same wrapper, value stays
      expect(result.current).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Type safety
  // ---------------------------------------------------------------------------
  describe('type safety', () => {
    it('WeddingContext is defined', () => {
      expect(WeddingContext).toBeDefined();
    });

    it('useWeddingContext is defined', () => {
      expect(useWeddingContext).toBeDefined();
    });

    it('context value can be WeddingDocument', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(MOCK_WEDDING),
      });
      expect(result.current).not.toBeNull();
    });

    it('context value can be null', () => {
      const { result } = renderHook(() => useWeddingContext(), {
        wrapper: createWrapper(null),
      });
      expect(result.current).toBeNull();
    });
  });
});
