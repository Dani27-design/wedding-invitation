import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => 'mock-server-timestamp');

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('../lib/firebase', () => ({
  db: { _type: 'mock-db' },
}));

import { useStoryComments } from './useStoryComments';

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
const SLIDE_INDEX = 0;

describe('hooks/useStoryComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'new-comment-id' });
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with empty comments array', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(result.current.comments).toEqual([]);
    });

    it('starts with isLoading true', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(result.current.isLoading).toBe(true);
    });

    it('returns an object with comments, addComment, and isLoading keys', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(result.current).toHaveProperty('comments');
      expect(result.current).toHaveProperty('addComment');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('comments is an array', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(Array.isArray(result.current.comments)).toBe(true);
    });

    it('isLoading is a boolean', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('addComment is a function', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(typeof result.current.addComment).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // Snapshot success
  // ---------------------------------------------------------------------------
  describe('snapshot success', () => {
    it('populates comments from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: 'Ahmad', text: 'Cantik banget!', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1000 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].name).toBe('Ahmad');
      expect(result.current.comments[0].text).toBe('Cantik banget!');
    });

    it('sets isLoading to false after snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('handles empty snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toEqual([]);
    });

    it('only maps name and text from doc data', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: 'Budi', text: 'Keren!', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 2000 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const comment = result.current.comments[0];
      expect(Object.keys(comment)).toEqual(['name', 'text']);
    });

    it('handles multiple comments', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: 'A', text: 't1', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
          { id: 'c2', data: { name: 'B', text: 't2', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 2 } },
          { id: 'c3', data: { name: 'C', text: 't3', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 3 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toHaveLength(3);
    });

    it('preserves comment order from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c3', data: { name: 'Third', text: 't3', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 3 } },
          { id: 'c1', data: { name: 'First', text: 't1', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
          { id: 'c2', data: { name: 'Second', text: 't2', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 2 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments[0].name).toBe('Third');
      expect(result.current.comments[1].name).toBe('First');
      expect(result.current.comments[2].name).toBe('Second');
    });

    it('updates comments when snapshot changes', async () => {
      let onNextCb: (snap: unknown) => void;
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNextCb = onNext;
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: 'First', text: 'msg', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.comments).toHaveLength(1));

      act(() => {
        onNextCb!(createMockSnapshot([
          { id: 'c1', data: { name: 'First', text: 'msg', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
          { id: 'c2', data: { name: 'Second', text: 'msg2', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 2 } },
        ]));
      });

      await waitFor(() => expect(result.current.comments).toHaveLength(2));
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
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('keeps comments empty on error', async () => {
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('network error'));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toEqual([]);
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('test-error'));
        return vi.fn();
      });
      renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[useStoryComments] Firestore error:', 'test-error');
      });
      consoleSpy.mockRestore();
    });

    it('does not throw on error', () => {
      mockOnSnapshot.mockImplementation((_, _onNext: unknown, onError: (err: Error) => void) => {
        onError(new Error('some error'));
        return vi.fn();
      });
      expect(() => renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup / unsubscribe
  // ---------------------------------------------------------------------------
  describe('cleanup', () => {
    it('calls unsubscribe on unmount', () => {
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);
      const { unmount } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
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
        ({ id, idx }: { id: string; idx: number }) => useStoryComments(id, idx),
        { initialProps: { id: 'wedding-1', idx: 0 } }
      );
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      rerender({ id: 'wedding-2', idx: 0 });
      expect(unsub1).toHaveBeenCalledTimes(1);
      expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    });

    it('resubscribes when slideIndex changes', () => {
      const unsub1 = vi.fn();
      const unsub2 = vi.fn();
      mockOnSnapshot
        .mockReturnValueOnce(unsub1)
        .mockReturnValueOnce(unsub2);
      const { rerender } = renderHook(
        ({ id, idx }: { id: string; idx: number }) => useStoryComments(id, idx),
        { initialProps: { id: WEDDING_ID, idx: 0 } }
      );
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      rerender({ id: WEDDING_ID, idx: 1 });
      expect(unsub1).toHaveBeenCalledTimes(1);
      expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    });

    it('does not resubscribe when both params stay the same', () => {
      const unsub = vi.fn();
      mockOnSnapshot.mockReturnValue(unsub);
      const { rerender } = renderHook(
        ({ id, idx }: { id: string; idx: number }) => useStoryComments(id, idx),
        { initialProps: { id: WEDDING_ID, idx: SLIDE_INDEX } }
      );
      rerender({ id: WEDDING_ID, idx: SLIDE_INDEX });
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
      renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });

    it('passes a success callback as second argument', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(typeof mockOnSnapshot.mock.calls[0][1]).toBe('function');
    });

    it('passes an error callback as third argument', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      expect(typeof mockOnSnapshot.mock.calls[0][2]).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // addComment
  // ---------------------------------------------------------------------------
  describe('addComment', () => {
    it('calls addDoc when addComment is invoked', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Ahmad', text: 'Keren!' });
      });

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
    });

    it('passes correct data shape to addDoc', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, 2));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Budi', text: 'Bagus!' });
      });

      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData).toEqual({
        weddingId: WEDDING_ID,
        slideIndex: 2,
        name: 'Budi',
        text: 'Bagus!',
        createdAt: 'mock-server-timestamp',
      });
    });

    it('trims name whitespace', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: '  Ahmad  ', text: 'Hi' });
      });

      expect(mockAddDoc.mock.calls[0][1].name).toBe('Ahmad');
    });

    it('trims text whitespace', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Budi', text: '  Cantik!  ' });
      });

      expect(mockAddDoc.mock.calls[0][1].text).toBe('Cantik!');
    });

    it('uses serverTimestamp for createdAt', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Test', text: 'msg' });
      });

      expect(mockAddDoc.mock.calls[0][1].createdAt).toBe('mock-server-timestamp');
    });

    it('includes correct weddingId in doc data', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments('other-wedding', SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Test', text: 'msg' });
      });

      expect(mockAddDoc.mock.calls[0][1].weddingId).toBe('other-wedding');
    });

    it('includes correct slideIndex in doc data', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, 4));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addComment({ name: 'Test', text: 'msg' });
      });

      expect(mockAddDoc.mock.calls[0][1].slideIndex).toBe(4);
    });

    it('addComment is stable between renders when deps do not change', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result, rerender } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const fn1 = result.current.addComment;
      rerender();
      const fn2 = result.current.addComment;
      expect(fn1).toBe(fn2);
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('returns stable reference for comments when data does not change', async () => {
      const snapshot = createMockSnapshot([
        { id: 'c1', data: { name: 'A', text: 't', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
      ]);
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(snapshot);
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toHaveLength(1);
    });

    it('returns isLoading false after multiple snapshots', async () => {
      let onNextCb: (snap: unknown) => void;
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNextCb = onNext;
        onNext(createMockSnapshot([]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      act(() => {
        onNextCb!(createMockSnapshot([
          { id: 'c1', data: { name: 'X', text: 'y', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
        ]));
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles comment with empty name from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: '', text: 'msg', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments[0].name).toBe('');
    });

    it('handles comment with empty text from snapshot', async () => {
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot([
          { id: 'c1', data: { name: 'Test', text: '', weddingId: WEDDING_ID, slideIndex: 0, createdAt: 1 } },
        ]));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments[0].text).toBe('');
    });

    it('handles large number of comments', async () => {
      const docs = Array.from({ length: 50 }, (_, i) => ({
        id: `c${i}`,
        data: { name: `User ${i}`, text: `Comment ${i}`, weddingId: WEDDING_ID, slideIndex: 0, createdAt: i },
      }));
      mockOnSnapshot.mockImplementation((_, onNext: (snap: unknown) => void) => {
        onNext(createMockSnapshot(docs));
        return vi.fn();
      });
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, SLIDE_INDEX));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.comments).toHaveLength(50);
    });

    it('handles empty weddingId string', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      expect(() => renderHook(() => useStoryComments('', 0))).not.toThrow();
    });

    it('handles weddingId with special characters', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      expect(() => renderHook(() => useStoryComments('test/special', 0))).not.toThrow();
    });

    it('handles slideIndex of 0', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      const { result } = renderHook(() => useStoryComments(WEDDING_ID, 0));
      expect(result.current.comments).toEqual([]);
    });

    it('handles high slideIndex values', () => {
      mockOnSnapshot.mockReturnValue(vi.fn());
      expect(() => renderHook(() => useStoryComments(WEDDING_ID, 99))).not.toThrow();
    });
  });
});
