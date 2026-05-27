interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Force output to PNG (for images needing transparency like twibbon overlays) */
  forcePng?: boolean;
}

const DEFAULTS: Required<Omit<CompressOptions, 'forcePng'>> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.92, // High quality — visually indistinguishable from original
};

/** Minimum file size to bother compressing (500KB) */
const MIN_COMPRESS_SIZE = 500 * 1024;

/**
 * Compress an image file using Canvas API.
 * - Resizes to fit within maxWidth × maxHeight (maintains aspect ratio)
 * - Converts to JPEG at target quality (or PNG if forcePng)
 * - Skips compression for files already below MIN_COMPRESS_SIZE
 * - Skips GIFs (canvas loses animation frames)
 * - Returns original file if compression produces a larger result
 */
export async function compressImage(
  file: File,
  options?: CompressOptions,
): Promise<{ file: File; wasCompressed: boolean; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  // Skip GIFs (canvas loses animation)
  if (file.type === 'image/gif') {
    return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
  }

  // Skip small files
  if (originalSize < MIN_COMPRESS_SIZE) {
    return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
  }

  const { maxWidth = DEFAULTS.maxWidth, maxHeight = DEFAULTS.maxHeight, quality = DEFAULTS.quality, forcePng = false } = options ?? {};
  const mimeType = forcePng ? 'image/png' : 'image/jpeg';

  try {
    // Load image
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // Calculate scaled dimensions (maintain aspect ratio)
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      targetWidth = Math.round(width * ratio);
      targetHeight = Math.round(height * ratio);
    }

    // Draw onto offscreen canvas
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    // Export compressed blob
    const blob = await canvas.convertToBlob({ type: mimeType, quality: forcePng ? undefined : quality });

    // If compressed is larger than original, keep original
    if (blob.size >= originalSize) {
      return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
    }

    // Build new filename
    const ext = forcePng ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const compressedFile = new File([blob], `${baseName}.${ext}`, { type: mimeType });

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSize,
      compressedSize: compressedFile.size,
    };
  } catch {
    // If compression fails, return original
    return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
  }
}

interface BatchEntry {
  key: string;
  file: File;
  options?: CompressOptions;
}

interface BatchResult {
  files: Record<string, File>;
  infos: string[];
}

/**
 * Compress multiple images in parallel with concurrency limit.
 * Calls onProgress as each file completes for progress tracking.
 */
export async function compressImageBatch(
  entries: BatchEntry[],
  onProgress: (current: number, total: number, fileName: string) => void,
  concurrency = 3,
): Promise<BatchResult> {
  const files: Record<string, File> = {};
  const infos: string[] = [];
  const total = entries.length;
  let completed = 0;
  let nextIndex = 0;

  async function processEntry(entry: BatchEntry): Promise<void> {
    const result = await compressImage(entry.file, entry.options);
    files[entry.key] = result.file;
    if (result.wasCompressed) {
      infos.push(`${entry.key}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
    }
    completed++;
    onProgress(completed, total, entry.file.name);
  }

  async function worker(): Promise<void> {
    while (nextIndex < entries.length) {
      const entry = entries[nextIndex++];
      await processEntry(entry);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, entries.length) }, () => worker());
  await Promise.all(workers);

  return { files, infos };
}

/** Format bytes to human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
