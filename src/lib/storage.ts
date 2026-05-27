import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase-storage';

export type UploadProgressCallback = (percent: number) => void;

export interface UploadHandle {
  promise: Promise<string>;
  cancel: () => void;
}

export function uploadFile(
  path: string,
  file: File,
  onProgress?: UploadProgressCallback,
): UploadHandle {
  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(fileRef, file);

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
