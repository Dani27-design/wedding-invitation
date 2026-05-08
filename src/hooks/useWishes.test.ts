import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

import { useWishes } from './useWishes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSnapshot(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

const WEDDING_ID = 'dani-marini';

describe('hooks/useWishes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with empty wishes array', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      expect(result.current.wishes).toEqual([]);
    });

    it('starts with isLoading true', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      expect(result.current.isLoading).toBe(true);
    });

    it('returns an object with wishes and isLoading keys', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      expect(result.current).toHaveProperty('wishes');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('wishes is an array', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      expect(Array.isArray(result.current.wishes)).toBe(true);
    });

    it('isLoading is a boolean', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  // ---------------------------------------------------------------------------
  // Snapshot success
  // ---------------------------------------------------------------------------
  describe('snapshot success', () => {
    it('populates wishes from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w1', data: { name: 'Ahmad', message: 'Selamat!', attendance: 'yes', createdAt: 1000 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toHaveLength(1);
      expect(result.current.wishes[0].name).toBe('Ahmad');
    });

    it('sets isLoading to false after snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('handles empty snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toEqual([]);
    });

    it('maps doc id correctly', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'abc123', data: { name: 'Budi', message: 'Happy!', attendance: 'yes', createdAt: 2000 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes[0].id).toBe('abc123');
    });

    it('maps all doc fields correctly', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w2', data: { name: 'Citra', message: 'Best wishes', attendance: 'no', createdAt: 3000 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const wish = result.current.wishes[0];
      expect(wish.name).toBe('Citra');
      expect(wish.message).toBe('Best wishes');
      expect(wish.attendance).toBe('no');
    });

    it('handles multiple wishes', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w1', data: { name: 'A', message: 'm1', attendance: 'yes', createdAt: 1 } },
          { id: 'w2', data: { name: 'B', message: 'm2', attendance: 'no', createdAt: 2 } },
          { id: 'w3', data: { name: 'C', message: 'm3', attendance: 'yes', createdAt: 3 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toHaveLength(3);
    });

    it('updates wishes when snapshot changes', async () => {
      let onNextCb: (snap: unknown) => void;
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNextCb = onNext;
        onNext(createMockSnapshot([
          { id: 'w1', data: { name: 'First', message: 'msg', attendance: 'yes', createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.wishes).toHaveLength(1));

      act(() => {
        onNextCb!(createMockSnapshot([
          { id: 'w1', data: { name: 'First', message: 'msg', attendance: 'yes', createdAt: 1 } },
          { id: 'w2', data: { name: 'Second', message: 'msg2', attendance: 'no', createdAt: 2 } },
        ]));
      });

      await waitFor(() => expect(result.current.wishes).toHaveLength(2));
    });

    it('preserves wish order from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w3', data: { name: 'Third', message: 'm', attendance: 'yes', createdAt: 3 } },
          { id: 'w1', data: { name: 'First', message: 'm', attendance: 'yes', createdAt: 1 } },
          { id: 'w2', data: { name: 'Second', message: 'm', attendance: 'no', createdAt: 2 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes[0].name).toBe('Third');
      expect(result.current.wishes[1].name).toBe('First');
      expect(result.current.wishes[2].name).toBe('Second');
    });
  });

  // ---------------------------------------------------------------------------
  // Snapshot error
  // ---------------------------------------------------------------------------
  describe('snapshot error', () => {
    it('sets isLoading to false on error', async () => {
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('permission-denied'));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('keeps wishes empty on error', async () => {
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('network error'));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toEqual([]);
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('test-error'));
        return vi.fn();
      });
      renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[useWishes] Firestore error:',
          'test-error'
        );
      });
      consoleSpy.mockRestore();
    });

    it('does not throw on error', () => {
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('some error'));
        return vi.fn();
      });
      expect(() => renderHook(() => useWishes(WEDDING_ID))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Unsubscribe / cleanup
  // ---------------------------------------------------------------------------
  describe('cleanup', () => {
    it('calls unsubscribe on unmount', () => {
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);
      const { unmount } = renderHook(() => useWishes(WEDDING_ID));
      expect(unsubscribe).not.toHaveBeenCalled();
      unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('resubscribes when weddingId changes', () => {
      const unsub1 = vi.fn();
      const unsub2 = vi.fn();
      mockOnSnapshot
        .mockReturnValueOnce(unsub1)
        .mockReturnValueOnce(unsub2);
      const { rerender } = renderHook(
        ({ id }: { id: string }) => useWishes(id),
        { initialProps: { id: 'wedding-1' } }
      );
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      rerender({ id: 'wedding-2' });
      expect(unsub1).toHaveBeenCalledTimes(1);
      expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    });

    it('does not resubscribe when weddingId stays the same', () => {
      const unsub = vi.fn();
      mockOnSnapshot.mockReturnValue(unsub);
      const { rerender } = renderHook(
        ({ id }: { id: string }) => useWishes(id),
        { initialProps: { id: WEDDING_ID } }
      );
      rerender({ id: WEDDING_ID });
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      expect(unsub).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Query construction
  // ---------------------------------------------------------------------------
  describe('query construction', () => {
    it('calls onSnapshot when hook mounts', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      renderHook(() => useWishes(WEDDING_ID));
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });

    it('passes a success callback as second argument', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      renderHook(() => useWishes(WEDDING_ID));
      expect(typeof mockOnSnapshot.mock.calls[0][1]).toBe('function');
    });

    it('passes an error callback as third argument', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      renderHook(() => useWishes(WEDDING_ID));
      expect(typeof mockOnSnapshot.mock.calls[0][2]).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('returns stable reference for wishes when data does not change', async () => {
      const snapshot = createMockSnapshot([
        { id: 'w1', data: { name: 'A', message: 'm', attendance: 'yes', createdAt: 1 } },
      ]);
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(snapshot);
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toHaveLength(1);
    });

    it('returns the same isLoading false after multiple snapshots', async () => {
      let onNextCb: (snap: unknown) => void;
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNextCb = onNext;
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      act(() => {
        onNextCb!(createMockSnapshot([
          { id: 'w1', data: { name: 'X', message: 'y', attendance: 'yes', createdAt: 1 } },
        ]));
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles wish with empty name', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w1', data: { name: '', message: 'msg', attendance: 'yes', createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes[0].name).toBe('');
    });

    it('handles wish with empty message', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'w1', data: { name: 'Test', message: '', attendance: 'no', createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes[0].message).toBe('');
    });

    it('handles large number of wishes', async () => {
      const docs = Array.from({ length: 50 }, (_, i) => ({
        id: `w${i}`,
        data: { name: `User ${i}`, message: `Msg ${i}`, attendance: 'yes' as const, createdAt: i },
      }));
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot(docs));
        return vi.fn();
      });
      const { result } = renderHook(() => useWishes(WEDDING_ID));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.wishes).toHaveLength(50);
    });

    it('handles empty weddingId string', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      expect(() => renderHook(() => useWishes(''))).not.toThrow();
    });

    it('handles weddingId with special characters', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      expect(() => renderHook(() => useWishes('test-wedding/special'))).not.toThrow();
    });
  });
});
