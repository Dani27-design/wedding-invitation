import { describe, it, expect, vi } from 'vitest';
import { deleteFile } from './storage';
import { deleteObject } from 'firebase/storage';

vi.mock('./firebase-storage', () => ({
  storage: {},
}));

vi.mock('firebase/storage', async () => {
  const actual = await vi.importActual<any>('firebase/storage');
  return {
    ...actual,
    ref: vi.fn(),
    deleteObject: vi.fn(),
  };
});

describe('storage.ts', () => {
  it('should not attempt to delete local assets', async () => {
    await deleteFile('/images/local-asset.png');
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it('should attempt to delete valid Firebase Storage URLs', async () => {
    await deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png');
    expect(deleteObject).toHaveBeenCalled();
  });

  it('should handle deletion errors gracefully', async () => {
    vi.mocked(deleteObject).mockRejectedValueOnce(new Error('Not found'));
    await expect(deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png')).resolves.not.toThrow();
  });
});
