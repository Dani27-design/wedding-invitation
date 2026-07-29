import { afterEach, describe, expect, it, vi } from 'vitest';
import { compressImage, compressImageBatch, getDefaultCompressionConcurrency } from './compressImage';

describe('compressImage', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalOffscreenCanvas = globalThis.OffscreenCanvas;
  const originalImage = globalThis.Image;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.createImageBitmap = originalCreateImageBitmap;
    globalThis.OffscreenCanvas = originalOffscreenCanvas;
    globalThis.Image = originalImage;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it('falls back to regular image and canvas APIs when createImageBitmap fails', async () => {
    globalThis.createImageBitmap = vi.fn().mockRejectedValue(new Error('decode failed'));
    // @ts-expect-error test double only implements fields used by compressImage.
    globalThis.OffscreenCanvas = undefined;
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['compressed'], { type: 'image/jpeg' }));
    });

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 3000;
      naturalHeight = 2000;
      width = 3000;
      height = 2000;

      set src(_value: string) {
        this.onload?.();
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;

    const file = new File([new Uint8Array(700 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file);

    expect(result.wasCompressed).toBe(true);
    expect(result.file.type).toBe('image/jpeg');
    expect(result.file.name).toBe('large.jpg');
  });

  it('uses single-file compression concurrency on iOS mobile browsers', () => {
    const userAgentSpy = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    );

    expect(getDefaultCompressionConcurrency()).toBe(1);

    userAgentSpy.mockRestore();
  });

  it('processes batch entries with the default mobile-safe concurrency', async () => {
    const userAgentSpy = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    );
    const progress = vi.fn();
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];

    const result = await compressImageBatch([
      { key: 'a', file: files[0] },
      { key: 'b', file: files[1] },
    ], progress);

    expect(Object.keys(result.files)).toEqual(['a', 'b']);
    expect(progress).toHaveBeenCalledTimes(2);

    userAgentSpy.mockRestore();
  });
});
