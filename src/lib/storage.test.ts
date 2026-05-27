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

  it('should return true for local assets (skipped)', async () => {
    const result = await deleteFile('/images/local-asset.png');
    expect(result).toBe(true);
  });

  it('should attempt to delete valid Firebase Storage URLs', async () => {
    await deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png');
    expect(deleteObject).toHaveBeenCalled();
  });

  it('should return true on successful deletion', async () => {
    vi.mocked(deleteObject).mockResolvedValueOnce(undefined);
    const result = await deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png');
    expect(result).toBe(true);
  });

  it('should handle deletion errors gracefully', async () => {
    vi.mocked(deleteObject).mockRejectedValueOnce(new Error('Not found'));
    await expect(deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png')).resolves.not.toThrow();
  });

  it('should return false on deletion error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(deleteObject).mockRejectedValueOnce(new Error('Permission denied'));
    const result = await deleteFile('https://firebasestorage.googleapis.com/v0/b/bucket/o/file.png');
    expect(result).toBe(false);
    spy.mockRestore();
  });

  it('should return true for empty URL', async () => {
    const result = await deleteFile('');
    expect(result).toBe(true);
  });
});
