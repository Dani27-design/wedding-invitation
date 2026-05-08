import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();
const mockRunTransaction = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
}));

vi.mock('../lib/firebase', () => ({
  db: { _type: 'mock-db' },
}));

import { useStoryLikes } from './useStoryLikes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSnap(exists: boolean, data: Record<string, unknown> = {}) {
  return {
    exists: () => exists,
    data: () => data,
  };
}

const SLUG = 'dani-marini';
const INITIAL_LIKES = [142, 167, 128, 155, 139, 163];

describe('hooks/useStoryLikes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('story-likes-doc-ref');
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with empty likes array', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(result.current.likes).toEqual([]);
    });

    it('starts with isLoading true', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(result.current.isLoading).toBe(true);
    });

    it('returns an object with likes, incrementLike, and isLoading keys', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(result.current).toHaveProperty('likes');
      expect(result.current).toHaveProperty('incrementLike');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('likes is an array', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(Array.isArray(result.current.likes)).toBe(true);
    });

    it('isLoading is a boolean', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('incrementLike is a function', () => {
      mockGetDoc.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      expect(typeof result.current.incrementLike).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // Success — document exists
  // ---------------------------------------------------------------------------
  describe('success — document exists', () => {
    it('populates likes from snapshot', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual(INITIAL_LIKES);
    });

    it('sets isLoading to false', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('calls doc with correct collection and slug', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      renderHook(() => useStoryLikes(SLUG));
      expect(mockDoc).toHaveBeenCalledWith({ _type: 'mock-db' }, 'story-likes', SLUG);
    });

    it('calls getDoc with the doc reference', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      renderHook(() => useStoryLikes(SLUG));
      expect(mockGetDoc).toHaveBeenCalledWith('story-likes-doc-ref');
    });

    it('handles likes with different lengths', async () => {
      const shortLikes = [10, 20, 30];
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: shortLikes }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual(shortLikes);
      expect(result.current.likes).toHaveLength(3);
    });

    it('handles likes with zero values', async () => {
      const zeroLikes = [0, 0, 0, 0, 0, 0];
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: zeroLikes }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual(zeroLikes);
    });
  });

  // ---------------------------------------------------------------------------
  // Success — document does not exist
  // ---------------------------------------------------------------------------
  describe('success — document does not exist', () => {
    it('likes stays empty', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual([]);
    });

    it('sets isLoading to false', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  describe('error', () => {
    it('sets isLoading to false on error', async () => {
      mockGetDoc.mockRejectedValue(new Error('permission-denied'));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('likes stays empty on error', async () => {
      mockGetDoc.mockRejectedValue(new Error('network error'));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual([]);
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetDoc.mockRejectedValue(new Error('test-error'));
      renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[useStoryLikes] Firestore error:', 'test-error');
      });
      consoleSpy.mockRestore();
    });

    it('does not throw on error', () => {
      mockGetDoc.mockRejectedValue(new Error('some error'));
      expect(() => renderHook(() => useStoryLikes(SLUG))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Slug changes
  // ---------------------------------------------------------------------------
  describe('slug changes', () => {
    it('re-fetches when slug changes', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useStoryLikes(slug),
        { initialProps: { slug: 'wedding-1' } }
      );
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      rerender({ slug: 'wedding-2' });
      expect(mockGetDoc).toHaveBeenCalledTimes(2);
    });

    it('does not re-fetch when slug stays the same', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      const { rerender } = renderHook(
        ({ slug }: { slug: string }) => useStoryLikes(slug),
        { initialProps: { slug: SLUG } }
      );
      rerender({ slug: SLUG });
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });

    it('updates likes when slug changes to a different wedding', async () => {
      const likes1 = [10, 20, 30];
      const likes2 = [100, 200, 300];
      mockGetDoc
        .mockResolvedValueOnce(createMockSnap(true, { likes: likes1 }))
        .mockResolvedValueOnce(createMockSnap(true, { likes: likes2 }));
      const { result, rerender } = renderHook(
        ({ slug }: { slug: string }) => useStoryLikes(slug),
        { initialProps: { slug: 'wedding-1' } }
      );
      await waitFor(() => expect(result.current.likes).toEqual(likes1));
      rerender({ slug: 'wedding-2' });
      await waitFor(() => expect(result.current.likes).toEqual(likes2));
    });
  });

  // ---------------------------------------------------------------------------
  // incrementLike — optimistic update
  // ---------------------------------------------------------------------------
  describe('incrementLike — optimistic update', () => {
    it('increments the like count at the given index immediately', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20, 30] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(1);
      });

      expect(result.current.likes[1]).toBe(21);
    });

    it('does not change other indices', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20, 30] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(1);
      });

      expect(result.current.likes[0]).toBe(10);
      expect(result.current.likes[2]).toBe(30);
    });

    it('increments first slide correctly', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [5, 10, 15] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(result.current.likes[0]).toBe(6);
    });

    it('increments last slide correctly', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [5, 10, 15] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(2);
      });

      expect(result.current.likes[2]).toBe(16);
    });

    it('handles multiple increments on the same slide', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20, 30] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });
      await act(async () => {
        await result.current.incrementLike(0);
      });
      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(result.current.likes[0]).toBe(13);
    });

    it('calls runTransaction with db', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20, 30] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
      expect(mockRunTransaction.mock.calls[0][0]).toEqual({ _type: 'mock-db' });
    });

    it('calls doc with story-likes collection for transaction', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      const docCalls = mockDoc.mock.calls;
      const transactionDocCall = docCalls.find(
        (call: unknown[]) => call[1] === 'story-likes' && call[2] === SLUG
      );
      expect(transactionDocCall).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // incrementLike — transaction execution
  // ---------------------------------------------------------------------------
  describe('incrementLike — transaction execution', () => {
    it('transaction callback reads the document', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20] }));
      let transactionCallback: ((transaction: unknown) => Promise<void>) | undefined;
      mockRunTransaction.mockImplementation((_db: unknown, cb: (transaction: unknown) => Promise<void>) => {
        transactionCallback = cb;
        return Promise.resolve();
      });

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      const mockTransaction = { get: vi.fn().mockResolvedValue(createMockSnap(true, { likes: [10, 20] })), update: vi.fn() };
      await transactionCallback!(mockTransaction);
      expect(mockTransaction.get).toHaveBeenCalledWith('story-likes-doc-ref');
    });

    it('transaction callback updates with incremented likes', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20] }));
      let transactionCallback: ((transaction: unknown) => Promise<void>) | undefined;
      mockRunTransaction.mockImplementation((_db: unknown, cb: (transaction: unknown) => Promise<void>) => {
        transactionCallback = cb;
        return Promise.resolve();
      });

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(1);
      });

      const mockTransaction = { get: vi.fn().mockResolvedValue(createMockSnap(true, { likes: [10, 20] })), update: vi.fn() };
      await transactionCallback!(mockTransaction);
      expect(mockTransaction.update).toHaveBeenCalledWith('story-likes-doc-ref', { likes: [10, 21] });
    });

    it('transaction callback does not update if document does not exist', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10] }));
      let transactionCallback: ((transaction: unknown) => Promise<void>) | undefined;
      mockRunTransaction.mockImplementation((_db: unknown, cb: (transaction: unknown) => Promise<void>) => {
        transactionCallback = cb;
        return Promise.resolve();
      });

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      const mockTransaction = { get: vi.fn().mockResolvedValue(createMockSnap(false)), update: vi.fn() };
      await transactionCallback!(mockTransaction);
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // incrementLike — rollback on error
  // ---------------------------------------------------------------------------
  describe('incrementLike — rollback on error', () => {
    it('rolls back optimistic update on transaction failure', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10, 20, 30] }));
      mockRunTransaction.mockRejectedValue(new Error('transaction failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(1);
      });

      expect(result.current.likes[1]).toBe(20);
      consoleSpy.mockRestore();
    });

    it('logs transaction error to console', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10] }));
      mockRunTransaction.mockRejectedValue(new Error('tx-error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useStoryLikes] Transaction error:', 'tx-error');
      consoleSpy.mockRestore();
    });

    it('rollback restores exact original value', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [42, 99] }));
      mockRunTransaction.mockRejectedValue(new Error('fail'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(result.current.likes).toEqual([42, 99]);
      consoleSpy.mockRestore();
    });

    it('does not throw on transaction error', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10] }));
      mockRunTransaction.mockRejectedValue(new Error('fail'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.incrementLike(0);
        })
      ).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('always calls getDoc once per mount', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      renderHook(() => useStoryLikes(SLUG));
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });

    it('returns consistent data after loading', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: INITIAL_LIKES }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual(INITIAL_LIKES);
      expect(result.current.isLoading).toBe(false);
    });

    it('incrementLike is stable between renders', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [10] }));
      const { result, rerender } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const fn1 = result.current.incrementLike;
      rerender();
      const fn2 = result.current.incrementLike;
      expect(fn1).toBe(fn2);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty slug', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      expect(() => renderHook(() => useStoryLikes(''))).not.toThrow();
    });

    it('handles slug with special characters', () => {
      mockGetDoc.mockResolvedValue(createMockSnap(false));
      expect(() => renderHook(() => useStoryLikes('test/special'))).not.toThrow();
    });

    it('handles likes array with single element', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [5] }));
      mockRunTransaction.mockResolvedValue(undefined);
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual([5]);

      await act(async () => {
        await result.current.incrementLike(0);
      });

      expect(result.current.likes[0]).toBe(6);
    });

    it('handles likes array with large values', async () => {
      const largeLikes = [999999, 888888];
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: largeLikes }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual(largeLikes);
    });

    it('returns empty likes without crashing when document has empty likes array', async () => {
      mockGetDoc.mockResolvedValue(createMockSnap(true, { likes: [] }));
      const { result } = renderHook(() => useStoryLikes(SLUG));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.likes).toEqual([]);
    });
  });
});
