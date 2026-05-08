import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

vi.mock('../lib/firebase', () => ({
  db: { _type: 'mock-db' },
}));

import { useWedding } from './useWedding';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSnap(exists: boolean, data: Record<string, unknown> = {}) {
  return {
    exists: () => exists,
    data: () => data,
  };
}

const MOCK_WEDDING = {
  groomNickname: 'Dani',
  brideNickname: 'Marini',
  eventDate: '2026-08-29',
  eventCity: 'Surabaya',
};

const SLUG = 'dani-marini';

describe('hooks/useWedding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('wedding-doc-ref');
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with wedding as null', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useWedding(SLUG));
      expect(result.current.wedding).toBeNull();
    });

    it('starts with isLoading true', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useWedding(SLUG));
      expect(result.current.isLoading).toBe(true);
    });

    it('returns an object with wedding and isLoading keys', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useWedding(SLUG));
      expect(result.current).toHaveProperty('wedding');
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  // ---------------------------------------------------------------------------
  // Success — document exists
  // ---------------------------------------------------------------------------
  describe('success — document exists', () => {
    it('populates wedding from snapshot', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toEqual(MOCK_WEDDING);
    });

    it('sets isLoading to false', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('calls doc with correct collection and slug', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockDoc).toHaveBeenCalledWith({ _type: 'mock-db' }, 'weddings', SLUG);
    });

    it('calls getDoc with the doc reference', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockGetDoc).toHaveBeenCalledWith('wedding-doc-ref');
    });

    it('maps all fields from snapshot data', async () => {
      const fullData = { ...MOCK_WEDDING, musicUrl: '/music.mp3', defaultGuest: 'Tamu' };
      mockGetDoc.mockResolvedValue(createMockSnap(true, fullData));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toEqual(fullData);
    });
  });

  // ---------------------------------------------------------------------------
  // Success — document does not exist
  // ---------------------------------------------------------------------------
  describe('success — document does not exist', () => {
    it('wedding stays null', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toBeNull();
    });

    it('sets isLoading to false', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  describe('error', () => {
    it('sets isLoading to false on error', async () => {
      mockGetDoc.mockRejectedValue(new Error('permission-denied'));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('wedding stays null on error', async () => {
      mockGetDoc.mockRejectedValue(new Error('network error'));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toBeNull();
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetDoc.mockRejectedValue(new Error('test-error'));
      renderHook(() => useWedding(SLUG));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[useWedding] Firestore error:', 'test-error');
      });
      consoleSpy.mockRestore();
    });

    it('does not throw on error', () => {
      mockGetDoc.mockRejectedValue(new Error('some error'));
      expect(() => renderHook(() => useWedding(SLUG))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Slug changes
  // ---------------------------------------------------------------------------
  describe('slug changes', () => {
    it('re-fetches when slug changes', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useWedding(slug),
        { initialProps: { slug: 'wedding-1' } }
      );
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      rerender({ slug: 'wedding-2' });
      expect(mockGetDoc).toHaveBeenCalledTimes(2);
    });

    it('does not re-fetch when slug stays the same', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useWedding(slug),
        { initialProps: { slug: SLUG } }
      );
      rerender({ slug: SLUG });
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty slug', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      expect(() => renderHook(() => useWedding(''))).not.toThrow();
    });

    it('handles slug with special characters', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      expect(() => renderHook(() => useWedding('test/special'))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('always calls getDoc once per mount', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });

    it('returns consistent data after loading', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toEqual(MOCK_WEDDING);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
