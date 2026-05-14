import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockOnSnapshot = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
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

/** Simulate onSnapshot calling the success callback immediately */
function setupOnSnapshot(snap: ReturnType<typeof createMockSnap>) {
  const unsubscribe = vi.fn();
  mockOnSnapshot.mockImplementation((_ref: unknown, onNext: (s: unknown) => void) => {
    onNext(snap);
    return unsubscribe;
  });
  return unsubscribe;
}

/** Simulate onSnapshot calling the error callback immediately */
function setupOnSnapshotError(error: Error) {
  const unsubscribe = vi.fn();
  mockOnSnapshot.mockImplementation((_ref: unknown, _onNext: unknown, onError: (e: Error) => void) => {
    onError(error);
    return unsubscribe;
  });
  return unsubscribe;
}

/** Simulate onSnapshot that never fires (pending) */
function setupOnSnapshotPending() {
  const unsubscribe = vi.fn();
  mockOnSnapshot.mockReturnValue(unsubscribe);
  return unsubscribe;
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
      setupOnSnapshotPending();
      const { result } = renderHook(() => useWedding(SLUG));
      expect(result.current.wedding).toBeNull();
    });

    it('starts with isLoading true', () => {
      setupOnSnapshotPending();
      const { result } = renderHook(() => useWedding(SLUG));
      expect(result.current.isLoading).toBe(true);
    });

    it('returns an object with wedding and isLoading keys', () => {
      setupOnSnapshotPending();
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
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toEqual(MOCK_WEDDING);
    });

    it('sets isLoading to false', async () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('calls doc with correct collection and slug', () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockDoc).toHaveBeenCalledWith({ _type: 'mock-db' }, 'weddings', SLUG);
    });

    it('calls onSnapshot with the doc reference', () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockOnSnapshot).toHaveBeenCalledWith('wedding-doc-ref', expect.any(Function), expect.any(Function));
    });

    it('maps all fields from snapshot data', async () => {
      const fullData = { ...MOCK_WEDDING, musicUrl: '/music.mp3', defaultGuest: 'Tamu' };
      setupOnSnapshot(createMockSnap(true, fullData));
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
      setupOnSnapshot(createMockSnap(false));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toBeNull();
    });

    it('sets isLoading to false', async () => {
      setupOnSnapshot(createMockSnap(false));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  describe('error', () => {
    it('sets isLoading to false on error', async () => {
      setupOnSnapshotError(new Error('permission-denied'));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('wedding stays null on error', async () => {
      setupOnSnapshotError(new Error('network error'));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toBeNull();
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setupOnSnapshotError(new Error('test-error'));
      renderHook(() => useWedding(SLUG));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[useWedding] Firestore error:', 'test-error');
      });
      consoleSpy.mockRestore();
    });

    it('does not throw on error', () => {
      setupOnSnapshotError(new Error('some error'));
      expect(() => renderHook(() => useWedding(SLUG))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Slug changes
  // ---------------------------------------------------------------------------
  describe('slug changes', () => {
    it('re-subscribes when slug changes', () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useWedding(slug),
        { initialProps: { slug: 'wedding-1' } }
      );
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      rerender({ slug: 'wedding-2' });
      expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    });

    it('does not re-subscribe when slug stays the same', () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useWedding(slug),
        { initialProps: { slug: SLUG } }
      );
      rerender({ slug: SLUG });
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from previous listener on slug change', () => {
      const unsubscribe = setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useWedding(slug),
        { initialProps: { slug: 'wedding-1' } }
      );
      rerender({ slug: 'wedding-2' });
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  describe('cleanup', () => {
    it('unsubscribes on unmount', () => {
      const unsubscribe = setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { unmount } = renderHook(() => useWedding(SLUG));
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty slug', () => {
      setupOnSnapshot(createMockSnap(false));
      expect(() => renderHook(() => useWedding(''))).not.toThrow();
    });

    it('handles slug with special characters', () => {
      setupOnSnapshot(createMockSnap(false));
      expect(() => renderHook(() => useWedding('test/special'))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Real-time updates
  // ---------------------------------------------------------------------------
  describe('real-time updates', () => {
    it('updates wedding when snapshot changes', async () => {
      let capturedOnNext: ((snap: unknown) => void) | null = null;
      mockOnSnapshot.mockImplementation((_ref: unknown, onNext: (s: unknown) => void) => {
        capturedOnNext = onNext;
        onNext(createMockSnap(true, MOCK_WEDDING));
        return vi.fn();
      });

      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.wedding).toEqual(MOCK_WEDDING));

      // Simulate a Firestore update
      const updated = { ...MOCK_WEDDING, groomNickname: 'Updated' };
      capturedOnNext!(createMockSnap(true, updated));

      await waitFor(() => expect(result.current.wedding?.groomNickname).toBe('Updated'));
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('subscribes once per mount', () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      renderHook(() => useWedding(SLUG));
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });

    it('returns consistent data after loading', async () => {
      setupOnSnapshot(createMockSnap(true, MOCK_WEDDING));
      const { result } = renderHook(() => useWedding(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wedding).toEqual(MOCK_WEDDING);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
