import { ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadMetadata } from 'firebase/storage';
import { storage } from './firebase-storage';

export type UploadProgressCallback = (percent: number) => void;

export const STORAGE_UPLOAD_LIMITS = {
  image: 10 * 1024 * 1024,
  audio: 15 * 1024 * 1024,
  video: 50 * 1024 * 1024,
} as const;

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
};

export interface UploadHandle {
  promise: Promise<string>;
  cancel: () => void;
}

export interface UploadFileValidationResult {
  ok: boolean;
  contentType: string;
  message?: string;
}

function formatUploadFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`;
}

function getFileExtension(fileName: string) {
  if (!fileName.includes('.')) return '';
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function normalizeUploadContentType(file: File) {
  if (file.type) return file.type.toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[getFileExtension(file.name)] ?? '';
}

export function getUploadFileExtension(file: File, contentType = normalizeUploadContentType(file)) {
  const existing = getFileExtension(file.name);
  if (existing) return existing;

  if (contentType === 'image/jpeg') return 'jpg';
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'audio/mpeg') return 'mp3';
  if (contentType === 'audio/mp4') return 'm4a';
  if (contentType === 'video/mp4') return 'mp4';
  if (contentType === 'video/quicktime') return 'mov';

  return 'bin';
}

export function validateUploadFile(file: File): UploadFileValidationResult {
  const contentType = normalizeUploadContentType(file);
  const uploadKind = contentType.split('/')[0] as keyof typeof STORAGE_UPLOAD_LIMITS;
  const limit = STORAGE_UPLOAD_LIMITS[uploadKind];

  if (!contentType || !limit) {
    return {
      ok: false,
      contentType,
      message: `Tipe file "${file.name}" tidak didukung. Gunakan gambar, audio, atau video yang valid.`,
    };
  }

  if (file.size >= limit) {
    return {
      ok: false,
      contentType,
      message: `Ukuran "${file.name}" ${formatUploadFileSize(file.size)} melebihi batas upload ${formatUploadFileSize(limit)}.`,
    };
  }

  return { ok: true, contentType };
}

export function uploadFile(
  path: string,
  file: File,
  onProgress?: UploadProgressCallback,
  metadata?: UploadMetadata,
): UploadHandle {
  const fileRef = ref(storage, path);
  const contentType = metadata?.contentType ?? normalizeUploadContentType(file);
  const task = uploadBytesResumable(fileRef, file, { ...metadata, contentType });

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      },
    );
  });

  return { promise, cancel: () => task.cancel() };
}

export async function deleteFile(url: string): Promise<boolean> {
  if (!url) return true;
  try { if (new URL(url).hostname !== 'firebasestorage.googleapis.com') return true; } catch { return true; }
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('[Storage] Delete error:', (error as Error).message);
    return false;
  }
}
