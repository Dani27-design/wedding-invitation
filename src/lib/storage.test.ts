import { beforeEach, describe, it, expect, vi } from 'vitest';
import {
  deleteFile,
  getUploadFileExtension,
  normalizeUploadContentType,
  uploadFile,
  validateUploadFile,
} from './storage';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

vi.mock('./firebase-storage', () => ({
  storage: {},
}));

vi.mock('firebase/storage', async () => {
  const actual = await vi.importActual<any>('firebase/storage');
  return {
    ...actual,
    ref: vi.fn(),
    deleteObject: vi.fn(),
    getDownloadURL: vi.fn(),
    uploadBytesResumable: vi.fn(),
  };
});

describe('storage.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ref).mockReturnValue('storage-ref' as any);
  });

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

  it('infers upload content type from extension when browser omits file.type', () => {
    const file = new File(['image'], 'photo.JPG', { type: '' });
    expect(normalizeUploadContentType(file)).toBe('image/jpeg');
  });

  it('rejects unsupported files before upload', () => {
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    const result = validateUploadFile(file);

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/tidak didukung/);
  });

  it('rejects images that exceed the final Firebase Storage rule limit', () => {
    const file = new File(['image'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });

    const result = validateUploadFile(file);

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/melebihi batas upload/);
  });

  it('returns a safe extension for extensionless files from normalized content type', () => {
    const file = new File(['image'], 'upload', { type: 'image/jpeg' });
    expect(getUploadFileExtension(file)).toBe('jpg');
  });

  it('passes explicit upload metadata to Firebase Storage', async () => {
    const unsubscribe = vi.fn();
    const task = {
      cancel: vi.fn(),
      on: vi.fn((_event, next, _error, complete) => {
        next({ bytesTransferred: 1, totalBytes: 1 });
        complete();
        return unsubscribe;
      }),
      snapshot: { ref: 'uploaded-ref' },
    };
    vi.mocked(uploadBytesResumable).mockReturnValueOnce(task as any);
    vi.mocked(getDownloadURL).mockResolvedValueOnce('https://example.com/photo.jpg');

    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
    const handle = uploadFile('weddings/demo/photo.jpg', file);

    await expect(handle.promise).resolves.toBe('https://example.com/photo.jpg');
    expect(uploadBytesResumable).toHaveBeenCalledWith(
      expect.anything(),
      file,
      expect.objectContaining({ contentType: 'image/jpeg' }),
    );
  });
});
